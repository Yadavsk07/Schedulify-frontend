import axios from "axios";

const api = axios.create({
  baseURL: "https://schedulify-backend-le74.onrender.com/api",
  //baseURL: "http://localhost:8080/api",
  timeout: 120000
  // withCredentials: true, // ✅ important for CORS + cookies if ever used
});

// ✅ Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 🔐 Unauthorized → redirect to login
    if (status === 401) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("schoolId");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("role");

      if (
        !window.location.pathname.startsWith("/school/login") &&
        !window.location.pathname.startsWith("/teacher/login")
      ) {
        window.location.href = "/school/login";
      }
    }

    // 🚫 Forbidden (token exists but no access)
    if (status === 403) {
      let errorMessage = "Access denied. You don't have permission to perform this action.";
      
      // Try to extract a meaningful error message
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          // If data is just "Forbidden" or similar, use a more helpful message
          const dataStr = error.response.data.trim();
          if (dataStr.toLowerCase() === 'forbidden' || dataStr === '') {
            errorMessage = "Access denied. Please ensure you are logged in as a school administrator and have the necessary permissions.";
          } else {
            errorMessage = error.response.data;
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      // Log additional debug info for 403 errors
      const token = localStorage.getItem("jwt");
      const schoolId = localStorage.getItem("schoolId");
      const teacherId = localStorage.getItem("teacherId");
      console.error("403 Forbidden Error Details:", {
        message: errorMessage,
        url: error?.config?.url,
        method: error?.config?.method,
        hasToken: !!token,
        schoolId: schoolId,
        hasTeacherId: !!teacherId,
        note: "If you logged in as admin but still get 403, the JWT token may not have admin role claims. Try logging out and logging back in."
      });
      
      // Ensure error.response.data is an object with the error message
      if (!error.response) {
        error.response = {};
      }
      if (!error.response.data || typeof error.response.data === 'string') {
        error.response.data = {};
      }
      error.response.data.error = errorMessage;
      error.response.data.message = errorMessage;
    }

    return Promise.reject(error);
  }
);

export default api;
