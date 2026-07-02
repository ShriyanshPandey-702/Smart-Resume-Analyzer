import { useState, useEffect } from "react";
import axios from "axios";

const loadingSteps = [
  "📄 Uploading Resume...",
  "📖 Extracting Resume Text...",
  "📝 Reading Job Description...",
  "🤖 Comparing Resume with Job Description...",
  "📊 Calculating Match Score...",
  "✨ Preparing Recruiter Report..."
  ];

function App() {

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult(null);
  };

  const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  setDragActive(false);

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    setSelectedFile(e.dataTransfer.files[0]);
    setResult(null);
  }
  };

  const handleUpload = async () => {

    if (!selectedFile) {
      alert("Please select a resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    setResult(null);
    setLoadingStep(0);
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);

    try {

      const response = await axios.post(
        "http://localhost:5001/api/resume/upload",
        formData
      );

      setResult(response.data);

    } catch (error) {

      console.error(error);

      if (error.response) {
        setResult({
          error: true,
          message: error.response.data.message,
        });
      } else {
        setResult({
          error: true,
          message: "Something went wrong.",
        });
      }

    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {

  if (!loading) {
    setLoadingStep(0);
    return;
  }

  let current = 0;

  const interval = setInterval(() => {
    current++;
    if (current < loadingSteps.length) {
      setLoadingStep(current);
    }
  }, 1200);
  return () => clearInterval(interval);
  }, [loading]);


  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const circumference = 339.29;
  const score = result?.analysis?.matchScore ?? 0;
  const scoreOffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 90
      ? {
          stroke: "#10b981",
          text: "text-emerald-400",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        }
      : score >= 70
      ? {
          stroke: "#38bdf8",
          text: "text-sky-400",
          badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        }
      : {
          stroke: "#f59e0b",
          text: "text-amber-400",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 sm:py-24">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Recruiter Assistant
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent mb-4 leading-tight">
            Smart Resume<br />Analyzer
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Upload a resume and paste a job description to receive an AI-powered candidate match analysis.
          </p>
        </div>

        {/* Upload */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 sm:p-8 mb-6">

          <label
            htmlFor="resume-input"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 w-full border-2 border-dashed rounded-xl p-8 sm:p-10 cursor-pointer transition-all duration-300 group 
            ${dragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03]"}`}
          >
            <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg
                className={`w-7 h-7 transition-colors duration-300 ${
                    dragActive
                        ? "text-cyan-400"
                        : "text-gray-400 group-hover:text-white"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12L8 8m4-4l4 4"
                />
              </svg>
            </div>

            {selectedFile ? (
              <div className="text-center">
                <p className="text-white font-medium text-sm break-all">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatFileSize(selectedFile.size)} · Click to change
                </p>
              </div>
            ) : (
              <div className="text-center">

                {dragActive ? (
                  <>
                    <p className="text-lg font-semibold text-cyan-400">
                      📄 Drag & Drop Resume Here
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      Release to upload
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 text-sm">
                      📄 Drop Resume Here
                    </p>

                    <p className="text-white text-sm mt-2">
                      or Click to Upload
                    </p>

                    <p className="text-gray-600 text-xs mt-3">
                      Supports PDF, DOC, DOCX
                    </p>
                  </>
                )}

              </div>
            )}

            <input
              id="resume-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

        </div>

        {/* Job Description */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 sm:p-8 mb-6">

          {/* Card header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Job Description</h2>
              <p className="text-xs text-gray-500 mt-0.5">Paste the complete job description for comparison.</p>
            </div>
          </div>

          {/* Textarea wrapper */}
          <div className="relative group">
            <textarea
              id="job-description-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — required skills, responsibilities, qualifications..."
              rows={8}
              maxLength={5000}
              className="
                w-full resize-none rounded-xl
                bg-white/[0.04] border border-white/10
                text-gray-300 placeholder-gray-600
                text-sm leading-relaxed
                px-4 py-3.5
                outline-none
                transition-all duration-200
                focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/15
                hover:border-white/20
              "
            />
            {/* Character counter */}
            <span className="absolute bottom-3 right-3.5 text-[11px] text-gray-600 pointer-events-none select-none tabular-nums">
              {jobDescription.length} / 5000
            </span>
          </div>

        </div>

        {/* Analyze button — sits below both inputs */}
        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile || !jobDescription.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] active:translate-y-0 mb-6"
        >
          {loading ? "Processing..." : "Analyze Match →"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-12 flex flex-col items-center gap-5 fade-in-up">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">
                  {loadingSteps[loadingStep]}
              </p>

              <p className="text-gray-500 text-sm mt-2">
                  Please wait while our AI recruiter analyzes the candidate profile.
              </p>

              <div className="w-full bg-white/10 rounded-full h-2 mt-6 overflow-hidden">
                  <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                      style={{
                          width: `${((loadingStep + 1) / loadingSteps.length) * 100}%`
                      }}
                  />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                  Step {loadingStep + 1} of {loadingSteps.length}
              </p>

            </div>
          </div>
        )}

        {/* Error */}
        {!loading && result?.error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-6 flex items-start gap-4 fade-in-up">
            <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <div>
              <p className="text-red-400 font-semibold text-sm">Analysis Failed</p>
              <p className="text-red-300/70 text-sm mt-1">{result.message}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result?.success && result.analysis && (
          <div className="space-y-5 fade-in-up">

            {/* ATS Score */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-8">
              <div className="flex flex-col items-center gap-5">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Match Score
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${scoreColor.badge}`}>
                    {result.analysis.recommendation}
                  </span>
                </div>

                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke={scoreColor.stroke}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      className="score-ring-animate"
                      style={{ "--score-offset": scoreOffset }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${scoreColor.text}`}>{score}</span>
                    <span className="text-gray-500 text-xs mt-0.5">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            {result.analysis.matchedSkills?.length > 0 && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Matched Skills</h2>
                </div>
                <ul className="space-y-2.5">
                  {result.analysis.matchedSkills.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills */}
            {result.analysis.missingSkills?.length > 0 && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Missing Skills</h2>
                </div>
                <ul className="space-y-2.5">
                  {result.analysis.missingSkills.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Candidate Strengths */}
            {result.analysis.strengths?.length > 0 && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Candidate Strengths</h2>
                </div>
                <ul className="space-y-2.5">
                  {result.analysis.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gaps */}
            {result.analysis.skillGaps?.length > 0 && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Skill Gaps</h2>
                </div>
                <ul className="space-y-2.5">
                  {result.analysis.skillGaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            {result.analysis.reasoning && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gray-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reasoning</h2>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{result.analysis.reasoning}</p>
              </div>
            )}

            {/* Suggestions */}
            {result.analysis.suggestions?.length > 0 && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Suggestions</h2>
                </div>
                <ul className="space-y-2.5">
                  {result.analysis.suggestions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        <p className="text-center text-gray-700 text-xs mt-14">
          Built with React • Express • Tailwind CSS • Gemini AI
        </p>

      </div>
    </div>
  );
}

export default App;