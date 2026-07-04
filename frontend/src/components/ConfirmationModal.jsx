import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

function ConfirmationModal({ isOpen, onClose, onConfirm, title, description, confirmText = "Delete", isDestructive = true }) {
  const { theme } = useTheme();
  const modalRef = useRef(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const modalClass = theme === "dark" 
    ? "bg-[#111118] border border-white/10" 
    : "bg-white border border-gray-200";

  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl scale-in ${modalClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title" className={`text-xl font-bold mb-3 ${primaryText}`}>
          {title}
        </h3>
        
        <p className={`text-sm mb-8 leading-relaxed ${secondaryText}`}>
          {description}
        </p>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 
              ${theme === "dark" 
                ? "bg-white/5 hover:bg-white/10 text-gray-300 border border-transparent hover:border-white/10" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent hover:border-gray-300"}
            `}
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
              ${isDestructive 
                ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/30" 
                : (theme === "dark" ? "bg-white text-black hover:bg-gray-100 hover:shadow-white/10" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30")
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
