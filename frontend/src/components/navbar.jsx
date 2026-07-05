import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
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
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/history", label: "History", icon: FiClock },
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const shell =
    theme === "dark"
      ? "bg-[#0a0a0f]/80 border-white/10"
      : "bg-white/80 border-gray-200";

  const linkBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";

  const linkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? theme === "dark"
          ? "bg-white/10 text-white"
          : "bg-indigo-50 text-indigo-700"
        : theme === "dark"
        ? "text-gray-400 hover:text-white hover:bg-white/5"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  const iconBtn = `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
    theme === "dark"
      ? "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/10"
      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
  }`;

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${shell}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <span className="text-indigo-400 text-lg">📄</span>
              </div>
              <span className={`font-bold tracking-tight hidden sm:block ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Resume Analyzer
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
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  theme === "dark"
                    ? "bg-white/[0.04] border-white/10 text-gray-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                    : "bg-white border-gray-300 text-gray-700 hover:border-red-500/50 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <FiLogOut />
                <span className="hidden lg:inline">Logout</span>
              </button>

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
            <nav className="md:hidden pb-4 flex flex-col gap-1 fade-in">
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
                className={`${linkBase} ${
                  theme === "dark"
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-red-600 hover:bg-red-50"
                }`}
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