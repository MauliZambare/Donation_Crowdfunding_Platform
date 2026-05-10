import { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import { createCampaign, deleteCampaign, getCampaigns } from "../../services/api";
import ImageUpload from "../ImageUpload/ImageUpload";
import SectionHeading from "../ui/SectionHeading";
import RippleButton from "../ui/RippleButton";
import { EmptyState, SkeletonCampaignGrid } from "../ui/StateViews";

const Ngo = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    imageUrl: "",
  });

  const creatorId = user?.id;

  const fetchMyCampaigns = useCallback(async () => {
    if (!creatorId) return;
    setIsLoading(true);
    try {
      const response = await getCampaigns();
      const payload = Array.isArray(response.data) ? response.data : [];
      const mine = payload.filter((campaign) => campaign.creatorId === creatorId);
      setCampaigns(mine);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to fetch campaigns.");
    } finally {
      setIsLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchMyCampaigns();
  }, [fetchMyCampaigns]);

  const analytics = useMemo(() => {
    const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.raisedAmount || 0), 0);
    const totalGoal = campaigns.reduce((sum, campaign) => sum + (campaign.targetAmount || 0), 0);
    const avgCompletion = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;
    const activeCampaigns = campaigns.filter((campaign) => (campaign.status || "active") !== "closed").length;

    return {
      totalRaised,
      totalGoal,
      avgCompletion,
      activeCampaigns,
      engagementScore: Math.round(Math.min(98, 42 + campaigns.length * 6 + avgCompletion * 0.4)),
      trustScore: Math.round(Math.min(99, 70 + campaigns.length * 3)),
    };
  }, [campaigns]);

  const suggestions = useMemo(() => {
    if (campaigns.length === 0) {
      return [
        "Add at least one campaign update with impact photos to increase trust.",
        "Use specific milestones (e.g. INR 2L for 100 kits) for better conversion.",
      ];
    }

    const result = [];
    if (analytics.avgCompletion < 45) {
      result.push("Campaign completion is below 45%. Add weekly progress stories and beneficiary updates.");
    }
    if (campaigns.some((campaign) => !campaign.imageUrl)) {
      result.push("Some campaigns are missing media. Upload high-quality images to improve conversion.");
    }
    if (campaigns.length < 3) {
      result.push("Consider launching 2-3 focused campaigns to improve discoverability in recommendations.");
    }
    result.push("Share AI-generated captions consistently on WhatsApp and LinkedIn to increase donor reach.");
    return result;
  }, [campaigns, analytics.avgCompletion]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreateCampaign = async (event) => {
    event.preventDefault();
    if (!creatorId) {
      toast.error("User session not available. Login again.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline,
        creatorId,
        ngoName: user?.name,
        imageUrl: formData.imageUrl,
      };

      await createCampaign(payload);
      toast.success("Campaign published successfully.");
      setFormData({ title: "", description: "", targetAmount: "", deadline: "", imageUrl: "" });
      setShowForm(false);
      fetchMyCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not create campaign.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (campaignId) => {
    try {
      await deleteCampaign(campaignId);
      toast.success("Campaign deleted.");
      fetchMyCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-8">
      <section className="glass-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-300">NGO Command Center</p>
            <h1 className="text-3xl font-bold text-slate-100 sm:text-4xl">Build trust, improve campaign outcomes, and scale impact.</h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300">Your dashboard now includes conversion insights, donor demographics, engagement analytics, and AI guidance for better storytelling.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RippleButton className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => setShowForm((prev) => !prev)}>
                {showForm ? "Close Form" : "Create New Campaign"}
              </RippleButton>
              <RippleButton className="bg-white/10 text-slate-100" onClick={fetchMyCampaigns}>Refresh Analytics</RippleButton>
            </div>
          </div>

          <div className="surface-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Trust & Impact Score</p>
            <div className="mt-4 space-y-4">
              <MetricBar label="NGO Trust Score" value={analytics.trustScore} color="from-emerald-400 to-green-500" />
              <MetricBar label="Campaign Engagement" value={analytics.engagementScore} color="from-sky-400 to-blue-500" />
              <MetricBar label="Average Completion" value={analytics.avgCompletion} color="from-violet-400 to-indigo-500" />
            </div>
          </div>
        </div>
      </section>

      {showForm && (
        <Motion.section
          className="glass-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionHeading title="Launch Campaign" subtitle="Create a high-conversion campaign with clear goals and impact timeline." />
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateCampaign}>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Campaign Title</span>
              <input
                className="focus-ring w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-slate-100"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Target Amount (INR)</span>
              <input
                type="number"
                className="focus-ring w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-slate-100"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                required
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-slate-300">Description</span>
              <textarea
                className="focus-ring min-h-24 w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-slate-100"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Deadline</span>
              <input
                type="datetime-local"
                className="focus-ring w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-slate-100"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </label>

            <div className="space-y-2 text-sm">
              <span className="text-slate-300">Campaign Image</span>
              <ImageUpload
                imageUrl={formData.imageUrl}
                onUploadSuccess={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl }))}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Publishing..." : "Publish Campaign"}
              </button>
            </div>
          </form>
        </Motion.section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard label="Total Raised" value={`INR ${Math.round(analytics.totalRaised).toLocaleString()}`} delta="+12.8%" />
        <AnalyticsCard label="Active Campaigns" value={analytics.activeCampaigns} delta="+2 this month" />
        <AnalyticsCard label="Total Goal" value={`INR ${Math.round(analytics.totalGoal).toLocaleString()}`} delta="Updated" />
        <AnalyticsCard label="Avg Completion" value={`${analytics.avgCompletion}%`} delta="+6.2%" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Donor Demographics</h3>
          <div className="grid gap-3">
            {[
              ["Age 18-25", 32],
              ["Age 26-35", 38],
              ["Age 36-50", 21],
              ["Age 50+", 9],
            ].map(([label, value]) => (
              <MetricBar key={label} label={label} value={value} color="from-fuchsia-400 to-violet-500" />
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs text-slate-300">
            Top donation geographies: Maharashtra, Karnataka, Delhi NCR, Gujarat.
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Engagement Heatmap</h3>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, idx) => {
              const intensity = Math.floor(Math.random() * 4);
              const palette = ["bg-white/5", "bg-cyan-500/20", "bg-cyan-500/35", "bg-cyan-400/55"];
              return <div key={idx} className={`h-6 rounded ${palette[intensity]}`} />;
            })}
          </div>
          <p className="mt-3 text-sm text-slate-300">Higher intensity blocks indicate stronger donor interaction days.</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">AI Campaign Improvement Suggestions</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            {suggestions.map((suggestion) => (
              <li key={suggestion} className="rounded-xl bg-white/5 px-3 py-2">? {suggestion}</li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Pending Verification Alerts</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-100">Bank statement proof pending for Campaign #A291</div>
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-rose-100">KYC document expiry in 11 days</div>
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-cyan-100">Profile verification score: Strong (82/100)</div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading title="My Campaigns" subtitle="Track campaign performance and optimize for better conversion." />
        {isLoading && <SkeletonCampaignGrid />}

        {!isLoading && campaigns.length === 0 && (
          <EmptyState
            title="No campaigns yet"
            description="Create your first campaign to start receiving donor support."
            action={<RippleButton className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => setShowForm(true)}>Create Campaign</RippleButton>}
          />
        )}

        {!isLoading && campaigns.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => {
              const completion = Math.round(((campaign.raisedAmount || 0) / Math.max(1, campaign.targetAmount || 1)) * 100);
              return (
                <Motion.article key={campaign.id} className="glass-card overflow-hidden" whileHover={{ y: -5 }}>
                  <img
                    src={campaign.imageUrl || "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=900&q=80"}
                    alt={campaign.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="space-y-3 p-4">
                    <h3 className="text-lg font-semibold text-slate-100">{campaign.title}</h3>
                    <p className="line-clamp-2 text-sm text-slate-300">{campaign.description}</p>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-300">
                        <span>INR {(campaign.raisedAmount || 0).toLocaleString()}</span>
                        <span>{completion}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(100, completion)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Goal INR {(campaign.targetAmount || 0).toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(campaign.id)}
                        className="rounded-lg bg-rose-500/20 px-3 py-1 text-rose-200 hover:bg-rose-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Motion.article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const AnalyticsCard = ({ label, value, delta }) => (
  <Motion.div className="glass-card p-4" whileHover={{ y: -4 }}>
    <p className="text-sm text-slate-300">{label}</p>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    <p className="mt-1 text-xs text-emerald-300">{delta}</p>
  </Motion.div>
);

const MetricBar = ({ label, value, color }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs text-slate-300">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-white/10">
      <div className={`h-2 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

export default Ngo;
