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
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // Theme-aware styles matching Dashboard & Signup
  const cardClass = theme === "dark"
    ? "bg-white/[0.04] border border-white/10"
    : "bg-white border border-gray-200 shadow-sm";

  const primaryText = theme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText = theme === "dark" ? "text-gray-400" : "text-gray-600";

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
            Welcome Back
          </h1>
          <p className={`text-sm ${secondaryText}`}>
            Log in to Smart Resume Analyzer
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
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${theme === "dark" ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1 font-medium">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className={`text-xs font-medium transition-colors ${theme === "dark" ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
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
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>

        <p className={`mt-8 text-center text-sm ${secondaryText}`}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className={`font-medium transition-colors ${theme === "dark" ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
