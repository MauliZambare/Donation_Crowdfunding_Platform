import { motion as Motion } from "framer-motion";

const blobs = [
  { id: 1, className: "left-[8%] top-16 h-56 w-56 bg-cyan-500/30", delay: 0 },
  { id: 2, className: "right-[10%] top-32 h-72 w-72 bg-violet-500/25", delay: 0.2 },
  { id: 3, className: "left-[30%] bottom-20 h-64 w-64 bg-emerald-500/25", delay: 0.35 },
  { id: 4, className: "right-[35%] bottom-8 h-48 w-48 bg-rose-500/20", delay: 0.5 },
];

const AnimatedBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-mesh" aria-hidden="true" />
    {blobs.map((blob) => (
      <Motion.div
        key={blob.id}
        className={`absolute rounded-full blur-3xl ${blob.className}`}
        initial={{ scale: 0.9, opacity: 0.4 }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 20, 0],
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.3, 0.45, 0.32, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: blob.delay,
        }}
      />
    ))}
  </div>
);

export default AnimatedBackground;
