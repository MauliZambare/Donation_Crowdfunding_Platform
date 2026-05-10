import { motion as Motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const iconVariants = {
  light: { rotate: 0, scale: 1 },
  dark: { rotate: 180, scale: 1.1 },
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="relative h-10 w-20 rounded-full border border-white/20 bg-white/10 p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
      onClick={toggleTheme}
    >
      <Motion.span
        className="absolute inset-y-1 left-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-900 shadow-lg"
        animate={{ x: theme === "dark" ? 40 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Motion.span
          animate={theme}
          variants={iconVariants}
          transition={{ duration: 0.25 }}
          className="text-sm"
          aria-hidden="true"
        >
          <i className={theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill"} />
        </Motion.span>
      </Motion.span>
      <span className="sr-only">Current theme {theme}</span>
    </button>
  );
};

export default ThemeToggle;
