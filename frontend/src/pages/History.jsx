import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/navbar";
import AnalysisResult from "../components/AnalysisResult";
import ConfirmationModal from "../components/ConfirmationModal";
import api from "../utils/api";
import { FiClock, FiSearch, FiTrash2, FiX } from "react-icons/fi";

function scoreColor(score) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-sky-400";
  return "text-amber-400";
}

function History() {
  const { theme } = useTheme();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent"); // recent | score
  const [selected, setSelected] = useState(null); // analysis object shown in modal
  const [modal, setModal] = useState({ isOpen: false, onConfirm: () => {} });

  const cardClass =
    theme === "dark"
      ? "bg-white/[0.04] border border-white/10"
      : "bg-white border border-gray-200 shadow-sm";
  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const inputClass = `w-full rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/15 border ${
    theme === "dark"
      ? "bg-white/[0.04] border-white/10 text-gray-200 placeholder-gray-600 focus:border-indigo-500/60"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
  }`;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/resume/history");
        setHistory(data.history || []);
      } catch {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deleteItem = async (id) => {
    try {
      await api.delete(`/resume/history/${id}`);
      setHistory((h) => h.filter((item) => item._id !== id));
      toast.success("Analysis deleted");
    } catch {
      toast.error("Failed to delete analysis");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/resume/history");
      setHistory([]);
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const filtered = useMemo(() => {
    let list = [...history];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.jobTitle?.toLowerCase().includes(q) ||
          i.fileName?.toLowerCase().includes(q)
      );
    }
    if (sort === "score") {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [history, query, sort]);

  // Score trend (chronological, last 12)
  const trend = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-12)
      .map((i) => i.matchScore);
  }, [history]);

  const avgScore = history.length
    ? Math.round(history.reduce((s, i) => s + i.matchScore, 0) / history.length)
    : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#0a0a0f] text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`fixed inset-0 pointer-events-none ${theme === "dark" ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)]" : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.06),_transparent)]"}`} />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${primaryText}`}>
                Analysis History
              </h1>
              <p className={`text-sm mt-1 ${secondaryText}`}>
                {history.length} analysis{history.length !== 1 ? "es" : ""} · avg score {avgScore}%
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setModal({ isOpen: true, onConfirm: clearAll })}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all duration-200 border font-medium ${
                  theme === "dark"
                    ? "border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                    : "border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                }`}
              >
                <FiTrash2 /> Clear All
              </button>
            )}
          </div>

          {/* Trend chart */}
          {trend.length > 1 && (
            <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 mb-6`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${secondaryText}`}>Score Trend</p>
              <div className="flex items-end gap-2 h-28">
                {trend.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5">
                    <span className={`text-[10px] font-semibold ${scoreColor(s)}`}>{s}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                      style={{ height: `${Math.max(6, s)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + sort */}
          {history.length > 0 && (
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${secondaryText}`} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by job title or file name..."
                  className={inputClass}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={`rounded-xl px-4 py-2.5 outline-none border transition-all focus:ring-2 focus:ring-indigo-500/15 ${
                  theme === "dark"
                    ? "bg-white/[0.04] border-white/10 text-gray-200 focus:border-indigo-500/60"
                    : "bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
                }`}
              >
                <option value="recent">Most Recent</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className={`rounded-2xl ${cardClass} p-16 flex flex-col items-center gap-4`}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className={secondaryText}>Loading your history…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed ${theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                <FiClock className="w-6 h-6 text-indigo-400" />
              </div>
              <p className={`font-medium ${primaryText}`}>
                {history.length === 0 ? "No analyses yet" : "No results match your search"}
              </p>
              <p className={`text-sm mt-1 ${secondaryText}`}>
                {history.length === 0 ? "Run your first resume analysis from the Dashboard." : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                    theme === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${primaryText}`}>{item.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.fileName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-2xl font-bold ${scoreColor(item.matchScore)}`}>{item.matchScore}%</p>
                      <p className="text-xs text-gray-400">{item.recommendation}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setSelected(item.analysis)}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-200 border font-medium ${
                        theme === "dark"
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setModal({ isOpen: true, onConfirm: () => deleteItem(item._id) })}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-200 border font-medium ${
                        theme === "dark"
                          ? "border-white/10 text-gray-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm fade-in" onClick={() => setSelected(null)}>
          <div className="min-h-screen py-10 px-4 flex justify-center">
            <div
              className={`relative w-full max-w-2xl rounded-2xl p-5 sm:p-6 h-fit ${theme === "dark" ? "bg-[#0a0a0f] border border-white/10" : "bg-gray-100 border border-gray-200"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-lg flex items-center justify-center transition ${
                  theme === "dark" ? "bg-white/5 text-gray-300 hover:bg-white/10" : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`}
                aria-label="Close"
              >
                <FiX />
              </button>
              <AnalysisResult analysis={selected} />
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        title="Delete Analysis"
        description="Are you sure? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}

export default History;