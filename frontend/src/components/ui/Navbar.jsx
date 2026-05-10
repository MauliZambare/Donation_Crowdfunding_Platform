import { Link, NavLink, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import RippleButton from "./RippleButton";
import useI18n from "../../hooks/useI18n";

const navItemClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`;

const Navbar = ({ user, onLogout }) => {
  const { t } = useI18n();
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/"].includes(location.pathname);

  return (
    <Motion.header
      className="sticky top-0 z-40 border-b border-white/10 bg-black/25 backdrop-blur-xl"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link to={user ? (user.userType?.toLowerCase() === "ngo" ? "/Dashboard/Ngo" : "/Dashboard/Home") : "/login"} className="group inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/40">
            DH
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-100">{t("brand")}</p>
            <p className="text-xs text-slate-400">AI Crowdfunding</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {user && user.userType?.toLowerCase() === "donor" && (
            <>
              <NavLink to="/Dashboard/Home" className={navItemClass}>{t("donorDashboard")}</NavLink>
              <NavLink to="/payment" className={navItemClass}>Donate</NavLink>
              <NavLink to="/Dashboard/Admin" className={navItemClass}>{t("adminDashboard")}</NavLink>
            </>
          )}
          {user && user.userType?.toLowerCase() === "ngo" && (
            <>
              <NavLink to="/Dashboard/Ngo" className={navItemClass}>{t("ngoDashboard")}</NavLink>
              <NavLink to="/Dashboard/Admin" className={navItemClass}>{t("adminDashboard")}</NavLink>
            </>
          )}
          {!user && !isAuthPage && <NavLink to="/login" className={navItemClass}>{t("login")}</NavLink>}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <RippleButton
              className="bg-white/10 text-sm text-white hover:bg-white/20"
              onClick={onLogout}
              aria-label="Logout"
            >
              {t("logout")}
            </RippleButton>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:brightness-110"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </nav>
    </Motion.header>
  );
};

export default Navbar;
