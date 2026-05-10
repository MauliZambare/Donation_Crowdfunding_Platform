import { useEffect, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function useCountUp(target = 0, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return value;
}
