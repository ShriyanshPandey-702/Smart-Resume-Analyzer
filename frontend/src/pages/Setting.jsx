import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/navbar";
import ConfirmationModal from "../components/ConfirmationModal";
import api from "../utils/api";
import { FiSun, FiMoon, FiLock, FiEye, FiEyeOff, FiTrash2, FiUserX } from "react-icons/fi";

function Section({ title, cardClass, secondaryText, children }) {
  return (
    <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 mb-6`}>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${secondaryText}`}>{title}</h2>
      {children}
    </div>
  );
}

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [changing, setChanging] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", description: "", confirmText: "", onConfirm: () => {} });

  const cardClass =
    theme === "dark"
      ? "bg-white/[0.04] border border-white/10"
      : "bg-white border border-gray-200 shadow-sm";
  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const inputClass = `w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/15 border ${
    theme === "dark"
      ? "bg-white/[0.04] border-white/10 text-gray-200 placeholder-gray-600 focus:border-indigo-500/60"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
  }`;

  const openModal = (config) => setModal({ ...config, isOpen: true });
  const closeModal = () => setModal((m) => ({ ...m, isOpen: false }));

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  const clearHistory = () => {
    openModal({
      title: "Clear All History",
      description: "This will permanently delete all of your saved analyses. This action cannot be undone.",
      confirmText: "Clear All",
      onConfirm: async () => {
        try {
          await api.delete("/resume/history");
          toast.success("History cleared");
        } catch {
          toast.error("Failed to clear history");
        }
      },
    });
  };

  const deleteAccount = () => {
    openModal({
      title: "Delete Account",
      description: "This will permanently delete your account and all associated data. This action cannot be undone.",
      confirmText: "Delete Account",
      onConfirm: async () => {
        try {
          await api.delete("/auth/delete-account");
          localStorage.removeItem("token");
          toast.success("Account deleted successfully");
          navigate("/login");
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete account");
        }
      },
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#0a0a0f] text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`fixed inset-0 pointer-events-none ${theme === "dark" ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)]" : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.06),_transparent)]"}`} />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 ${primaryText}`}>Settings</h1>

          {/* Appearance */}
          <Section title="Appearance" cardClass={cardClass} secondaryText={secondaryText}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${primaryText}`}>Theme</p>
                <p className={`text-sm ${secondaryText}`}>Switch between light and dark mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                }`}
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </Section>

          {/* Security */}
          <Section title="Security" cardClass={cardClass} secondaryText={secondaryText}>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  placeholder="Current password"
                  className={`pr-12 ${inputClass}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${secondaryText} hover:opacity-80`}
                >
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                placeholder="New password"
                className={inputClass}
                required
              />
              <input
                type={showPw ? "text" : "password"}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                placeholder="Confirm new password"
                className={inputClass}
                required
              />
              <button
                type="submit"
                disabled={changing}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiLock />
                {changing ? "Updating…" : "Change Password"}
              </button>
            </form>
          </Section>

          {/* Danger zone */}
          <div className={`rounded-2xl backdrop-blur-sm p-6 ${theme === "dark" ? "bg-red-500/[0.04] border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-5 text-red-400">Danger Zone</h2>

            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className={`font-medium ${primaryText}`}>Clear Analysis History</p>
                <p className={`text-sm ${secondaryText}`}>Delete all your saved analyses.</p>
              </div>
              <button
                onClick={clearHistory}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  theme === "dark"
                    ? "border-white/10 text-gray-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                    : "border-gray-300 text-gray-700 hover:border-red-500/50 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <FiTrash2 /> Clear History
              </button>
            </div>

            <div className={`border-t my-4 ${theme === "dark" ? "border-white/10" : "border-red-200"}`} />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className={`font-medium ${primaryText}`}>Delete Account</p>
                <p className={`text-sm ${secondaryText}`}>Permanently remove your account and data.</p>
              </div>
              <button
                onClick={deleteAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
              >
                <FiUserX /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        description={modal.description}
        confirmText={modal.confirmText}
        isDestructive={true}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}

export default Settings;