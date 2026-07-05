import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import jsPDF from "jspdf";
import jobTemplates from "../assets/jobTemplates";
import ConfirmationModal from "../components/ConfirmationModal";
import AnalysisResult from "../components/AnalysisResult";
import Navbar from "../components/navbar";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import {
  FiSun,
  FiMoon,
  FiLogOut,
  FiUserX,
  FiUpload,
  FiFileText,
  FiClock,
  FiTrash2,
  FiDownload,
  FiFolder,
} from "react-icons/fi";


const loadingSteps = [
  "📄 Uploading Resume...",
  "📖 Extracting Resume Text...",
  "📝 Reading Job Description...",
  "🤖 Comparing Resume with Job Description...",
  "📊 Calculating Match Score...",
  "✨ Preparing Recruiter Report..."
  ];

function Dashboard() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Delete",
    isDestructive: true,
    onConfirm: () => {},
  });

  const openModal = (config) => setModalConfig({ ...config, isOpen: true });
  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const resultRef = useRef(null);

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
    formData.append("jobTitle", selectedTemplate || "Custom Job Description");

    try {
      const response = await api.post("/resume/upload", formData);
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

  const handleRetry = () => {
  handleUpload();
  };

  // Loading animation
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


  // Auto Scroll
  useEffect(() => {
  if (!loading && result?.success && resultRef.current) {
    resultRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  }, [loading, result]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Download PDF
  const downloadPDF = () => {

  if (!result?.analysis) return;
  const pdf = new jsPDF();
  const analysis = result.analysis;

  let y = 20;
  pdf.setTextColor(63, 81, 181);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("SMART RESUME ANALYZER", 20, y);

  y += 10;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("AI Resume Analysis Report", 20, y);

  y += 8;

  pdf.setDrawColor(180);
  pdf.line(20, y, 190, y);

  y += 10;

  // Generated Date
  const currentDate = new Date().toLocaleString();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100);

  pdf.text(`Generated: ${currentDate}`, 20, y);

  y += 12;

  // Back to normal black text
  pdf.setTextColor(0);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Candidate Match Score", 20, y);

  y += 12;

  pdf.setTextColor(30, 64, 175);
  pdf.setFontSize(26);
  pdf.text(`${analysis.matchScore} / 100`, 20, y);

  y += 15;

  pdf.setTextColor(0);
  pdf.setFontSize(15);
  pdf.setFont("helvetica", "bold");
  pdf.text("Recommendation", 20, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.text(analysis.recommendation, 20, y);

  y += 12;

  const addSection = (title, items) => {

    if (y > 240) {
        pdf.addPage();
        y = 20;
    }

    pdf.setDrawColor(180);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);

    pdf.text(title, 20, y);

    y += 6;

    pdf.setDrawColor(220);
    pdf.line(20, y, 190, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);  
    
    items.forEach((item) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(`• ${item}`, 25, y);
      y += 8;
    });

    y += 10;
  };

  addSection("Matched Skills", analysis.matchedSkills);
  addSection("Missing Skills", analysis.missingSkills);
  addSection("Matched Keywords", analysis.matchedKeywords);
  addSection("Missing Keywords", analysis.missingKeywords);
  addSection("Candidate Strengths", analysis.strengths);
  addSection("Skill Gaps", analysis.skillGaps);

  pdf.setDrawColor(180);
  pdf.line(20, y, 190, y);

  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Reasoning", 20, y);

  y += 8;

  pdf.setDrawColor(220);
  pdf.line(20, y, 190, y);

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);


  const reasoning = pdf.splitTextToSize(analysis.reasoning, 170);

  if (y + reasoning.length * 7 > 270) {
    pdf.addPage();
    y = 20;
  }
  
  pdf.text(reasoning, 20, y);

  y += reasoning.length * 7 + 8;

  addSection("Suggestions", analysis.suggestions);

  pdf.save("Resume-Analysis-Report.pdf");

  };

  const handleLogout = () => {
    openModal({
      title: "Confirm Logout",
      description: "Are you sure you want to log out? You will need to sign in again to access your analysis history.",
      confirmText: "Logout",
      isDestructive: true,
      onConfirm: () => {
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  const confirmDeleteAccount = () => {
    openModal({
      title: "Delete Account",
      description: "This action will permanently delete your account and all associated data. This action cannot be undone.",
      confirmText: "Delete Account",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete("/auth/delete-account");

          localStorage.removeItem("token");
          toast.success("Account deleted successfully");
          navigate("/");
        } catch (error) {
          if (error.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          } else if (error.response?.status >= 500) {
            toast.error("Server error. Please try again later.");
          } else if (error.request) {
            toast.error("Network error. Check your connection.");
          } else {
            toast.error(error.response?.data?.message || "Failed to delete account");
          }
        }
      }
    });
  };

  const circumference = 339.29;
  const score = result?.analysis?.matchScore ?? 0;
  const scoreOffset = circumference - (score / 100) * circumference;

  const cardClass = "card";
  const primaryText = "text-[var(--ink)]";
  const secondaryText = "text-[var(--muted)]";
  const mutedText = "text-[var(--faint)]";

  const scoreVar =
    score >= 75
      ? "var(--score-strong)"
      : score >= 50
      ? "var(--score-mid)"
      : "var(--score-low)";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="relative z-10">

        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-10 sm:pb-24">

        {/* Hero */}
        <div className="text-center mb-12">
          <img src="/Hirely_lockup.png" alt="Hirely" className="w-full max-w-[220px] sm:max-w-[240px] mx-auto mb-5" />

          <p className={`${secondaryText} text-base sm:text-lg max-w-xl mx-auto leading-relaxed`}>
            Upload a resume and paste a job description to receive an AI-powered candidate match analysis.
          </p>
        </div>

        {/* Workspace: inputs on the left, results on the right (stacks on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left column: inputs ── */}
        <div>

        {/* Upload */}
        <div className={`${cardClass} p-6 sm:p-8 mb-6`}>

          <label
            htmlFor="resume-input"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 w-full border-2 border-dashed rounded-[var(--radius)] p-8 sm:p-10 cursor-pointer transition-colors duration-300 group
            ${dragActive ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--hairline)] hover:border-[var(--muted)] hover:bg-[var(--surface-2)]"}`}
          >
            <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg
                className={`w-7 h-7 transition-colors duration-300 ${
                    dragActive
                        ? "text-[var(--accent)]"
                        : "text-[var(--muted)] group-hover:text-[var(--ink)]"
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
                <p className={`${primaryText} font-medium text-sm break-all`}>{selectedFile.name}</p>
                <p className="text-[var(--faint)] text-xs mt-1">
                  {formatFileSize(selectedFile.size)} · Click to change
                </p>
              </div>
            ) : (
              <div className="text-center">

                {dragActive ? (
                  <>
                    <p className="text-lg font-semibold text-[var(--accent)]">
                      Drag &amp; drop your resume
                    </p>

                    <p className="text-sm text-[var(--muted)] mt-2">
                      Release to upload
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`${secondaryText} text-sm`}>
                      Drop your resume here
                    </p>

                    <p className={`${primaryText} text-sm mt-2`}>
                      or Click to Upload
                    </p>

                    <p className="text-[var(--muted)] text-xs mt-3">
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
        <div className={`${cardClass} p-6 sm:p-8 mb-6`}>

          {/* Card header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-sm font-semibold tracking-wide ${primaryText}`}>Job Description</h2>
              <p className={`text-xs mt-0.5 ${secondaryText}`}>Paste the complete job description for comparison.</p>
            </div>
          </div>

          {/* Template Dropdown */}
          <div className="mb-5">
            <label className={`block text-xs font-medium ${secondaryText} mb-2`}>
              Select Template
            </label>

            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);

                if (e.target.value) {
                  setJobDescription(jobTemplates[e.target.value] || "");
                }
              }}
              className="w-full rounded-[var(--radius)] px-4 py-3 outline-none transition-colors duration-200 bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] focus:border-[var(--accent)]"
            >
              <option value="">Choose a Job Template</option>
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="java">Java Full Stack</option>
              <option value="react">React Developer</option>
              <option value="python">Python Developer</option>
              <option value="dataScience">Data Scientist</option>
              <option value="mern">MERN Stack</option>
              <option value="devops">DevOps Engineer</option>
              <option value="aiEngineer">AI Engineer</option>
            </select>
          </div>

          {/* Textarea wrapper */}
          <div className="relative group">
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setSelectedTemplate("");
              }}
              placeholder="Paste the full job description here — required skills, responsibilities, qualifications..."
              rows={8}
              maxLength={5000}
              className="w-full resize-none rounded-[var(--radius)] px-4 py-3.5 outline-none transition-colors duration-200 bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder-[var(--faint)] focus:border-[var(--accent)]"
            />
            {/* Character counter */}
            <span className={`absolute bottom-3 right-3.5 text-[11px] ${mutedText} pointer-events-none select-none tabular-nums`}>
              {jobDescription.length} / 5000
            </span>
          </div>

        </div>

        {/* Analyze button — sits below both inputs */}
        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile || !jobDescription.trim()}
          className="btn-accent w-full py-3.5 px-6 font-semibold text-sm hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:translate-y-0 mb-6"
        >
          {loading ? "Processing..." : "Analyze Match →"}
        </button>

        </div>
        {/* ── End left column ── */}

        {/* ── Right column: results ── */}
        <div className="lg:sticky lg:top-24 space-y-6">

        {/* Empty placeholder (nothing run yet) */}
        {!loading && !result && (
          <div className={`${cardClass} p-10 flex flex-col items-center justify-center text-center min-h-[320px]`}>
            <div className="w-14 h-14 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-4">
              <FiFileText className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <p className={`font-display text-lg font-semibold ${primaryText}`}>Your analysis appears here</p>
            <p className={`text-sm mt-1.5 max-w-xs ${secondaryText}`}>
              Upload a resume and a job description, then run the match to see the ATS score and recruiter insights.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className={`${cardClass} p-12 flex flex-col items-center gap-5 fade-in-up`}>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--hairline)]" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[var(--accent)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className={`${primaryText} font-semibold`}>
                  {loadingSteps[loadingStep]}
              </p>

              <p className="text-[var(--faint)] text-sm mt-2">
                  Please wait while our AI recruiter analyzes the candidate profile.
              </p>

              <div className="w-full bg-[var(--surface-2)] rounded-full h-2 mt-6 overflow-hidden">
                  <div
                      className="bg-[var(--accent)] h-2 rounded-full transition-all duration-700"
                      style={{
                          width: `${((loadingStep + 1) / loadingSteps.length) * 100}%`
                      }}
                  />
              </div>

              <p className="text-xs text-[var(--faint)] mt-2">
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
              {/* Retry button */}
              <button onClick={handleRetry} className="mt-5 px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
                  Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result?.success && result.analysis && (
          <div ref={resultRef}>
            <AnalysisResult analysis={result.analysis} />
          </div>
        )}

        </div>
        {/* ── End right column ── */}

        </div>
        {/* ── End workspace grid ── */}

        <p className={`text-center ${mutedText} text-xs mt-14`}>
          Built with React • Express • Tailwind CSS • Gemini AI
        </p>

        </div>

      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        isDestructive={modalConfig.isDestructive}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}

export default Dashboard;