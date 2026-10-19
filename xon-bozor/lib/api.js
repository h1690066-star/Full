import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // FormData bo'lsa, Content-Type ni butunlay o'chiramiz — browser avtomatik multipart/form-data boundary qo'yadi
  if (config.data instanceof FormData) {
    if (config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      }
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
    config.headers = config.headers || {};
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if ((err.response?.status === 401 || err.response?.status === 403) && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth-change", { detail: null }));
    }
    // If Render is 503 (suspended) or network error, fallback to localhost:5000 in local dev
    if (
      (err.response?.status === 503 || !err.response) &&
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      !err.config?._retriedLocal &&
      err.config?.baseURL !== "http://localhost:5000"
    ) {
      err.config._retriedLocal = true;
      err.config.baseURL = "http://localhost:5000";
      return api(err.config);
    }
    return Promise.reject(err);
  }
);

export const apiError = (err, fallback) => err?.response?.data?.message || err?.response?.data?.error || fallback;
