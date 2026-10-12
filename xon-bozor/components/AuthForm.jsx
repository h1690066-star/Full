"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  MdPerson,
  MdMail,
  MdPhone,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCameraAlt,
  MdClose,
} from "react-icons/md";
import { loginUser, registerUser, saveToken } from "@/lib/services/users";
import { apiError } from "@/lib/api";

export default function AuthForm({ mode, t }) {
  const a = t.auth;
  const router = useRouter();
  const isLogin = mode === "login";

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", login: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Rasm hajmi 5MB dan oshmasligi kerak");
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setError("");
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        const loginIdentifier = (form.login || form.phone || form.email || "").trim();
        const res = await loginUser({ login: loginIdentifier, password: form.password });
        saveToken(res);
        router.push("/");
        router.refresh();
      } else {
        const res = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          avatarFile: avatarFile,
        });
        saveToken(res);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(apiError(err, a.error));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "h-12 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand/10 transition";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Container */}
      <form
        onSubmit={submit}
        className="space-y-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#1a1b22]/95 p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all"
      >
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1.5 font-semibold text-sm">
          <Link
            href="/login"
            className={`flex-1 text-center py-2.5 rounded-xl transition ${
              isLogin
                ? "bg-white dark:bg-[#232530] text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {a.loginBtn}
          </Link>
          <Link
            href="/register"
            className={`flex-1 text-center py-2.5 rounded-xl transition ${
              !isLogin
                ? "bg-white dark:bg-[#232530] text-brand dark:text-purple-300 shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {a.registerBtn}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center pt-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isLogin ? a.loginTitle : a.registerTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isLogin
              ? "Xon Bozor hisobingizga kiring va qulay xarid qiling"
              : "Xon Bozorda ro'yxatdan o'ting va imkoniyatlardan foydalaning"}
          </p>
        </div>

        {/* Avatar Upload (Register Mode Only) */}
        {!isLogin && (
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-brand/40 bg-brand/5 dark:bg-brand/10 transition hover:border-brand hover:bg-brand/10 overflow-hidden shadow-sm"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-2 text-brand dark:text-purple-300">
                    <MdCameraAlt className="text-2xl mb-1" />
                    <span className="text-[10px] font-bold leading-tight">Rasm yuklash</span>
                  </div>
                )}
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-semibold">
                  <MdCameraAlt className="text-xl" />
                </div>
              </label>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  aria-label="Remove avatar"
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                >
                  <MdClose className="text-sm" />
                </button>
              )}
            </div>
            <span className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {a.avatarLabel || "Profil rasmi"} <span className="text-slate-400 dark:text-slate-500">({a.optional || "Ixtiyoriy"})</span>
            </span>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3.5">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <MdPerson className="text-xl" />
              </div>
              <input
                name="name"
                required
                minLength={2}
                placeholder={a.name}
                value={form.name}
                onChange={onChange}
                className={inputStyle}
              />
            </div>
          )}

          {isLogin ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <MdMail className="text-xl" />
              </div>
              <input
                name="login"
                required
                placeholder={a.loginOrPhone || `${a.phone} / ${a.email}`}
                value={form.login}
                onChange={onChange}
                className={inputStyle}
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <MdMail className="text-xl" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={a.email || "Email"}
                  value={form.email}
                  onChange={onChange}
                  className={inputStyle}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <MdPhone className="text-xl" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder={a.phone || "+998 90 123 45 67"}
                  value={form.phone}
                  onChange={onChange}
                  className={inputStyle}
                />
              </div>
            </>
          )}

          {/* Password with Eye Toggle */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <MdLock className="text-xl" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder={a.password}
              value={form.password}
              onChange={onChange}
              className={`${inputStyle} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
            >
              {showPassword ? (
                <MdVisibilityOff className="text-xl" />
              ) : (
                <MdVisibility className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-brand font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{a.loading}</span>
            </div>
          ) : isLogin ? (
            a.loginBtn
          ) : (
            a.registerBtn
          )}
        </button>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          {isLogin ? a.noAcc : a.haveAcc}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-bold text-brand dark:text-purple-400 hover:underline"
          >
            {isLogin ? a.registerBtn : a.loginBtn}
          </Link>
        </p>
      </form>
    </div>
  );
}
