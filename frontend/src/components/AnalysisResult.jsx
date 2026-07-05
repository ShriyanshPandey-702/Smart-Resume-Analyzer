import { useTheme } from "../context/ThemeContext";
import { downloadAnalysisPDF } from "../utils/generatePDF";

// Renders a full AI analysis breakdown (score ring + all sections + PDF download).
// Reused by the Dashboard (fresh result) and the History page (past result).
function AnalysisResult({ analysis }) {
  const { theme } = useTheme();

  if (!analysis) return null;

  const cardClass =
    theme === "dark"
      ? "bg-white/[0.04] border border-white/10"
      : "bg-white border border-gray-200 shadow-sm";

  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

  const circumference = 339.29;
  const score = analysis.matchScore ?? 0;
  const scoreOffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 90
      ? { stroke: "#10b981", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
      : score >= 70
      ? { stroke: "#38bdf8", text: "text-sky-400", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" }
      : { stroke: "#f59e0b", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" };

  return (
    <div className="space-y-5 fade-in-up">
      {/* ATS Score */}
      <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-8`}>
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Match Score</p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${scoreColor.badge}`}>
              {analysis.recommendation}
            </span>
          </div>

          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
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

      {/* Download Report */}
      <div className="flex justify-center">
        <button
          onClick={() => downloadAnalysisPDF(analysis)}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-indigo-500/30"
        >
          📄 Download PDF Report
        </button>
      </div>

      {/* Matched Skills */}
      {analysis.matchedSkills?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Matched Skills</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.matchedSkills.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Skills */}
      {analysis.missingSkills?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Missing Skills</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.missingSkills.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Keywords */}
      {analysis.matchedKeywords?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">✓</div>
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Matched Keywords</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {analysis.missingKeywords?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">✕</div>
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Missing Keywords</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Strengths */}
      {analysis.strengths?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Candidate Strengths</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.strengths.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skill Gaps */}
      {analysis.skillGaps?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Skill Gaps</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.skillGaps.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reasoning */}
      {analysis.reasoning && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gray-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reasoning</h2>
          </div>
          <p className={`text-sm leading-relaxed ${secondaryText}`}>{analysis.reasoning}</p>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions?.length > 0 && (
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Suggestions</h2>
          </div>
          <ul className="space-y-2.5">
            {analysis.suggestions.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;