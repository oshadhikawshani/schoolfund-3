import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev",
});

// Utility function to validate token
export const validateToken = async () => {
  try {
    const token = localStorage.getItem("token") ||
      localStorage.getItem("donorToken") ||
      localStorage.getItem("schoolToken") ||
      localStorage.getItem("principalToken");

    if (!token) {
      console.log("No token found in localStorage");
      return { valid: false, error: "No token found" };
    }

    const response = await api.get('/api/users/validate-token');
    console.log("Token validation successful:", response.data);
    return { valid: true, payload: response.data.payload };
  } catch (error) {
    console.error("Token validation failed:", error.response?.data || error.message);
    return { valid: false, error: error.response?.data || error.message };
  }
};

api.interceptors.request.use((config) => {
  // Try to get token from multiple possible storage keys
  const token = localStorage.getItem("token") ||
    localStorage.getItem("donorToken") ||
    localStorage.getItem("schoolToken") ||
    localStorage.getItem("principalToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token found and added to request:", token.substring(0, 20) + "...");
  } else {
    console.warn("No authentication token found in localStorage");
    console.log("Available localStorage keys:", Object.keys(localStorage));
  }

  // Add cache-busting headers to prevent browser caching
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';

  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed. Token may be expired or invalid.");
      console.error("Response data:", error.response?.data);

      // Clear invalid tokens
      localStorage.removeItem("token");
      localStorage.removeItem("donorToken");
      localStorage.removeItem("schoolToken");
      localStorage.removeItem("principalToken");

      // Redirect to login page
      if (window.location.pathname !== "/" && window.location.pathname !== "/donor/login") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
