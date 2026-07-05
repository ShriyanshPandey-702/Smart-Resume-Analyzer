import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import ConfirmationModal from "./ConfirmationModal";
import {
  FiSun,
  FiMoon,
  FiLogOut,
  FiHome,
  FiClock,
  FiUser,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome, end: true },
  { to: "/history", label: "History", icon: FiClock },
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get("/auth/me")
      .then((r) => active && setUser(r.data.user))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const doLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkBase =
    "flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors duration-200";

  const linkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
        : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
    }`;

  const iconBtn =
    "flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors duration-200 border border-[var(--hairline)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]";

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--hairline)] bg-[var(--bg)]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/Hirely_icon.png" alt="" className="h-8 w-8 object-contain" />
              <span className="font-display font-semibold tracking-tight text-lg hidden sm:block text-[var(--ink)]">
                Hirely
              </span>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className={iconBtn} aria-label="Toggle theme">
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>

              <button
                onClick={() => setLogoutOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors duration-200 border border-[var(--hairline)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]"
              >
                <FiLogOut />
                <span className="hidden lg:inline">Logout</span>
              </button>

              {/* Profile avatar */}
              <NavLink
                to="/profile"
                title="Profile"
                aria-label="Profile"
                className={({ isActive }) =>
                  `w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                    isActive
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                      : "border-[var(--hairline)] hover:border-[var(--accent)]"
                  }`
                }
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] w-full h-full flex items-center justify-center">
                    {initials}
                  </span>
                )}
              </NavLink>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className={`md:hidden ${iconBtn}`}
                aria-label="Menu"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-1 fade-in-up">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLogoutOpen(true);
                }}
                className={`${linkBase} text-[var(--danger)] hover:bg-[var(--surface-2)]`}
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>

      <ConfirmationModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        isDestructive={true}
        onConfirm={doLogout}
      />
    </>
  );
}

export default Navbar;
