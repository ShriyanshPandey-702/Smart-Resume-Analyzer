import { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) {
      return { text: "Weak", color: "text-red-400", barColor: "bg-red-500", width: "w-1/3" };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (score <= 1) {
      return { text: "Medium", color: "text-amber-400", barColor: "bg-amber-500", width: "w-2/3" };
    }

    return { text: "Strong", color: "text-emerald-400", barColor: "bg-emerald-500", width: "w-full" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
  const passwordsMatch = formData.confirmPassword === "" || formData.password === formData.confirmPassword;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password && !formData.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    if (!passwordsMatch) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (getPasswordStrength(formData.password)?.text === "Weak") return;

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
      });

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired reset token");
    } finally {
      setLoading(false);
    }
  };

  const cardClass = theme === "dark"
    ? "bg-white/[0.04] border border-white/10"
    : "bg-white border border-gray-200 shadow-sm";

  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const mutedText = theme === "dark" ? "text-gray-500" : "text-gray-600";

  const inputClass = `w-full rounded-xl px-4 py-3.5 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/15 ${
    theme === "dark"
      ? "bg-white/[0.04] border-white/10 text-gray-300 placeholder-gray-600 hover:border-white/20 focus:border-indigo-500/60 focus:bg-white/[0.06]"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-indigo-500"
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === "dark" ? "bg-[#0a0a0f]" : "bg-gray-100"}`}>
      
      {/* Background Gradient matching Dashboard */}
      <div className={`fixed inset-0 pointer-events-none ${theme === "dark" ? "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.12),_transparent)]" : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(99,102,241,0.06),_transparent)]"}`} />

      <div className={`relative z-10 w-full max-w-md rounded-2xl ${cardClass} backdrop-blur-sm p-8 sm:p-10 fade-in-up`}>
        
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6 ${theme === "dark" ? "bg-white/5 border border-white/10 text-gray-400" : "bg-white border border-gray-300 text-gray-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI Recruiter Assistant
          </div>
          
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${theme === "dark" ? "bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent" : "text-gray-900"}`}>
            Set New Password
          </h1>
          <p className={`text-sm ${secondaryText}`}>
            Choose a strong password to secure your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* New Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                className={`border pr-12 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''} ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{errors.password}</p>}
            
            {/* Password Strength Indicator */}
            {passwordStrength && !errors.password && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={mutedText}>Password strength</span>
                  <span className={`font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                </div>
                <div className={`h-1 w-full rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                  <div className={`h-full ${passwordStrength.barColor} ${passwordStrength.width} transition-all duration-300`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`border pr-12 ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : ''} ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{errors.confirmPassword}</p>}
            {formData.confirmPassword && !errors.confirmPassword && passwordsMatch && (
              <p className="text-emerald-400 text-xs mt-1.5 ml-1 font-medium">✓ Passwords match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 
              ${theme === "dark" 
                ? "bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"} 
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] active:translate-y-0 flex justify-center items-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
