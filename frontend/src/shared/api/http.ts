import axios from "axios";

/**
 * Pre-configured Axios instance for the Vehicle Dealer API.
 * Base URL and the X-Correlation-Id header preserve the existing backend integration
 * (Vite proxies /api to the Spring Boot service — see vite.config.ts).
 */
export const http = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (!config.headers["X-Correlation-Id"]) {
    config.headers["X-Correlation-Id"] = crypto.randomUUID();
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
