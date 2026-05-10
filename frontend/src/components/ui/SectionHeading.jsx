import { motion as Motion } from "framer-motion";

const SectionHeading = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>}
      <Motion.h2
        className="text-2xl font-semibold text-slate-100 sm:text-3xl"
        initial={{ y: 16, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        {title}
      </Motion.h2>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-300">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeading;
