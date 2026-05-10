import { motion as Motion } from "framer-motion";

const NgoPartnerLogos = ({ partners }) => (
  <div className="glass-card overflow-hidden py-5">
    <Motion.div
      className="flex gap-8 px-6"
      animate={{ x: [0, -460] }}
      transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
    >
      {[...partners, ...partners].map((partner, index) => (
        <div key={`${partner}-${index}`} className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/90">
          {partner}
        </div>
      ))}
    </Motion.div>
  </div>
);

export default NgoPartnerLogos;
