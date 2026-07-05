import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  FiSun,
  FiMoon,
  FiArrowRight,
  FiTarget,
  FiZap,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

const features = [
  {
    icon: FiTarget,
    title: "ATS Match Score",
    body: "Instant 0–100 compatibility scoring for any resume against any job description.",
  },
  {
    icon: FiZap,
    title: "Skill Gap Analysis",
    body: "See matched and missing skills and keywords at a glance — no guesswork.",
  },
  {
    icon: FiTrendingUp,
    title: "Recruiter Insights",
    body: "AI reasoning, candidate strengths, and specific, actionable suggestions.",
  },
  {
    icon: FiFileText,
    title: "Shareable Reports",
    body: "Download a polished PDF report and track every analysis in your history.",
  },
];

const steps = [
  { n: "1", title: "Upload a resume", body: "Drag and drop a PDF, or pick from your device." },
  { n: "2", title: "Add the job", body: "Paste a job description or choose a prebuilt template." },
  { n: "3", title: "Get the match", body: "Receive an ATS score and recruiter-grade breakdown in seconds." },
];

function Landing() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--hairline)] bg-[var(--bg)]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/Hirely_icon.png" alt="" className="h-8 w-8 object-contain" />
            <span className="font-display font-semibold tracking-tight text-lg text-[var(--ink)]">Hirely</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center border border-[var(--hairline)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>
            {isAuthed ? (
              <Link
                to="/dashboard"
                className="btn-accent px-4 py-2 text-sm font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-[var(--radius)] text-sm font-semibold border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link to="/signup" className="btn-accent px-4 py-2 text-sm font-semibold hidden sm:inline-flex">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 text-center">
        <img
          src="/Hirely_lockup.png"
          alt="Hirely — precision recruitment matching"
          className="w-full max-w-[260px] sm:max-w-xs mx-auto mb-8"
        />

        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-5 text-[var(--ink)] text-balance">
          Match every résumé to the job — instantly.
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-10">
          Hirely reads a resume against any job description with Google Gemini AI and returns an
          ATS-style score, matched and missing skills, and recruiter-grade recommendations in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthed ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-accent px-7 py-3.5 font-semibold text-sm inline-flex items-center gap-2"
            >
              Go to Dashboard <FiArrowRight />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/signup")}
                className="btn-accent px-7 py-3.5 font-semibold text-sm inline-flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Get started free <FiArrowRight />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3.5 rounded-[var(--radius)] font-semibold text-sm border border-[var(--hairline)] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card card-hover p-6">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1.5 text-[var(--ink)]">{title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)]">
            Three steps to a hire-ready read
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="card card-hover p-6">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold font-mono mb-4">
                {s.n}
              </span>
              <h3 className="font-display text-lg font-semibold mb-1.5 text-[var(--ink)]">{s.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="card p-10 sm:p-14 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight mb-4 text-[var(--ink)] text-balance">
            Stop guessing. Start matching.
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto mb-8">
            Create a free account and run your first resume analysis in under a minute.
          </p>
          <button
            onClick={() => navigate(isAuthed ? "/dashboard" : "/signup")}
            className="btn-accent px-8 py-3.5 font-semibold text-sm inline-flex items-center gap-2"
          >
            {isAuthed ? "Go to Dashboard" : "Get started free"} <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <img src="/Hirely_icon.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-display font-semibold text-[var(--ink)]">Hirely</span>
          </div>
          <p className="text-xs text-[var(--faint)] font-mono">
            AI-powered ATS analysis · Built with React · Express · Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
