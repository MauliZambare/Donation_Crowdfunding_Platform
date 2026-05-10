import { useState } from "react";
import { motion as Motion } from "framer-motion";

const RippleButton = ({ children, className = "", onClick, type = "button", ...props }) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((item) => item.id !== id));
    }, 550);

    if (typeof onClick === "function") {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className={`group relative isolate overflow-hidden rounded-xl px-4 py-2 font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${className}`}
      onClick={createRipple}
      {...props}
    >
      {ripples.map((ripple) => (
        <Motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/30"
          initial={{ opacity: 0.6, scale: 0 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default RippleButton;
