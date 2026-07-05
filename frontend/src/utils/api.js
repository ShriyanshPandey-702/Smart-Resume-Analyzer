import axios from "axios";

// Central API base URL. Change here (or via VITE_API_URL) instead of in every file.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://smart-resume-analyzer-1n57.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach the JWT to every request if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;