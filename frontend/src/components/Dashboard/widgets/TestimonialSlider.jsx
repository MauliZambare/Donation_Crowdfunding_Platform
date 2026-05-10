import { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";

const TestimonialSlider = ({ stories }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % stories.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [stories.length]);

  const story = stories[active];

  return (
    <div className="glass-card p-6">
      <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-300">Donor Stories</p>

      <div className="relative min-h-40">
        <AnimatePresence mode="wait">
          <Motion.div
            key={story.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32 }}
          >
            <p className="text-lg leading-relaxed text-slate-100">"{story.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <img src={story.avatar} alt={story.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
              <div>
                <p className="font-medium text-slate-100">{story.name}</p>
                <p className="text-sm text-slate-400">{story.location}</p>
              </div>
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-2">
        {stories.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`h-2.5 rounded-full transition ${active === index ? "w-8 bg-cyan-300" : "w-2.5 bg-white/30"}`}
            aria-label={`Go to testimonial ${index + 1}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
