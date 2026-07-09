import { useRef, useState } from "react";
import { FiUploadCloud, FiFileText, FiX, FiRefreshCw } from "react-icons/fi";

// One résumé upload card — drag & drop, filename, remove / replace.
export default function UploadCard({ id, title, badge, file, onFile, onRemove }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  const fmtSize = (b) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
            style={{ background: badge === "A" ? "var(--cmp-a)" : "var(--cmp-b)" }}
          >
            {badge}
          </span>
          <h3 className="font-display text-base font-semibold text-[var(--ink)]">{title}</h3>
        </div>
      </div>

      {file ? (
        <div className="rounded-[var(--radius)] border border-[var(--hairline)] bg-[var(--surface-2)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--ink)] truncate">{file.name}</p>
              <p className="text-xs text-[var(--faint)] mt-0.5">{fmtSize(file.size)}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Replace
            </button>
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors"
            >
              <FiX className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 w-full min-h-[180px] border-2 border-dashed rounded-[var(--radius)] p-6 cursor-pointer transition-colors duration-300 group ${
            dragActive
              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-[var(--hairline)] hover:border-[var(--muted)] hover:bg-[var(--surface-2)]"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <FiUploadCloud className={`w-6 h-6 ${dragActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--ink)]"}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--ink)]">Drop résumé here, or click to browse</p>
            <p className="text-xs text-[var(--muted)] mt-1">PDF, DOC or DOCX</p>
          </div>
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
