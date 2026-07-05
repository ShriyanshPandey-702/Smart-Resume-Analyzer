import { useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // Theme-aware styles matching Dashboard & Signup
  const cardClass = "card";

  const primaryText = "text-[var(--ink)]";
  const secondaryText = "text-[var(--muted)]";

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
            Welcome Back
          </h1>
          <p className={`text-sm ${secondaryText}`}>
            Log in to Hirely
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className={`text-xs font-medium transition-colors text-[var(--accent)] hover:brightness-110`}
            >
              Forgot Password?
            </Link>
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
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>

        <p className={`mt-8 text-center text-sm ${secondaryText}`}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className={`font-medium transition-colors text-[var(--accent)] hover:brightness-110`}
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
