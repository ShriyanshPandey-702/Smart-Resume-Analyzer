import { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

function Signup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
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
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Theme-aware styles matching Dashboard
  const cardClass = "card";

  const primaryText = "text-[var(--ink)]";
  const secondaryText = "text-[var(--muted)]";
  const mutedText = "text-[var(--faint)]";

  const inputClass = "w-full rounded-[var(--radius)] px-4 py-3.5 outline-none transition-colors duration-200 border bg-[var(--surface-2)] border-[var(--hairline)] text-[var(--ink)] placeholder-[var(--faint)] focus:border-[var(--accent)]";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-[var(--bg)] text-[var(--ink)]`}>
      
      {/* Background Gradient matching Dashboard */}
      

      <div className={`relative z-10 w-full max-w-md ${cardClass} p-8 sm:p-10 fade-in-up`}>
        
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6 bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--muted)]`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            AI Recruiter Assistant
          </div>
          
          <h1 className={`font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[var(--ink)]`}>
            Create Account
          </h1>
          <p className={`text-sm ${secondaryText}`}>
            Join Hirely today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`border ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''} ${inputClass}`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`border ${errors.email ? 'border-red-500/50 focus:border-red-500' : ''} ${inputClass}`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`border pr-12 ${errors.password ? 'border-red-500/50 focus:border-red-500' : ''} ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-[var(--muted)] hover:text-[var(--ink)]`}
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
                <div className={`h-1 w-full rounded-full overflow-hidden bg-[var(--surface-2)]`}>
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
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-[var(--muted)] hover:text-[var(--ink)]`}
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
                ? "btn-accent" 
                : "btn-accent"} 
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] active:translate-y-0 flex justify-center items-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <p className={`mt-8 text-center text-sm ${secondaryText}`}>
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-medium transition-colors text-[var(--accent)] hover:brightness-110`}
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
