import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/navbar";
import UploadCard from "../components/compare/UploadCard";
import CompareResult from "../components/compare/CompareResult";
import api from "../utils/api";
import { downloadComparePDF } from "../utils/generateComparePDF";
import { FiGitPullRequest, FiClock, FiArrowRight } from "react-icons/fi";

const MODES = [
  { value: "general", label: "General ATS Comparison" },
  { value: "swe", label: "Software Engineer" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "fullstack", label: "Full Stack" },
  { value: "datascience", label: "Data Science" },
  { value: "ml", label: "Machine Learning" },
  { value: "uiux", label: "UI / UX" },
  { value: "pm", label: "Product Manager" },
  { value: "devops", label: "DevOps" },
  { value: "security", label: "Cyber Security" },
];

const LOADING_STEPS = [
  "Extracting Resume A…",
  "Extracting Resume B…",
  "Analyzing ATS…",
  "Comparing Skills…",
  "Evaluating Formatting…",
  "Finding Missing Keywords…",
  "Generating AI Insights…",
  "Almost Done…",
];

export default function Compare() {
  const [type, setType] = useState("resume-vs-resume"); // or "old-vs-updated"
  const [mode, setMode] = useState("general");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null); // { comparison, fileA, fileB }
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  const isVersion = type === "old-vs-updated";
  const labelA = isVersion ? "Old Résumé" : "Résumé A";
  const labelB = isVersion ? "Updated Résumé" : "Résumé B";

  const fetchHistory = () => {
    api.get("/compare/history").then((r) => setHistory(r.data.history || [])).catch(() => {});
  };
  useEffect(() => { fetchHistory(); }, []);

  // Loading step cycle
  useEffect(() => {
    if (!loading) { setStep(0); return; }
    let i = 0;
    const t = setInterval(() => {
      i = Math.min(i + 1, LOADING_STEPS.length - 1);
      setStep(i);
    }, 1400);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!loading && result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, result]);

  const handleCompare = async () => {
    if (!fileA || !fileB) {
      toast.error("Please upload both resumes.");
      return;
    }
    setResult(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("resumeA", fileA);
      fd.append("resumeB", fileB);
      fd.append("mode", mode);
      fd.append("type", type);
      const { data } = await api.post("/compare", fd);
      if (data.success) {
        setResult({ comparison: data.comparison, fileA: data.fileA, fileB: data.fileB });
        fetchHistory();
      } else {
        toast.error(data.message || "Comparison failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reopen = async (id) => {
    try {
      const { data } = await api.get(`/compare/${id}`);
      if (data.success) {
        setResult({ comparison: data.comparison, fileA: data.fileA, fileB: data.fileB });
      }
    } catch {
      toast.error("Failed to open comparison");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result.comparison, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hirely-comparison.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectClass =
    "w-full rounded-[var(--radius)] px-4 py-3 outline-none transition-colors duration-200 bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] focus:border-[var(--accent)]";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-10 sm:pb-24">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex w-14 h-14 rounded-[var(--radius)] bg-[var(--accent-soft)] items-center justify-center mb-4">
              <FiGitPullRequest className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)] mb-3">
              AI Resume Comparison
            </h1>
            <p className="text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Compare two resumes side-by-side using AI. Discover which performs better for recruiters, ATS
              systems, keyword optimization, formatting, and technical strength.
            </p>
          </div>

          {!result && (
            <>
              {/* Comparison type toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex p-1 rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--surface-2)]">
                  {[
                    { v: "resume-vs-resume", l: "Resume vs Resume" },
                    { v: "old-vs-updated", l: "Old vs Updated" },
                  ].map((t) => (
                    <button
                      key={t.v}
                      onClick={() => setType(t.v)}
                      className={`px-4 py-2 rounded-[calc(var(--radius)-2px)] text-sm font-medium transition-colors ${
                        type === t.v ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 1 — uploads */}
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <UploadCard id="resume-a" title={labelA} badge="A" file={fileA} onFile={setFileA} onRemove={() => setFileA(null)} />
                <UploadCard id="resume-b" title={labelB} badge="B" file={fileB} onFile={setFileB} onRemove={() => setFileB(null)} />
              </div>

              {/* Section 2 — settings */}
              <div className="card p-6 sm:p-8 mb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block eyebrow mb-2">Comparison mode</label>
                    <select value={mode} onChange={(e) => setMode(e.target.value)} className={selectClass}>
                      {MODES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block eyebrow mb-2">Compare against</label>
                    <select disabled className={`${selectClass} opacity-70 cursor-not-allowed`}>
                      <option>Industry Best Practices</option>
                    </select>
                    <p className="text-xs text-[var(--faint)] mt-1.5">Comparing against job descriptions is coming soon.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 — compare button */}
              <button
                onClick={handleCompare}
                disabled={loading || !fileA || !fileB}
                className="btn-accent w-full py-4 px-6 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Comparing…" : <>Compare Resumes <FiArrowRight /></>}
              </button>

              {/* Loading */}
              {loading && (
                <div className="card p-12 flex flex-col items-center gap-5 mt-6 fade-in-up">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--hairline)]" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <div className="text-center w-full max-w-sm">
                    <p className="font-semibold text-[var(--ink)]">{LOADING_STEPS[step]}</p>
                    <div className="w-full bg-[var(--surface-2)] rounded-full h-2 mt-4 overflow-hidden">
                      <div className="bg-[var(--accent)] h-2 rounded-full transition-all duration-700" style={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }} />
                    </div>
                    <p className="text-xs text-[var(--faint)] mt-2">Analyzing both resumes with AI…</p>
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="card p-6 mt-8">
                  <p className="eyebrow mb-4">Recent comparisons</p>
                  <div className="space-y-2">
                    {history.slice(0, 6).map((h) => (
                      <button
                        key={h._id}
                        onClick={() => reopen(h._id)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-[var(--radius)] border border-[var(--hairline)] hover:border-[var(--accent)] transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--ink)] truncate">
                            {h.fileA} <span className="text-[var(--faint)]">vs</span> {h.fileB}
                          </p>
                          <p className="text-xs text-[var(--faint)] mt-0.5 flex items-center gap-1.5">
                            <FiClock className="w-3 h-3" />
                            {new Date(h.createdAt).toLocaleDateString()} · winner {h.winner}
                          </p>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-[var(--muted)] flex-shrink-0">
                          <span style={{ color: "var(--cmp-a)" }}>{h.scoreA}%</span> · <span style={{ color: "var(--cmp-b)" }}>{h.scoreB}%</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Results */}
          {result && (
            <div ref={resultRef}>
              <CompareResult
                data={result.comparison}
                fileA={result.fileA}
                fileB={result.fileB}
                onReset={() => { setResult(null); setFileA(null); setFileB(null); }}
                onDownloadPdf={() => downloadComparePDF(result.comparison, { fileA: result.fileA, fileB: result.fileB, mode })}
                onDownloadJson={downloadJson}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
