import { NavLink } from "react-router-dom";

const MobileBottomNav = ({ user }) => {
  if (!user) return null;
  const type = user.userType?.toLowerCase();
  const links = type === "ngo"
    ? [
      { to: "/Dashboard/Ngo", label: "NGO", icon: "bi bi-buildings" },
      { to: "/payment", label: "Donate", icon: "bi bi-heart" },
      { to: "/Dashboard/Admin", label: "Admin", icon: "bi bi-speedometer2" },
    ]
    : [
      { to: "/Dashboard/Home", label: "Home", icon: "bi bi-house" },
      { to: "/payment", label: "Donate", icon: "bi bi-heart" },
      { to: "/Dashboard/Admin", label: "Admin", icon: "bi bi-speedometer2" },
    ];

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/15 bg-black/45 px-2 py-2 shadow-2xl backdrop-blur-lg md:hidden">
      <ul className="grid grid-cols-3 gap-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs transition ${isActive ? "bg-cyan-500/25 text-cyan-200" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
              }
              aria-label={link.label}
            >
              <i className={`${link.icon} text-base`} aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileBottomNav;
