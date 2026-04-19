import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

const SESSION_EXPIRED_FLAG = "alumniconnect-session-expired";
const AUTH_ENDPOINTS_WITH_EXPECTED_401 = ["/auth/login", "/auth/register"];

let hasHandledSessionExpiry = false;

const isAuthEndpointWithExpected401 = (url = "") =>
  AUTH_ENDPOINTS_WITH_EXPECTED_401.some((endpoint) => url.includes(endpoint));

const clearStoredAuth = () => {
  localStorage.clear();
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const requestUrl = String(error.config?.url || "");
    const token = localStorage.getItem("token");

    if (
      statusCode === 401 &&
      token &&
      !isAuthEndpointWithExpected401(requestUrl) &&
      typeof window !== "undefined"
    ) {
      clearStoredAuth();

      if (!hasHandledSessionExpiry) {
        hasHandledSessionExpiry = true;
        sessionStorage.setItem(SESSION_EXPIRED_FLAG, "1");

        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
