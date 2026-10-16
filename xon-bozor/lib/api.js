import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com",
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
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") localStorage.removeItem("token");
    return Promise.reject(err);
  }
);

export const apiError = (err, fallback) => err?.response?.data?.message || err?.response?.data?.error || fallback;
