"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  MdCameraAlt,
  MdPersonOutline,
  MdLockOutline,
  MdLogout,
  MdAdminPanelSettings,
  MdCheckCircle,
  MdErrorOutline,
  MdMailOutline,
  MdPhone,
  MdVerified,
} from "react-icons/md";
import { getMe, updateMe, changePassword, clearToken } from "@/lib/services/users";
import { apiError } from "@/lib/api";
import { toast } from "./ToastContainer";

export default function ProfileClient({ t }) {
  const p = t.profile;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ profile: "", profileErr: "", password: "", passwordErr: "" });
  const [state, setState] = useState("loading");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fileInputRef = useRef(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";

  const currentAvatar =
    avatarPreview ||
    (user?.avatar
      ? user.avatar.startsWith("http://") || user.avatar.startsWith("https://") || user.avatar.startsWith("data:") || user.avatar.startsWith("blob:")
        ? user.avatar
        : `${apiBase}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
      : null);

  useEffect(() => {
    setAvatarError(false);
  }, [currentAvatar]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return setState("guest");
    let cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {}

    getMe()
      .then((d) => {
        const u = d?.user || d;
        const merged = { ...cachedUser, ...u };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        setForm({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        });
        setState("ok");
      })
      .catch(() => {
        if (cachedUser) {
          setUser(cachedUser);
          setForm({ name: cachedUser.name || "", email: cachedUser.email || "", phone: cachedUser.phone || "" });
          setState("ok");
        } else {
          setState("guest");
        }
      });
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast("Rasm hajmi 5MB dan oshmasligi kerak", "warning");
        setMsg((m) => ({ ...m, profileErr: "Rasm hajmi 5MB dan oshmasligi kerak" }));
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setMsg((m) => ({ ...m, profileErr: "" }));

      try {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("avatar", file);

        const d = await updateMe(formData);
        const updated = d?.user || d;
        const merged = { ...user, ...updated };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("auth-change", { detail: merged }));
        toast("Profil rasmi muvaffaqiyatli yuklandi!", "success");
      } catch (err) {
        toast(apiError(err, "Rasmni yuklashda xatolik yuz berdi"), "error");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg((m) => ({ ...m, profile: "", profileErr: "" }));
    try {
      let payload = form;
      if (avatarFile) {
        const formData = new FormData();
        if (form.name) formData.append("name", form.name);
        if (form.email) formData.append("email", form.email);
        if (form.phone) formData.append("phone", form.phone);
        formData.append("avatar", avatarFile);
        payload = formData;
      }
      const d = await updateMe(payload);
      const updated = d?.user || d;
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem("user", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("auth-change", { detail: merged }));
      setMsg((m) => ({ ...m, profile: p.saved }));
      toast(p.saved, "success");
    } catch (err) {
      setMsg((m) => ({ ...m, profileErr: apiError(err, t.auth.error) }));
      toast(apiError(err, t.auth.error), "error");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMsg((m) => ({ ...m, password: "", passwordErr: "" }));
    try {
      const res = await changePassword(pw);
      setPw({ oldPassword: "", newPassword: "" });
      setMsg((m) => ({ ...m, password: res?.message || p.saved }));
    } catch (err) {
      setMsg((m) => ({ ...m, passwordErr: apiError(err, t.auth.error) }));
    }
  };

  const confirmLogout = () => {
    clearToken();
    try {
      localStorage.removeItem("user");
      window.dispatchEvent(new CustomEvent("auth-change", { detail: null }));
    } catch {}
    toast("Akkauntdan chiqildi", "info");
    setShowLogoutModal(false);
    router.push("/");
    router.refresh();
  };

  if (state === "loading")
    return (
      <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
        <span className="sr-only">{t.auth.loading}</span>
        <div className="surface flex items-center gap-5 p-6">
          <div className="skeleton h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-3.5 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="skeleton h-80 rounded-3xl" />
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  if (state === "guest")
    return (
      <div className="surface mx-auto max-w-md space-y-5 p-8 text-center animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-gradient-soft text-brand dark:text-brand-300">
          <MdPersonOutline className="text-4xl" />
        </div>
        <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300">{p.needLogin}</p>
        <Link href="/login" className="btn-primary h-12 px-8">
          {t.auth.loginBtn}
        </Link>
      </div>
    );

  const input = "input font-medium";
  const btn = "btn-primary h-12 w-full sm:w-auto px-7";
  const label = "mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Header Banner */}
      <div className="surface relative overflow-hidden animate-fade-up">
        <div className="relative h-28 overflow-hidden bg-brand-gradient sm:h-32">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-fuchsia-300/30 blur-3xl" />
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
          {/* Avatar Upload */}
          <div className="relative -mt-12 w-max sm:-mt-14 select-none">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="profile-avatar"
            />
            <label
              htmlFor="profile-avatar"
              className="relative flex h-24 w-24 sm:h-28 sm:w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shadow-xl border-4 border-white dark:border-[#161623] transition hover:scale-[1.03] active:scale-95 group"
              title="Profil rasmini o'zgartirish"
            >
              {currentAvatar && !avatarError ? (
                <img
                  src={currentAvatar}
                  alt={user?.name || "Avatar"}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand/10 dark:bg-brand/20 text-brand dark:text-purple-300 font-black text-3xl sm:text-4xl select-none">
                  {user?.name ? user.name.trim().charAt(0).toUpperCase() : <MdPersonOutline className="text-4xl" />}
                </div>
              )}

              {/* Yuklanayotganda aylanuvchi spinner */}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </label>

            {/* O'ng pastki burchakdagi toza kamera tugmasi */}
            <label
              htmlFor="profile-avatar"
              title="Rasm yuklash"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30 border-2 border-white dark:border-[#161623] hover:bg-brand-dark active:scale-90 transition cursor-pointer"
            >
              <MdCameraAlt className="text-sm sm:text-base" />
            </label>
          </div>

          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {user?.name || "Foydalanuvchi"}
              </h2>
              <span
                className={`chip uppercase tracking-wider ${
                  user?.role === "admin"
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "bg-brand/10 text-brand dark:bg-brand-400/15 dark:text-brand-300"
                }`}
              >
                <MdVerified className="text-xs" />
                {user?.role === "admin" ? "Admin" : "Mijoz"}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              {user?.email ? <MdMailOutline className="shrink-0" /> : <MdPhone className="shrink-0" />}
              {user?.email || user?.phone || "Mijoz"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:pb-1">
            {user?.role === "admin" && (
              <Link href="/admin/users" className="btn-secondary h-11 px-4">
                <MdAdminPanelSettings className="text-lg" />
                {p.adminUsers}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="btn h-11 border border-rose-200 bg-rose-50 px-4 text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15 cursor-pointer transition active:scale-95"
            >
              <MdLogout className="text-lg" />
              <span>{p.logout || "Chiqish"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info Form */}
        <form
          onSubmit={saveProfile}
          className="surface space-y-4 p-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/[0.06]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand dark:text-brand-300">
              <MdPersonOutline className="text-xl" />
            </div>
            <h1 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{p.title}</h1>
          </div>
          <div>
            <label className={label}>{t.auth.name}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.auth.name}
              className={input}
            />
          </div>
          <div>
            <label className={label}>{t.auth.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.auth.email}
              className={input}
            />
          </div>
          <div>
            <label className={label}>{t.auth.phone}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t.auth.phone}
              className={input}
            />
          </div>
          <div className="pt-1">
            <button className={btn}>{p.save}</button>
          </div>
          {msg.profile && (
            <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 animate-fade-in dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <MdCheckCircle className="shrink-0" />
              {msg.profile}
            </p>
          )}
          {msg.profileErr && (
            <p className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600 animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <MdErrorOutline className="shrink-0" />
              {msg.profileErr}
            </p>
          )}
        </form>

        {/* Change Password Form */}
        <form
          onSubmit={savePassword}
          className="surface space-y-4 p-6 animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/[0.06]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <MdLockOutline className="text-xl" />
            </div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{p.passwordTitle}</h2>
          </div>
          <div>
            <label className={label}>{p.oldPassword}</label>
            <input
              type="password"
              required
              value={pw.oldPassword}
              onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
              placeholder={p.oldPassword}
              className={input}
            />
          </div>
          <div>
            <label className={label}>{p.newPassword}</label>
            <input
              type="password"
              required
              minLength={6}
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              placeholder={p.newPassword}
              className={input}
            />
          </div>
          <div className="pt-1">
            <button className={btn}>{p.change}</button>
          </div>
          {msg.password && (
            <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 animate-fade-in dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <MdCheckCircle className="shrink-0" />
              {msg.password}
            </p>
          )}
          {msg.passwordErr && (
            <p className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600 animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <MdErrorOutline className="shrink-0" />
              {msg.passwordErr}
            </p>
          )}
        </form>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#181920] border border-slate-100 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 shadow-xs">
              <MdLogout className="text-2xl" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-lg font-black text-slate-900 dark:text-white">
                Akkauntdan chiqish
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Siz rostdan ham akkauntdan chiqmoqchimisiz?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs sm:text-sm text-white shadow-md shadow-rose-600/20 transition active:scale-95 cursor-pointer"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
