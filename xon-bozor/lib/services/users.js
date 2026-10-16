import { api } from "../api";

export const registerUser = async (data) => {
  let body = data;

  if (data instanceof FormData) {
    body = data;
  } else if (data.avatarFile) {
    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("email", data.email || "");
    if (data.phone) formData.append("phone", data.phone);
    formData.append("password", data.password || "");
    formData.append("avatar", data.avatarFile);
    body = formData;
  }

  const res = await api.post("/api/users/register", body);
  return res.data;
};

export const loginUser = async (data) => {
  const loginStr = (data.login || data.email || data.phone || "").trim();
  try {
    const res = await api.post("/api/users/login", {
      login: loginStr,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    return res.data;
  } catch (err) {
    // Agar mijoz login xato bo'lsa va admin ma'lumotlari kiritilgan bo'lsa, admin loginni sinab ko'ramiz
    try {
      const adminRes = await api.post("/api/auth/login", {
        username: loginStr,
        password: data.password,
      });
      return {
        token: adminRes.data?.token,
        user: { name: adminRes.data?.username, role: "admin" },
      };
    } catch {
      throw err;
    }
  }
};

export const getMe = () => api.get("/api/users/me").then((r) => r.data);

export const updateMe = (data) => api.put("/api/users/me", data).then((r) => r.data);

export const changePassword = (data) =>
  api.put("/api/users/password", data).then((r) => r.data);

export const getUsers = (params) =>
  api.get("/api/users", { params }).then((r) => r.data);

export const saveToken = (res) => {
  const token = res?.token || res?.accessToken;
  if (token && typeof window !== "undefined") {
    localStorage.setItem("token", token);
    if (res?.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
    }
    window.dispatchEvent(new CustomEvent("auth-change", { detail: res?.user || null }));
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("auth-change", { detail: null }));
  }
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

