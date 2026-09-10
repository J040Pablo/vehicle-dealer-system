import axios from "axios";

/**
 * Pre-configured Axios instance for the Vehicle Dealer API.
 * Base URL and the X-Correlation-Id header preserve the existing backend integration
 * (Vite proxies /api to the Spring Boot service — see vite.config.ts).
 */
export const sanitizeApiUrl = (url?: string): string => {
  if (!url) return "/api";
  const cleaned = url.trim().replace(/[\}\$\s"']+$/, "");
  if (!cleaned) return "/api";
  return cleaned.endsWith("/api") ? cleaned : `${cleaned.replace(/\/$/, "")}/api`;
};

const getBaseUrl = (): string => {
  return sanitizeApiUrl(import.meta.env.VITE_API_URL);
};

export const http = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (!config.headers["X-Correlation-Id"]) {
    config.headers["X-Correlation-Id"] = crypto.randomUUID();
  }

  const isPublicAuthEndpoint =
    (config.url?.startsWith("/auth/") || config.url?.startsWith("/api/auth/")) &&
    !config.url?.includes("/auth/oauth2/link");

  const token = localStorage.getItem("token");
  if (token && !isPublicAuthEndpoint) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
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

