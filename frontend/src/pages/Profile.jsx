import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/navbar";
import api from "../utils/api";
import { FiUser, FiMail, FiCalendar, FiSave, FiFileText, FiTrendingUp, FiAward, FiTarget, FiCamera } from "react-icons/fi";

function StatCard({ icon: Icon, label, value, cardClass, secondaryText, primaryText }) {
  return (
    <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <span className={`text-xs font-medium ${secondaryText}`}>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${primaryText}`}>{value}</p>
    </div>
  );
}

function Profile() {
  const { theme } = useTheme();

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "" });

  const cardClass =
    theme === "dark"
      ? "bg-white/[0.04] border border-white/10"
      : "bg-white border border-gray-200 shadow-sm";
  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const inputClass = `w-full rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/15 border ${
    theme === "dark"
      ? "bg-white/[0.04] border-white/10 text-gray-200 placeholder-gray-600 focus:border-indigo-500/60"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
  }`;

  useEffect(() => {
    (async () => {
      try {
        const [me, hist] = await Promise.all([
          api.get("/auth/me"),
          api.get("/resume/history"),
        ]);
        setUser(me.data.user);
        setForm({ name: me.data.user.name, email: me.data.user.email });
        setHistory(hist.data.history || []);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    if (history.length === 0) {
      return { total: 0, avg: 0, best: 0, topRole: "—" };
    }
    const total = history.length;
    const avg = Math.round(history.reduce((s, i) => s + i.matchScore, 0) / total);
    const best = Math.max(...history.map((i) => i.matchScore));
    const counts = {};
    history.forEach((i) => {
      counts[i.jobTitle] = (counts[i.jobTitle] || 0) + 1;
    });
    const topRole = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return { total, avg, best, topRole };
  }, [history]);

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      setUser(data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3 MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const { data } = await api.post("/auth/avatar", formData);
      setUser(data.user);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#0a0a0f] text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`fixed inset-0 pointer-events-none ${theme === "dark" ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)]" : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.06),_transparent)]"}`} />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 ${primaryText}`}>Profile</h1>

          {loading ? (
            <div className={`rounded-2xl ${cardClass} p-16 flex flex-col items-center gap-4`}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className={secondaryText}>Loading profile…</p>
            </div>
          ) : (
            <>
              {/* Identity card */}
              <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 mb-6 flex items-center gap-5`}>
                <div className="relative flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "Avatar"}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl font-bold">
                      {initials}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-input"
                  />
                  <label
                    htmlFor="avatar-input"
                    title="Change photo"
                    className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border-2 ${
                      theme === "dark"
                        ? "bg-indigo-600 border-[#0a0a0f] text-white hover:bg-indigo-500"
                        : "bg-indigo-600 border-gray-100 text-white hover:bg-indigo-700"
                    } ${uploadingAvatar ? "opacity-70 cursor-wait" : ""}`}
                  >
                    {uploadingAvatar ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <FiCamera className="w-3.5 h-3.5" />
                    )}
                  </label>
                </div>
                <div className="min-w-0">
                  <p className={`text-xl font-bold truncate ${primaryText}`}>{user?.name}</p>
                  <p className={`text-sm truncate ${secondaryText}`}>{user?.email}</p>
                  {user?.createdAt && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <FiCalendar className="w-3 h-3" />
                      Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard icon={FiFileText} label="Analyses" value={stats.total} cardClass={cardClass} secondaryText={secondaryText} primaryText={primaryText} />
                <StatCard icon={FiTrendingUp} label="Avg Score" value={`${stats.avg}%`} cardClass={cardClass} secondaryText={secondaryText} primaryText={primaryText} />
                <StatCard icon={FiAward} label="Best Score" value={`${stats.best}%`} cardClass={cardClass} secondaryText={secondaryText} primaryText={primaryText} />
                <StatCard icon={FiTarget} label="Top Role" value={stats.topRole} cardClass={cardClass} secondaryText={secondaryText} primaryText={primaryText} />
              </div>

              {/* Edit form */}
              <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${secondaryText}`}>Edit Details</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="relative">
                    <FiUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${secondaryText}`} />
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${secondaryText}`} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email address"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave />
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;