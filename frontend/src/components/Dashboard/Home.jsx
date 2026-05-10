import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCampaigns, getSocialPostCaptions } from "../../services/api";
import useI18n from "../../hooks/useI18n";
import { usePlatform } from "../../context/PlatformContext";
import CampaignCard from "./widgets/CampaignCard";
import StatsGrid from "./widgets/StatsGrid";
import TopDonorsLeaderboard from "./widgets/TopDonorsLeaderboard";
import TestimonialSlider from "./widgets/TestimonialSlider";
import ImpactTimeline from "./widgets/ImpactTimeline";
import NgoPartnerLogos from "./widgets/NgoPartnerLogos";
import DonationMap from "./widgets/DonationMap";
import LiveDonationTicker from "./widgets/LiveDonationTicker";
import SectionHeading from "../ui/SectionHeading";
import RippleButton from "../ui/RippleButton";
import { EmptyState, ErrorState, SkeletonCampaignGrid } from "../ui/StateViews";

const categories = ["all", "education", "healthcare", "environment", "community", "animals"];

const testimonialStories = [
  {
    name: "Meera Shah",
    location: "Pune",
    quote: "I donated in under 60 seconds and instantly got my receipt. The transparency dashboard made me trust the platform.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Akshay Verma",
    location: "Delhi",
    quote: "The AI recommendations helped me find causes matching my values. It feels personalized and meaningful.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Neha Kulkarni",
    location: "Mumbai",
    quote: "I loved the real-time updates and impact timeline. It made me feel connected to each campaign outcome.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
];

const topDonors = [
  {
    name: "Aarav Singh",
    amount: 125000,
    xp: 240,
    level: 12,
    avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=240&q=80",
  },
  {
    name: "Sana Khan",
    amount: 98000,
    xp: 210,
    level: 10,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  },
  {
    name: "Dev Patel",
    amount: 84500,
    xp: 184,
    level: 9,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  },
  {
    name: "Ira Joshi",
    amount: 70200,
    xp: 165,
    level: 8,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  },
];

const timelineMilestones = [
  {
    date: "Jan 2026",
    title: "10,000 meals funded",
    description: "Community kitchen campaigns crossed a major impact milestone.",
  },
  {
    date: "Mar 2026",
    title: "120 rural classrooms supported",
    description: "Education-focused NGOs completed infrastructure upgrades and supplied smart kits.",
  },
  {
    date: "Apr 2026",
    title: "Healthcare emergency network expanded",
    description: "Donor contributions powered remote medicine deliveries in 24 districts.",
  },
];

const initialDiscussion = [
  {
    id: "seed-1",
    user: "Anita",
    text: "Let us organize a volunteer meetup for education campaigns this weekend.",
    timestamp: Date.now() - 3600000,
    reactions: { like: 5, fire: 2, support: 3 },
  },
  {
    id: "seed-2",
    user: "Rahul",
    text: "Can NGOs share weekly expense breakdowns in campaign updates?",
    timestamp: Date.now() - 7200000,
    reactions: { like: 2, fire: 1, support: 4 },
  },
];

const Home = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    impactStats,
    gamification,
    favorites,
    followedNgos,
    toggleFollowNgo,
  } = usePlatform();

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [discussionText, setDiscussionText] = useState("");
  const [discussion, setDiscussion] = useState(() => {
    try {
      const stored = localStorage.getItem("communityDiscussion");
      return stored ? JSON.parse(stored) : initialDiscussion;
    } catch {
      return initialDiscussion;
    }
  });
  const [shareCounts, setShareCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shareCounts") || "{}");
    } catch {
      return {};
    }
  });

  const persistDiscussion = (nextDiscussion) => {
    localStorage.setItem("communityDiscussion", JSON.stringify(nextDiscussion));
    setDiscussion(nextDiscussion);
  };

  const persistShareCounts = (next) => {
    localStorage.setItem("shareCounts", JSON.stringify(next));
    setShareCounts(next);
  };

  const fetchCampaignList = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getCampaigns();
      const payload = Array.isArray(response.data) ? response.data : [];
      setCampaigns(payload);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || fetchError.message || "Unable to fetch campaigns");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaignList();
  }, [fetchCampaignList]);

  const filteredCampaigns = useMemo(() => {
    if (selectedCategory === "all") {
      return campaigns;
    }
    return campaigns.filter((campaign) => {
      const source = `${campaign.title || ""} ${campaign.description || ""}`.toLowerCase();
      return source.includes(selectedCategory);
    });
  }, [campaigns, selectedCategory]);

  const trendingCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => (b.raisedAmount || 0) / Math.max(1, b.targetAmount || 1) - (a.raisedAmount || 0) / Math.max(1, a.targetAmount || 1))
      .slice(0, 5);
  }, [campaigns]);

  const activeCampaigns = campaigns.filter((campaign) => (campaign.status || "active") !== "closed").length;

  const stats = useMemo(
    () => ({
      totalDonations: impactStats.totalDonations,
      activeCampaigns,
      livesImpacted: impactStats.livesImpacted,
      verifiedNgos: impactStats.verifiedNgos,
    }),
    [impactStats, activeCampaigns]
  );

  const aiRecommendations = useMemo(() => {
    const favoritesSet = new Set(favorites);
    const recommended = campaigns
      .filter((campaign) => !favoritesSet.has(campaign.id))
      .sort((a, b) => (b.targetAmount - (b.raisedAmount || 0)) - (a.targetAmount - (a.raisedAmount || 0)))
      .slice(0, 3);

    return recommended;
  }, [campaigns, favorites]);

  const handleDonate = (campaignId, campaignTitle) => {
    navigate("/payment", {
      state: {
        campaignId,
        campaignTitle,
        userId: user?.id,
      },
    });
  };

  const handleShareRequest = async (campaignId) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    if (!campaign) return;

    try {
      const { data } = await getSocialPostCaptions(campaignId);
      const caption = data?.instagram || data?.twitter || data?.whatsapp;
      if (!caption) {
        throw new Error("Caption is unavailable right now.");
      }
      await navigator.clipboard.writeText(caption);
      toast.success("AI caption generated and copied.");
      const next = {
        ...shareCounts,
        [campaignId]: (shareCounts[campaignId] || 0) + 1,
      };
      persistShareCounts(next);
    } catch (shareError) {
      toast.error(shareError.message || "Unable to generate caption.");
    }
  };

  const addDiscussion = () => {
    if (!discussionText.trim()) return;

    const next = [{
      id: `comment-${Date.now()}`,
      user: user?.name || "Anonymous",
      text: discussionText.trim(),
      timestamp: Date.now(),
      reactions: { like: 0, fire: 0, support: 0 },
    }, ...discussion];

    persistDiscussion(next.slice(0, 40));
    setDiscussionText("");
    toast.success("Comment posted to community discussion.");
  };

  const reactDiscussion = (commentId, emoji) => {
    const next = discussion.map((item) => {
      if (item.id !== commentId) return item;
      return {
        ...item,
        reactions: {
          ...item.reactions,
          [emoji]: (item.reactions?.[emoji] || 0) + 1,
        },
      };
    });
    persistDiscussion(next);
  };

  const ngoList = useMemo(() => {
    const unique = new Map();
    campaigns.forEach((campaign) => {
      const name = campaign.ngoName || "Campaign Organizer";
      if (!unique.has(name)) {
        unique.set(name, campaign);
      }
    });
    return Array.from(unique.entries()).slice(0, 6).map(([name, campaign]) => ({
      name,
      campaignCount: campaigns.filter((item) => (item.ngoName || "Campaign Organizer") === name).length,
      raised: Math.round(campaigns
        .filter((item) => (item.ngoName || "Campaign Organizer") === name)
        .reduce((sum, item) => sum + (item.raisedAmount || 0), 0)),
      imageUrl: campaign.imageUrl,
    }));
  }, [campaigns]);

  const partners = ngoList.map((ngo) => ngo.name);

  return (
    <div className="space-y-10">
      <section className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 wave-divider opacity-70" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-200">
              AI-Powered Giving Platform
            </p>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight text-slate-100 sm:text-5xl">
              {t("heroTitle")} <span className="gradient-text">with transparency.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">{t("heroSubtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RippleButton
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                onClick={() => document.getElementById("campaign-grid")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Campaigns
              </RippleButton>
              <RippleButton className="bg-white/10 text-slate-100 hover:bg-white/20" onClick={() => navigate("/payment")}>Quick Donate</RippleButton>
            </div>
          </div>

          <div className="surface-card space-y-3 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Your Impact Snapshot</h3>
            <p className="text-2xl font-bold text-white">Level {gamification.level}</p>
            <p className="text-sm text-slate-300">{gamification.xp} XP | {gamification.streak} day streak</p>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-slate-400">Badges Unlocked</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {gamification.badges.length > 0
                  ? gamification.badges.map((badge) => (
                    <span key={badge.id} className="rounded-full bg-cyan-500/20 px-2 py-1 text-cyan-100">{badge.icon} {badge.title}</span>
                  ))
                  : <span className="text-slate-400">Donate to unlock your first badge.</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveDonationTicker campaigns={campaigns} />

      <StatsGrid stats={stats} />

      <section>
        <SectionHeading
          eyebrow={t("trendingCampaigns")}
          title="Trending Campaigns Carousel"
          subtitle="Campaigns with strong momentum and urgent needs are highlighted here."
        />

        <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {trendingCampaigns.map((campaign) => (
            <Motion.div
              key={`trending-${campaign.id}`}
              className="min-w-[280px] max-w-[300px] snap-start rounded-2xl border border-white/15 bg-white/5 p-4"
              whileHover={{ y: -4 }}
            >
              <img
                src={campaign.imageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80"}
                alt={campaign.title}
                className="h-36 w-full rounded-xl object-cover"
                loading="lazy"
              />
              <h3 className="mt-3 line-clamp-1 text-base font-semibold text-slate-100">{campaign.title}</h3>
              <p className="mt-1 text-sm text-slate-300">INR {(campaign.raisedAmount || 0).toLocaleString()} raised</p>
              <button type="button" className="mt-3 text-sm text-cyan-200 underline underline-offset-4" onClick={() => handleDonate(campaign.id, campaign.title)}>
                Open Campaign
              </button>
            </Motion.div>
          ))}
        </div>
      </section>

      <section id="campaign-grid">
        <SectionHeading
          eyebrow="Discovery"
          title="Browse Campaigns by Category"
          subtitle="Filter causes and discover where your donation can create immediate impact."
          action={(
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${selectedCategory === category ? "bg-cyan-500 text-slate-900" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        />

        {isLoading && <SkeletonCampaignGrid />}

        {!isLoading && error && (
          <ErrorState
            description={error}
            onRetry={fetchCampaignList}
          />
        )}

        {!isLoading && !error && filteredCampaigns.length === 0 && (
          <EmptyState
            title="No campaigns available"
            description="Try another category or check back soon for new campaigns."
          />
        )}

        {!isLoading && !error && filteredCampaigns.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={handleDonate}
                onShareRequest={handleShareRequest}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <TopDonorsLeaderboard donors={topDonors} />

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Campaign Sharing Analytics</h3>
          {Object.keys(shareCounts).length === 0 ? (
            <p className="text-sm text-slate-300">No AI caption shares yet. Share a campaign to build social reach analytics.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(shareCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([campaignId, count]) => {
                  const campaign = campaigns.find((item) => item.id === campaignId);
                  return (
                    <li key={campaignId} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                      <span className="line-clamp-1 max-w-[70%] text-slate-200">{campaign?.title || "Campaign"}</span>
                      <span className="font-semibold text-cyan-200">{count} shares</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <TestimonialSlider stories={testimonialStories} />
        <ImpactTimeline milestones={timelineMilestones} />
      </section>

      {partners.length > 0 && (
        <section>
          <SectionHeading title="Verified NGO Partners" subtitle="Our ecosystem of trusted nonprofit partners." />
          <NgoPartnerLogos partners={partners} />
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <DonationMap />

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Follow NGOs</h3>
          <div className="space-y-3">
            {ngoList.map((ngo) => {
              const followed = followedNgos.includes(ngo.name);
              return (
                <div key={ngo.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{ngo.name}</p>
                    <p className="text-xs text-slate-400">{ngo.campaignCount} campaigns | INR {ngo.raised.toLocaleString()} raised</p>
                  </div>
                  <button
                    type="button"
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${followed ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}
                    onClick={() => toggleFollowNgo(ngo.name)}
                  >
                    {followed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">AI Smart Recommendations</h3>
          <p className="mb-4 text-sm text-slate-300">Based on your favorites and giving pattern, these campaigns are likely to match your impact intent.</p>
          <div className="space-y-3">
            {aiRecommendations.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                className="w-full rounded-xl bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                onClick={() => handleDonate(campaign.id, campaign.title)}
              >
                <p className="text-sm font-medium text-slate-100">{campaign.title}</p>
                <p className="text-xs text-slate-400">Suggested for your profile | {Math.round(((campaign.raisedAmount || 0) / Math.max(1, campaign.targetAmount || 1)) * 100)}% funded</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Community Discussion</h3>
          <div className="flex gap-2">
            <input
              value={discussionText}
              onChange={(event) => setDiscussionText(event.target.value)}
              placeholder="Share your idea with the donor community..."
              className="focus-ring w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-400"
              aria-label="Discussion input"
            />
            <button
              type="button"
              onClick={addDiscussion}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Post
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {discussion.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">{item.user}</p>
                  <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  {[
                    { key: "like", label: "Like" },
                    { key: "fire", label: "Fire" },
                    { key: "support", label: "Support" },
                  ].map((reaction) => (
                    <button
                      key={reaction.key}
                      type="button"
                      className="rounded-full bg-white/10 px-2 py-1 text-slate-200 hover:bg-white/20"
                      onClick={() => reactDiscussion(item.id, reaction.key)}
                    >
                      {reaction.label} {item.reactions?.[reaction.key] || 0}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
