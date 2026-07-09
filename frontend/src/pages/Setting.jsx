import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser, useClerk, useReverification } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/navbar";
import ConfirmationModal from "../components/ConfirmationModal";
import api from "../utils/api";
import { FiSun, FiMoon, FiTrash2, FiUserX, FiShield } from "react-icons/fi";

function Section({ title, cardClass, secondaryText, children }) {
  return (
    <div className={`${cardClass} p-6 mb-6`}>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${secondaryText}`}>{title}</h2>
      {children}
    </div>
  );
}

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const navigate = useNavigate();

  // Deleting an account is a sensitive op — Clerk requires step-up (re)verification.
  // useReverification shows that prompt automatically, then runs the delete.
  const deleteUser = useReverification(() => user.delete());

  const [modal, setModal] = useState({ isOpen: false, title: "", description: "", confirmText: "", onConfirm: () => {} });

  const cardClass = "card";
  const primaryText = "text-[var(--ink)]";
  const secondaryText = "text-[var(--muted)]";

  const openModal = (config) => setModal({ ...config, isOpen: true });
  const closeModal = () => setModal((m) => ({ ...m, isOpen: false }));

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
          // Clear our own data first (session still valid), then delete the Clerk user
          // (the Clerk webhook also cleans up analyses on user.deleted).
          await api.delete("/resume/history").catch(() => {});
          await deleteUser();
          toast.success("Account deleted");
          // Hard redirect to the landing page (avoids the ProtectedRoute
          // bouncing to /sign-in once the session is gone).
          window.location.href = "/";
        } catch (error) {
          // User cancelling the verification also lands here — keep it quiet-ish
          if (error?.message !== "reverification-cancelled") {
            toast.error(
              error?.errors?.[0]?.longMessage ||
                error?.errors?.[0]?.message ||
                "Failed to delete account"
            );
          }
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className={`font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-6 ${primaryText}`}>Settings</h1>

          {/* Appearance */}
          <Section title="Appearance" cardClass={cardClass} secondaryText={secondaryText}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${primaryText}`}>Theme</p>
                <p className={`text-sm ${secondaryText}`}>Switch between light and dark mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] transition-colors border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--accent)]"
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </Section>

          {/* Account & Security (Clerk) */}
          <Section title="Account & Security" cardClass={cardClass} secondaryText={secondaryText}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className={`font-medium ${primaryText}`}>Email, password & sign-in methods</p>
                <p className={`text-sm ${secondaryText}`}>Manage your email, password, and connected Google / GitHub accounts.</p>
              </div>
              <button
                onClick={() => openUserProfile()}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium border border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              >
                <FiShield /> Manage account
              </button>
            </div>
          </Section>

          {/* Danger zone */}
          <div className="rounded-[var(--radius)] p-6 border" style={{ borderColor: "var(--danger)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--danger)" }}>Danger Zone</h2>

            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className={`font-medium ${primaryText}`}>Clear Analysis History</p>
                <p className={`text-sm ${secondaryText}`}>Delete all your saved analyses.</p>
              </div>
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]"
              >
                <FiTrash2 /> Clear History
              </button>
            </div>

            <div className="border-t my-4 border-[var(--hairline)]" />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className={`font-medium ${primaryText}`}>Delete Account</p>
                <p className={`text-sm ${secondaryText}`}>Permanently remove your account and data.</p>
              </div>
              <button
                onClick={deleteAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium text-white transition-colors hover:brightness-110"
                style={{ background: "var(--danger)" }}
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
