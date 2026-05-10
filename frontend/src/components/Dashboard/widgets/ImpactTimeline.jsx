import { motion as Motion } from "framer-motion";

const ImpactTimeline = ({ milestones }) => (
  <div className="glass-card p-6">
    <h3 className="mb-5 text-lg font-semibold text-slate-100">Impact Timeline</h3>
    <ol className="relative border-l border-cyan-400/40 pl-5">
      {milestones.map((milestone, index) => (
        <Motion.li
          key={milestone.title}
          className="mb-7"
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: index * 0.08 }}
        >
          <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border border-cyan-300 bg-cyan-500/40" />
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">{milestone.date}</p>
          <h4 className="mt-1 font-semibold text-slate-100">{milestone.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{milestone.description}</p>
        </Motion.li>
      ))}
    </ol>
  </div>
);

export default ImpactTimeline;
