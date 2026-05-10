import { motion as Motion } from "framer-motion";
import useCountUp from "../../../hooks/useCountUp";

const StatCard = ({ title, value, prefix = "", suffix = "", iconClass }) => {
  const animatedValue = useCountUp(value, 1400);

  return (
    <Motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-300">{title}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-slate-100">
          <i className={iconClass} aria-hidden="true" />
        </span>
      </div>
      <p className="text-2xl font-bold text-white sm:text-3xl">
        {prefix}{animatedValue.toLocaleString()}{suffix}
      </p>
    </Motion.div>
  );
};

const StatsGrid = ({ stats }) => {
  const items = [
    { key: "totalDonations", title: "Total Donations", value: Math.round(stats.totalDonations || 0), prefix: "INR ", iconClass: "bi bi-currency-rupee" },
    { key: "activeCampaigns", title: "Active Campaigns", value: Math.round(stats.activeCampaigns || 0), iconClass: "bi bi-megaphone" },
    { key: "livesImpacted", title: "Lives Impacted", value: Math.round(stats.livesImpacted || 0), iconClass: "bi bi-heart-pulse" },
    { key: "verifiedNgos", title: "Verified NGOs", value: Math.round(stats.verifiedNgos || 0), iconClass: "bi bi-patch-check" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.key} title={item.title} value={item.value} prefix={item.prefix} suffix={item.suffix} iconClass={item.iconClass} />
      ))}
    </div>
  );
};

export default StatsGrid;
