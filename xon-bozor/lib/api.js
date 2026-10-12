import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com",
  headers: { "Content-Type": "application/json" },
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
