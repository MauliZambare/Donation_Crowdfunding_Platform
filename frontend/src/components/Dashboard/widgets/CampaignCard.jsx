import { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import { usePlatform } from "../../../context/PlatformContext";
import useI18n from "../../../hooks/useI18n";
import RippleButton from "../../ui/RippleButton";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469571486292-b53601020fcd?auto=format&fit=crop&w=1400&q=80";

const sampleAvatarUrls = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
];

const categories = ["healthcare", "education", "environment", "animals", "community"];

const CampaignCard = ({ campaign, onDonate, onShareRequest }) => {
  const { favorites, toggleFavorite } = usePlatform();
  const { t } = useI18n();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const category = useMemo(() => detectCategory(campaign), [campaign]);
  const progress = useMemo(() => {
    if (!campaign?.targetAmount) return 0;
    return Math.min(100, Math.round(((campaign.raisedAmount || 0) / campaign.targetAmount) * 100));
  }, [campaign]);

  const daysRemaining = useMemo(() => {
    if (!campaign?.deadline) return 30;
    const deadline = new Date(campaign.deadline).getTime();
    const now = Date.now();
    const diff = deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [campaign]);

  const urgencyBadges = useMemo(() => {
    const badges = [t("verified")];
    if (daysRemaining <= 7) badges.push(t("endingSoon"));
    if (progress < 35 && daysRemaining <= 14) badges.push(t("urgent"));
    return badges;
  }, [daysRemaining, progress, t]);

  const imageUrl = normalizeImageUrl(campaign?.imageUrl || campaign?.image || FALLBACK_IMAGE);
  const isFavorite = favorites.includes(campaign.id);

  const onMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = (x - centerX) / 18;
    const rotateX = (centerY - y) / 18;
    setTilt({ rotateX, rotateY });
  };

  const onMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const share = async (network) => {
    const baseText = `${campaign.title} | INR ${Math.round(campaign.raisedAmount || 0)} raised`;
    const pageUrl = `${window.location.origin}/Dashboard/Home?campaignId=${campaign.id}`;

    if (network === "instagram") {
      const copied = await copyToClipboard(`${baseText}\n${pageUrl}`);
      toast.info(copied ? "Caption copied for Instagram." : "Copy the caption manually.");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      return;
    }

    if (network === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${baseText}\n${pageUrl}`)}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (network === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${baseText} ${pageUrl}`)}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (network === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (network === "ai" && typeof onShareRequest === "function") {
      onShareRequest(campaign.id);
    }
  };

  return (
    <Motion.article
      className="tilt-card group glass-card overflow-hidden"
      style={{ transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={campaign.title || "Campaign"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur-md">{category}</span>
          <button
            type="button"
            className={`grid h-9 w-9 place-items-center rounded-full border ${isFavorite ? "border-rose-400 bg-rose-500/30 text-rose-100" : "border-white/30 bg-black/25 text-white"}`}
            aria-label="Toggle favorite"
            onClick={() => toggleFavorite(campaign.id)}
          >
            <i className={`bi ${isFavorite ? "bi-bookmark-heart-fill" : "bi-bookmark"}`} />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {urgencyBadges.map((badge) => (
            <span key={badge} className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 backdrop-blur-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-100">{campaign.title}</h3>
          <p className="line-clamp-2 pt-1 text-sm text-slate-300">{campaign.description}</p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>INR {Math.round(campaign.raisedAmount || 0).toLocaleString()} raised</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <Motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Goal INR {Math.round(campaign.targetAmount || 0).toLocaleString()}</span>
            <span>{daysRemaining} days left</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {sampleAvatarUrls.slice(0, 4).map((url, idx) => (
              <img
                key={`${campaign.id}-${idx}`}
                src={url}
                alt="Recent donor"
                className="h-8 w-8 rounded-full border border-slate-900 object-cover"
                loading="lazy"
              />
            ))}
          </div>
          <span className="text-xs text-slate-300">{Math.round((campaign.donors || progress / 3) + 12)} supporters</span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-sm">
          <button type="button" className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20" onClick={() => share("whatsapp")} aria-label="Share to WhatsApp"><i className="bi bi-whatsapp" /></button>
          <button type="button" className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20" onClick={() => share("instagram")} aria-label="Share to Instagram"><i className="bi bi-instagram" /></button>
          <button type="button" className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20" onClick={() => share("x")} aria-label="Share to X"><i className="bi bi-twitter-x" /></button>
          <button type="button" className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20" onClick={() => share("linkedin")} aria-label="Share to LinkedIn"><i className="bi bi-linkedin" /></button>
          <button type="button" className="rounded-lg bg-white/10 p-2 text-slate-200 hover:bg-white/20" onClick={() => share("ai")} aria-label="Generate AI caption"><i className="bi bi-stars" /></button>
        </div>

        <RippleButton
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110"
          onClick={() => onDonate(campaign.id, campaign.title)}
        >
          {t("donateNow")}
        </RippleButton>
      </div>
    </Motion.article>
  );
};

function detectCategory(campaign) {
  const text = `${campaign?.title || ""} ${campaign?.description || ""}`.toLowerCase();
  return categories.find((category) => text.includes(category)) || "community";
}

function normalizeImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
}

async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default CampaignCard;
