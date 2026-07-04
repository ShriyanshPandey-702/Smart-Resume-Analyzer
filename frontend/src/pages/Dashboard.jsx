import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import jobTemplates from "../assets/jobTemplates";
import ConfirmationModal from "../components/ConfirmationModal";
import { useTheme } from "../context/ThemeContext";
import {
  FiSun,
  FiMoon,
  FiLogOut,
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
  const [history, setHistory] = useState([]);
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

    try {
      const response = await axios.post("http://localhost:5001/api/resume/upload",formData);
      setResult(response.data);

      if (response.data.success) {
      const newHistoryItem = {
        id: Date.now(),
        jobTitle: selectedTemplate || "Custom Job Description",
        score: response.data.analysis.matchScore,
        recommendation: response.data.analysis.recommendation,
        analysis: response.data.analysis,
        date: new Date().toLocaleString(),
      };
      const updatedHistory = [newHistoryItem,...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("analysisHistory",JSON.stringify(updatedHistory));
      }

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

  // Delete History
  const deleteHistoryItem = (id) => {
  const updatedHistory = history.filter((item) => item.id !== id);

  setHistory(updatedHistory);

  localStorage.setItem(
    "analysisHistory",
    JSON.stringify(updatedHistory)
  );
  };

  // clear history
  const clearHistory = () => {
  setHistory([]);

  localStorage.removeItem("analysisHistory");
  };

  const confirmDeleteHistoryItem = (id) => {
    openModal({
      title: "Delete Analysis",
      description: "Are you sure you want to delete this analysis from your history? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: () => deleteHistoryItem(id)
    });
  };

  const confirmClearHistory = () => {
    openModal({
      title: "Clear All History",
      description: "Are you sure you want to clear your entire analysis history? This action cannot be undone.",
      confirmText: "Clear All",
      isDestructive: true,
      onConfirm: clearHistory
    });
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

  useEffect(() => {
  const savedHistory = JSON.parse(localStorage.getItem("analysisHistory")) || [];
  setHistory(savedHistory);
  }, []);

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
        navigate("/login");
      }
    });
  };

  const circumference = 339.29;
  const score = result?.analysis?.matchScore ?? 0;
  const scoreOffset = circumference - (score / 100) * circumference;

  const cardClass =
  theme === "dark"
    ? "bg-white/[0.04] border border-white/10"
    : "bg-white border border-gray-200 shadow-sm";

  const primaryText =
    theme === "dark"
      ? "text-white"
      : "text-gray-900";

  const secondaryText =
    theme === "dark"
      ? "text-gray-400"
      : "text-gray-600";

  const mutedText =
  theme === "dark"
    ? "text-gray-500"
    : "text-gray-600";

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
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark"? "bg-[#0a0a0f] text-white": "bg-gray-100 text-gray-900"}`}>

      <div className={`fixed inset-0 pointer-events-none ${theme === "dark"? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)]": "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.06),_transparent)]"}`}/>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-16 sm:pt-10 sm:pb-24">

        <div className="flex justify-end gap-3 mb-6">
          
          <button onClick={toggleTheme} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition${
              theme === "dark"
                ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-100"
            }`}>
            <>
              {theme === "dark" ? <FiSun /> : <FiMoon />}
              <span>
                {theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"}
              </span>
            </>
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border
              ${theme === "dark" 
                ? "bg-white/[0.04] border-white/10 text-gray-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10" 
                : "bg-white border-gray-300 text-gray-700 hover:border-red-500/50 hover:text-red-600 hover:bg-red-50"}
            `}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>

        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6 ${
              theme === "dark"
                ? "bg-white/5 border border-white/10 text-gray-400"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Recruiter Assistant
          </div>

          <h1
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight ${theme === "dark"
              ? "bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent"
              : "text-gray-900"
            }`}
          >
            Smart Resume<br />Analyzer
          </h1>

          <p className={`${secondaryText} text-base sm:text-lg max-w-md mx-auto leading-relaxed`}>
            Upload a resume and paste a job description to receive an AI-powered candidate match analysis.
          </p>
        </div>

        {/* Upload */}
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 sm:p-8 mb-6`}>

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
                <p className={`${primaryText} font-medium text-sm break-all`}>{selectedFile.name}</p>
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
                    <p className={`${secondaryText} text-sm`}>
                      📄 Drop Resume Here
                    </p>

                    <p className={`${primaryText} text-sm mt-2`}>
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
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 sm:p-8 mb-6`}>

          {/* Card header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  setJobDescription(jobTemplates[e.target.value]);
                }
              }}
              className={`
              w-full
              rounded-xl
              px-4
              py-3
              outline-none
              transition-all
              duration-200
              focus:border-indigo-500/60
              focus:ring-2
              focus:ring-indigo-500/15
              ${
                theme === "dark"
                  ? "bg-white/[0.04] border border-white/10 text-gray-300"
                  : "bg-white border border-gray-300 text-gray-900"
              }
              `}
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
              className={`
              w-full
              resize-none
              rounded-xl
              px-4
              py-3.5
              outline-none
              transition-all
              duration-200
              focus:border-indigo-500/60
              focus:ring-2
              focus:ring-indigo-500/15
              hover:border-white/20
              ${
                theme === "dark"
                  ? "bg-white/[0.04] border border-white/10 text-gray-300 placeholder-gray-600"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
              }
              `}
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
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] active:translate-y-0 mb-6"
        >
          {loading ? "Processing..." : "Analyze Match →"}
        </button>

        {/* Loading */}
        {loading && (
          <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-12 flex flex-col items-center gap-5 fade-in-up`}>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className={`${primaryText} font-semibold`}>
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
              {/* Retry button */}
              <button onClick={handleRetry} className="mt-5 px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
                  Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analysis History */}
        {/* Analysis History */}
        <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${primaryText}`}>🕒 Recent Analyses</h2>
            {history.length > 0 && (
              <button 
                onClick={confirmClearHistory} 
                className={`text-sm px-3 py-1.5 rounded-lg transition-all duration-200 border font-medium
                  ${theme === "dark"
                    ? "border-transparent text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                    : "border-transparent text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"}
                `}
              >
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed ${theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                <FiClock className="w-5 h-5 text-indigo-400" />
              </div>
              <p className={`text-sm font-medium ${primaryText}`}>No recent analyses yet</p>
              <p className={`text-xs mt-1 ${secondaryText}`}>Your past resume scans will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                    key={item.id}
                    className={`w-full rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
                      ${theme === "dark"? "border border-white/10 bg-white/[0.03] hover:shadow-white/5" : "border border-gray-200 bg-gray-50 hover:shadow-gray-200"}
                    `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium ${primaryText}`}>{item.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-400">{item.score}%</p>
                      <p className="text-xs text-gray-400">{item.recommendation}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() =>
                        setResult({
                          success: true,
                          analysis: item.analysis,
                        })
                      }
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-200 border font-medium
                        ${theme === "dark"
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300"}
                      `}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => confirmDeleteHistoryItem(item.id)}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-200 border font-medium
                        ${theme === "dark"
                          ? "border-white/10 text-gray-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          : "border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"}
                      `}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Results */}
        {!loading && result?.success && result.analysis && (
          <div ref={resultRef} className="space-y-5 fade-in-up">

            {/* ATS Score */}
            <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-8`}>
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

            {/* Download Report */}
            <div className="flex justify-center">
              <button onClick={downloadPDF} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white font-medium shadow-lg hover:shadow-indigo-500/30">
                📄 Download PDF Report
              </button>
            </div>

            {/* Matched Skills */}
            {result.analysis.matchedSkills?.length > 0 && (
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
                  {result.analysis.matchedSkills.map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills */}
            {result.analysis.missingSkills?.length > 0 && (
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
                  {result.analysis.missingSkills.map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Matched Keywords */}
            {result.analysis.matchedKeywords?.length > 0 && (
              <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                    ✓
                  </div>

                  <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                    Matched Keywords
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.analysis.matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.analysis.missingKeywords?.length > 0 && (
              <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    ✕
                  </div>

                  <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                    Missing Keywords
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.analysis.missingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Strengths */}
            {result.analysis.strengths?.length > 0 && (
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
                  {result.analysis.strengths.map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gaps */}
            {result.analysis.skillGaps?.length > 0 && (
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
                  {result.analysis.skillGaps.map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reasoning */}
            {result.analysis.reasoning && (
              <div className={`rounded-2xl ${cardClass} backdrop-blur-sm p-6`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gray-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Reasoning</h2>
                </div>
                <p className={`text-sm leading-relaxed ${secondaryText}`}>{result.analysis.reasoning}</p>
              </div>
            )}

            {/* Suggestions */}
            {result.analysis.suggestions?.length > 0 && (
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
                  {result.analysis.suggestions.map((item, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${secondaryText} leading-relaxed`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        <p className={`text-center ${mutedText} text-xs mt-14`}>
          Built with React • Express • Tailwind CSS • Gemini AI
        </p>

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