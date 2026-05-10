import { motion as Motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
};

const PageTransition = ({ children }) => (
  <Motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8"
  >
    {children}
  </Motion.div>
);

export default PageTransition;
