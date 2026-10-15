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
  MdErrorOutline,
  MdArrowForward,
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

  const inputStyle = "input pl-11";
  const iconWrap =
    "absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 transition-colors group-focus-within:text-brand dark:text-slate-500 dark:group-focus-within:text-brand-300";

  return (
    <div className="w-full max-w-md mx-auto animate-fade-up">
      {/* Form Container */}
      <form
        onSubmit={submit}
        className="glass relative space-y-6 rounded-4xl p-6 shadow-lift sm:p-8"
      >
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl border border-slate-200/70 bg-slate-100/70 p-1 text-sm font-semibold dark:border-white/[0.06] dark:bg-white/[0.04]">
          <Link
            href="/login"
            className={`flex-1 rounded-xl py-2.5 text-center transition ${
              isLogin
                ? "bg-white text-slate-900 shadow-xs font-bold dark:bg-white/[0.1] dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {a.loginBtn}
          </Link>
          <Link
            href="/register"
            className={`flex-1 rounded-xl py-2.5 text-center transition ${
              !isLogin
                ? "bg-white text-brand shadow-xs font-bold dark:bg-white/[0.1] dark:text-brand-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {a.registerBtn}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px] dark:text-white">
            {isLogin ? a.loginTitle : a.registerTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {isLogin
              ? "Xon Bozor hisobingizga kiring va qulay xarid qiling"
              : "Xon Bozorda ro'yxatdan o'ting va imkoniyatlardan foydalaning"}
          </p>
        </div>

        {/* Avatar Upload (Register Mode Only) */}
        {!isLogin && (
          <div className="flex flex-col items-center justify-center">
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
                className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-brand/30 bg-brand-gradient-soft shadow-inner-hl transition hover:border-brand/60 hover:shadow-glow dark:border-brand-400/30"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center p-2 text-center text-brand dark:text-brand-300">
                    <MdCameraAlt className="mb-1 text-2xl" />
                    <span className="text-[10px] font-bold leading-tight">Rasm yuklash</span>
                  </div>
                )}
                {/* Overlay hover effect */}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-xs font-semibold text-white opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
                  <MdCameraAlt className="text-xl" />
                </div>
              </label>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  aria-label="Remove avatar"
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-soft ring-2 ring-white transition hover:bg-rose-600 dark:ring-night-100"
                >
                  <MdClose className="text-sm" />
                </button>
              )}
            </div>
            <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {a.avatarLabel || "Profil rasmi"} <span className="text-slate-400 dark:text-slate-500">({a.optional || "Ixtiyoriy"})</span>
            </span>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3">
          {!isLogin && (
            <div className="relative group">
              <div className={iconWrap}>
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
            <div className="relative group">
              <div className={iconWrap}>
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
              <div className="relative group">
                <div className={iconWrap}>
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

              <div className="relative group">
                <div className={iconWrap}>
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
          <div className="relative group">
            <div className={iconWrap}>
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
              className={`${inputStyle} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-1.5 my-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
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
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <MdErrorOutline className="mt-px shrink-0 text-base" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button disabled={loading} className="btn-primary group/btn h-12 w-full text-[15px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{a.loading}</span>
            </div>
          ) : (
            <>
              <span>{isLogin ? a.loginBtn : a.registerBtn}</span>
              <MdArrowForward className="text-lg transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </button>

        {/* Footer Text */}
        <div className="border-t border-slate-200/70 pt-5 dark:border-white/[0.06]">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? a.noAcc : a.haveAcc}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-bold text-brand hover:underline underline-offset-4 dark:text-brand-300"
            >
              {isLogin ? a.registerBtn : a.loginBtn}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
