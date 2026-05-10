import { motion as Motion } from "framer-motion";

const TopDonorsLeaderboard = ({ donors }) => (
  <div className="glass-card p-5">
    <h3 className="mb-4 text-lg font-semibold text-slate-100">Top Supporters of the Month</h3>
    <ul className="space-y-3">
      {donors.map((donor, index) => (
        <Motion.li
          key={donor.name}
          className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2"
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
        >
          <div className="flex items-center gap-3">
            <img src={donor.avatar} alt={donor.name} className="h-9 w-9 rounded-full object-cover" loading="lazy" />
            <div>
              <p className="text-sm font-medium text-slate-100">{donor.name}</p>
              <p className="text-xs text-slate-400">Level {donor.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-cyan-200">INR {donor.amount.toLocaleString()}</p>
            <p className="text-xs text-amber-300">+{donor.xp} XP</p>
          </div>
        </Motion.li>
      ))}
    </ul>
  </div>
);

export default TopDonorsLeaderboard;
