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
  MdLanguage,
  MdShoppingBag,
  MdFavorite,
  MdArrowForward,
  MdExpandMore,
  MdAccessTime,
  MdCancel,
} from "react-icons/md";
import { getMe, updateMe, changePassword, clearToken } from "@/lib/services/users";
import { api, apiError } from "@/lib/api";
import { useCart } from "@/lib/cartContext";
import { LANGS } from "@/lib/dictionaries";
import { toast } from "./ToastContainer";

export default function ProfileClient({ t }) {
  const p = t.profile || {};
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
  const { wishlistCount } = useCart();
  const [ordersCount, setOrdersCount] = useState(0);
  const [userOrders, setUserOrders] = useState([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentLang, setCurrentLang] = useState("uz");

  useEffect(() => {
    const loadOrders = async () => {
      let orders = [];
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        try {
          const res = await api.get("/api/orders/my");
          const apiList = Array.isArray(res.data) ? res.data : res.data?.orders || [];
          orders = [...apiList];
        } catch (_) {}
      }
      if (typeof window !== "undefined") {
        try {
          const localList = JSON.parse(localStorage.getItem("my_orders") || "[]");
          if (Array.isArray(localList)) {
            const seen = new Set(orders.map((o) => o.orderNumber || o._id || o.id));
            for (const item of localList) {
              const key = item.orderNumber || item._id || item.id;
              if (key && !seen.has(key)) {
                orders.push(item);
                seen.add(key);
              }
            }
          }
        } catch (_) {}
      }
      setUserOrders(orders);
      setOrdersCount(orders.length);
    };
    loadOrders();
  }, []);

  const getOrderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed" || s === "paid" || s === "shipping" || s === "completed" || s === "tasdiqlangan") {
      return {
        label: t.orderStatus?.confirmed || "Mahsulot tasdiqlandi, tez orada yetkaziladi",
        icon: MdCheckCircle,
        cls: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      };
    }
    if (s === "cancelled" || s === "canceled" || s === "rejected" || s === "bekor qilingan") {
      return {
        label: t.orderStatus?.cancelled || "Bekor qilingan, chek tekshiruvdan o'tmadi",
        icon: MdCancel,
        cls: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
      };
    }
    return {
      label: t.orderStatus?.pending || "Tasdiqlash jarayonida",
      icon: MdAccessTime,
      cls: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    };
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(^|;\s*)lang=([^;]+)/);
      if (m && (m[2] === "ru" || m[2] === "en" || m[2] === "uz")) {
        setCurrentLang(m[2]);
      } else {
        const saved = localStorage.getItem("lang");
        if (saved) setCurrentLang(saved);
      }
    }
  }, []);

  const handleLangChange = (code) => {
    if (code === currentLang) return;
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    try {
      localStorage.setItem("lang", code);
      window.dispatchEvent(new CustomEvent("lang-change", { detail: code }));
    } catch {}
    window.location.reload();
  };

  const fileInputRef = useRef(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3211";

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
      setMsg((m) => ({ ...m, profile: p.saved || "Saqlandi" }));
      toast(p.saved || "Saqlandi", "success");
    } catch (err) {
      setMsg((m) => ({ ...m, profileErr: apiError(err, t.auth?.error || "Xatolik yuz berdi") }));
      toast(apiError(err, t.auth?.error || "Xatolik yuz berdi"), "error");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMsg((m) => ({ ...m, password: "", passwordErr: "" }));
    try {
      const res = await changePassword(pw);
      setPw({ oldPassword: "", newPassword: "" });
      setMsg((m) => ({ ...m, password: res?.message || p.saved || "Saqlandi" }));
      toast(res?.message || p.saved || "Saqlandi", "success");
    } catch (err) {
      setMsg((m) => ({ ...m, passwordErr: apiError(err, t.auth?.error || "Xatolik yuz berdi") }));
      toast(apiError(err, t.auth?.error || "Xatolik yuz berdi"), "error");
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
        <span className="sr-only">{t.auth?.loading || "Yuklanmoqda..."}</span>
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
        <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300">{p.needLogin || "Profilni ko'rish uchun tizimga kiring."}</p>
        <Link href="/login" className="btn-primary h-12 px-8">
          {t.auth?.loginBtn || "Kirish"}
        </Link>
      </div>
    );

  const input = "input font-medium";
  const btn = "btn-primary h-12 w-full sm:w-auto px-7 cursor-pointer";
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
                {user?.role === "admin" ? (p.admin || "Admin") : (p.client || "Mijoz")}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              {user?.email ? <MdMailOutline className="shrink-0" /> : <MdPhone className="shrink-0" />}
              {user?.email || user?.phone || (p.client || "Mijoz")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:pb-1">
            {user?.role === "admin" && (
              <Link href="/admin/users" className="btn-secondary h-11 px-4 cursor-pointer">
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

      {/* Tezkor bo'limlar: Buyurtmalarim va Sevimlilar */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 animate-fade-up">
        <Link
          href="/orders"
          className="surface group relative overflow-hidden p-4 sm:p-5 transition-all hover:scale-[1.01] hover:border-brand/40 hover:shadow-lg active:scale-98 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300">
              <MdShoppingBag className="text-2xl" />
            </div>
            <MdArrowForward className="text-lg text-slate-400 group-hover:text-brand group-hover:translate-x-1 transition" />
          </div>
          <div className="mt-3">
            <span className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {ordersCount}
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {p.ordersTitle || t.orders || "Buyurtmalarim"}
            </p>
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="surface group relative overflow-hidden p-4 sm:p-5 transition-all hover:scale-[1.01] hover:border-rose-400/40 hover:shadow-lg active:scale-98 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
              <MdFavorite className="text-2xl" />
            </div>
            <MdArrowForward className="text-lg text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition" />
          </div>
          <div className="mt-3">
            <span className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {wishlistCount}
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {p.wishlistTitle || t.wishlist || "Sevimlilar"}
            </p>
          </div>
        </Link>
      </div>

      {/* Profil ichidagi Buyurtmalar va Holati (Status) */}
      <div className="surface p-6 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300">
              <MdShoppingBag className="text-xl" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                {p.recentOrders || "Mening buyurtmalarim"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userOrders.length > 0
                  ? `${userOrders.length} ${t.ordersPage?.countSuffix || "ta buyurtma"}`
                  : (p.noOrdersYet || "Hozircha buyurtmalar yo'q")}
              </p>
            </div>
          </div>
          {userOrders.length > 0 && (
            <Link
              href="/orders"
              className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {p.viewAllOrders || "Barchasini ko'rish"} <MdArrowForward />
            </Link>
          )}
        </div>

        {userOrders.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p>{p.noOrdersYet || "Hozircha buyurtmalar yo'q"}</p>
            <Link href="/catalog" className="btn-primary inline-flex h-9 px-4 text-xs cursor-pointer">
              {t.ordersPage?.goToCatalog || "Katalogga o'tish"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {userOrders.slice(0, 3).map((o) => {
              const badge = getOrderStatusBadge(o.status);
              const StatusIcon = badge.icon;
              const firstItem = o.items?.[0];
              const totalItems = o.items?.length || 1;
              return (
                <div
                  key={o.id || o.orderNumber || o._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition dark:border-white/[0.06] dark:bg-white/[0.02] hover:border-brand/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-white/[0.06]">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {o.orderNumber || o.id || o._id}
                      </span>
                      {o.createdAt && (
                        <span className="ml-2 text-[11px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString("uz-UZ")}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border shadow-2xs ${badge.cls}`}>
                      <StatusIcon className="text-xs shrink-0" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[260px] text-slate-700 dark:text-slate-300 font-medium">
                      {firstItem?.name || "Mahsulot"}
                      {totalItems > 1 && ` +${totalItems - 1} ta boshqa`}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap ml-2">
                      {Math.round(Number(o.total) || 0).toLocaleString("ru-RU").replace(/,/g, " ")} {t.card?.som || "so'm"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
          <div>
            <h1 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{p.title || "Profil"}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.editSubtitle || "Shaxsiy ma'lumotlaringizni tahrirlang"}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>{t.auth?.name || "To'liq ism"}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.auth?.name || "To'liq ism"}
              className={input}
            />
          </div>
          <div>
            <label className={label}>{t.auth?.email || "Email"}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t.auth?.email || "Email"}
              className={input}
            />
          </div>
          <div>
            <label className={label}>{t.auth?.phone || "Telefon raqam"}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={t.auth?.phone || "Telefon raqam"}
              className={input}
            />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <button className={btn}>{p.save || "Saqlash"}</button>
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

      {/* Parolni almashtirish (Accordion) */}
      <div className="surface overflow-hidden p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <button
          type="button"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="flex w-full items-center justify-between text-left cursor-pointer select-none group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300">
              <MdLockOutline className="text-xl" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                {p.passwordTitle || "Parolni almashtirish"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showPasswordForm
                  ? (currentLang === "ru" ? "Закрыть форму смены пароля" : currentLang === "en" ? "Close password change form" : "Parolni o'zgartirish formasini yopish")
                  : (currentLang === "ru" ? "Нажмите, чтобы установить новый пароль" : currentLang === "en" ? "Click to set a new password" : "Yangi parol o'rnatish uchun bosing")}
              </p>
            </div>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${showPasswordForm ? "rotate-180" : ""}`}>
            <MdExpandMore className="text-xl" />
          </div>
        </button>

        {showPasswordForm && (
          <form
            onSubmit={savePassword}
            className="mt-5 space-y-4 border-t border-slate-100 dark:border-white/[0.06] pt-5 animate-in fade-in duration-200"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>{p.oldPassword || "Joriy parol"}</label>
                <input
                  type="password"
                  required
                  value={pw.oldPassword}
                  onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
                  placeholder={p.oldPassword || "Joriy parol"}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>{p.newPassword || "Yangi parol"}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  placeholder={p.newPassword || "Yangi parol"}
                  className={input}
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button className={btn}>{p.change || "Almashtirish"}</button>
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
        )}
      </div>

      {/* Tilni tanlash / Language Selector */}
      <div className="surface p-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/[0.06]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand dark:text-brand-300">
            <MdLanguage className="text-xl" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currentLang === "ru" ? "Язык интерфейса" : currentLang === "en" ? "Language" : "Tilni tanlash"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentLang === "ru" ? "Выберите удобный язык" : currentLang === "en" ? "Choose your preferred language" : "O'zingizga qulay tilni tanlang"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {LANGS.map((l) => {
            const isSelected = currentLang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangChange(l.code)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer active:scale-98 ${
                  isSelected
                    ? "border-brand bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-300 font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-mono font-bold uppercase ${
                    isSelected ? "bg-brand text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {l.short}
                  </span>
                  <span>{l.label}</span>
                </div>
                {isSelected && <MdCheckCircle className="text-lg text-brand" />}
              </button>
            );
          })}
        </div>
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
                {p.logoutModalTitle || "Akkauntdan chiqish"}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {p.logoutModalText || "Siz rostdan ham akkauntdan chiqmoqchimisiz?"}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                {p.cancel || "Bekor qilish"}
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs sm:text-sm text-white shadow-md shadow-rose-600/20 transition active:scale-95 cursor-pointer"
              >
                {p.confirmLogout || "Ha, chiqish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
