import axios from "axios";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("3211") && !envUrl.includes("onrender.com")) {
    return envUrl;
  }
  // Browserda bo'lsa, relative URL (shu saytning o'zidagi Next.js API) eng xavfsiz va CORSsiz
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5000";
};

export const api = axios.create({
  baseURL: getBaseURL(),
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
    // Lokal dev muhitida fallback
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

export const apiError = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.error || fallback;
