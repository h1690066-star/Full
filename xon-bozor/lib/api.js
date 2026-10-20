import axios from "axios";

const getBaseURL = () => {
  // Browserda bo'lsa, har doim relative URL ("") bo'lishi kerak.
  // Sayt qaysi portda (3000, 3001) yoki Vercel-da bo'lishidan qat'i nazar,
  // API so'rovlari o'sha saytning o'zidagi /api/... ga boradi va hech qachon port/CORS xatosi bo'lmaydi.
  if (typeof window !== "undefined") {
    return "";
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("3211") && !envUrl.includes("onrender.com") && !envUrl.includes("5000")) {
    return envUrl;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
    // Faqat oddiy API larda token eskirgan bo'lsa tozalash (login yoki register xatosi bo'lsa tozalash shart emas)
    const url = err.config?.url || "";
    if (
      (err.response?.status === 401 || err.response?.status === 403) &&
      typeof window !== "undefined" &&
      !url.includes("/login") &&
      !url.includes("/register")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth-change", { detail: null }));
    }
    return Promise.reject(err);
  }
);

export const apiError = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.error || fallback;
