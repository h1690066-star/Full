"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { MdCameraAlt, MdPersonOutline } from "react-icons/md";
import { getMe, updateMe, changePassword, clearToken } from "@/lib/services/users";
import { apiError } from "@/lib/api";

export default function ProfileClient({ t }) {
  const p = t.profile;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState({ profile: "", profileErr: "", password: "", passwordErr: "" });
  const [state, setState] = useState("loading");

  const fileInputRef = useRef(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMsg((m) => ({ ...m, profileErr: "Rasm hajmi 5MB dan oshmasligi kerak" }));
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setMsg((m) => ({ ...m, profileErr: "" }));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg((m) => ({ ...m, profile: "", profileErr: "" }));
    try {
      let payload = form;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
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
    } catch (err) {
      setMsg((m) => ({ ...m, profileErr: apiError(err, t.auth.error) }));
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

  const logout = () => {
    clearToken();
    router.push("/");
    router.refresh();
  };

  if (state === "loading") return <p className="text-center text-slate-500 py-12">{t.auth.loading}</p>;
  if (state === "guest")
    return (
      <div className="mx-auto max-w-md text-center py-12 space-y-4">
        <p className="text-slate-600">{p.needLogin}</p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark"
        >
          {t.auth.loginBtn}
        </Link>
      </div>
    );

  const currentAvatar = avatarPreview || (user?.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${apiBase}${user.avatar}`) : null);
  const input = "h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-brand transition font-medium";
  const btn = "h-11 rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark transition shadow-sm";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile Header Banner */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-sm">
        <div className="relative group">
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
            className="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-brand/20 bg-brand/5 dark:bg-brand/10 overflow-hidden transition hover:border-brand"
          >
            {currentAvatar ? (
              <img src={currentAvatar} alt={user?.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-brand">
                <MdPersonOutline className="text-3xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
              <MdCameraAlt className="text-xl" />
            </div>
          </label>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || "Foydalanuvchi"}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.email || user?.phone || "Mijoz"}</p>
          <span className="inline-block mt-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand uppercase tracking-wider">
            {user?.role === "admin" ? "Admin" : "Mijoz"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info Form */}
        <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-sm">
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{p.title}</h1>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.auth.name}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.auth.name}
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.auth.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.auth.email}
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{t.auth.phone}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t.auth.phone}
              className={input}
            />
          </div>
          <button className={btn}>{p.save}</button>
          {msg.profile && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{msg.profile}</p>}
          {msg.profileErr && <p className="text-sm font-medium text-red-600 dark:text-red-400">{msg.profileErr}</p>}
        </form>

        {/* Change Password Form */}
        <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{p.passwordTitle}</h2>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{p.oldPassword}</label>
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
            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{p.newPassword}</label>
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
          <button className={btn}>{p.change}</button>
          {msg.password && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{msg.password}</p>}
          {msg.passwordErr && <p className="text-sm font-medium text-red-600 dark:text-red-400">{msg.passwordErr}</p>}
        </form>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {user?.role === "admin" && (
          <Link
            href="/admin/users"
            className="rounded-xl border border-brand bg-brand/5 px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition"
          >
            {p.adminUsers}
          </Link>
        )}
        <button
          onClick={logout}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {p.logout}
        </button>
      </div>
    </div>
  );
}
