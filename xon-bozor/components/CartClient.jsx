"use client";
import Link from "next/link";
import { useState } from "react";
import {
  MdDeleteOutline,
  MdAdd,
  MdRemove,
  MdShoppingCart,
  MdArrowForward,
  MdLocalShipping,
  MdSecurity,
  MdCheckCircle,
  MdCheck,
  MdPerson,
  MdPhone,
  MdSend,
  MdLocationOn,
  MdMyLocation,
  MdCreditCard,
  MdUploadFile,
  MdArrowBack,
} from "react-icons/md";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/lib/products";
import { toast } from "./ToastContainer";
import { api } from "@/lib/api";
import { sendOrderToTelegram } from "@/lib/telegram-bot";

/* ---------- Purely presentational helpers ---------- */

const fieldLabel = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const iconSlot =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500";

function StepPill({ index, label, active, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition sm:px-3 ${
        active
          ? "text-slate-900 dark:text-white"
          : done
          ? "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          : "text-slate-400 dark:text-slate-500"
      }`}
    >
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold transition sm:h-9 sm:w-9 sm:text-sm ${
          active
            ? "bg-brand-gradient text-white shadow-glow"
            : done
            ? "bg-emerald-500 text-white shadow-xs"
            : "border border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-night-100 dark:text-slate-500"
        }`}
      >
        {active && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
        {done ? <MdCheck className="text-base" /> : index}
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Qadam {index}
        </span>
        <span className="block text-sm font-semibold">{label}</span>
      </span>
    </button>
  );
}

function StepConnector({ filled }) {
  return (
    <div className="relative h-[3px] w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08] sm:w-16 lg:w-24">
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-all duration-500 ${
          filled ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}

function TrustRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">
        <Icon className="text-base" />
      </span>
      <span>{children}</span>
    </div>
  );
}

function PaymentOption({ active, onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-brand bg-brand/[0.06] shadow-glow dark:border-brand-light/60 dark:bg-brand/15"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/20"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
          active
            ? "bg-brand-gradient text-white"
            : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300"
        }`}
      >
        <Icon className="text-xl" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-semibold ${
            active ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {title}
        </span>
        <span className="block text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</span>
      </span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-brand bg-brand text-white" : "border-slate-300 dark:border-white/20"
        }`}
      >
        {active && <MdCheck className="text-[12px]" />}
      </span>
    </button>
  );
}

export default function CartClient({ t }) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartOldTotal, hydrated } =
    useCart();

  // Multi-step Checkout State: 1 = Savat, 2 = Manzilni aniqlash, 3 = Rasmiylashtirish & To'lov
  const [step, setStep] = useState(1);
  const [ordered, setOrdered] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer & Shipping Info State
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    telegram: "",
    region: "Toshkent shahri",
    district: "Chilonzor tumani",
    street: "",
    notes: "",
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "cash" | "payme"
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptName, setReceiptName] = useState("");

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <span className="sr-only">{t.auth?.loading || "Yuklanmoqda..."}</span>
        <div className="mb-8 space-y-3">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-10 w-56 rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="surface flex items-center gap-4 p-4 sm:p-5">
                <div className="skeleton h-24 w-24 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-4 w-1/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="surface h-80 p-6">
            <div className="skeleton h-full w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (ordered) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center sm:py-20">
        <div className="relative mx-auto mb-8 h-28 w-28 animate-scale-in">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="absolute inset-0 rounded-full animate-pulse-ring" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lift">
            <MdCheckCircle className="text-6xl" />
          </div>
        </div>
        <span className="eyebrow animate-fade-up">Buyurtma #qabul qilindi</span>
        <h1
          className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 animate-fade-up dark:text-white sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          Mahsulotingiz qabul qilindi!
        </h1>
        <p
          className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 animate-fade-up dark:text-slate-400 sm:text-base"
          style={{ animationDelay: "120ms" }}
        >
          Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Tez orada operatorimiz siz ko'rsatgan raqam yoki Telegram orqali bog'lanadi.
        </p>
        <div
          className="surface mt-8 overflow-hidden text-left animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
            <MdLocalShipping className="text-lg text-brand dark:text-brand-light" />
            <p className="font-display text-sm font-bold text-slate-900 dark:text-white">Buyurtma ma'lumotlari:</p>
          </div>
          <dl className="divide-y divide-slate-100 text-sm dark:divide-white/[0.06]">
            <div className="flex items-start justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Qabul qiluvchi:</dt>
              <dd className="text-right font-semibold text-slate-900 dark:text-white">{customerInfo.name || "Mijoz"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 px-5 py-3">
              <dt className="text-slate-500 dark:text-slate-400">Telefon:</dt>
              <dd className="text-right font-semibold text-slate-900 dark:text-white">{customerInfo.phone || "+998 -- --- -- --"}</dd>
            </div>
            {customerInfo.telegram && (
              <div className="flex items-start justify-between gap-4 px-5 py-3">
                <dt className="text-slate-500 dark:text-slate-400">Telegram:</dt>
                <dd className="text-right font-semibold text-slate-900 dark:text-white">{customerInfo.telegram}</dd>
              </div>
            )}
            <div className="flex items-start justify-between gap-4 px-5 py-3">
              <dt className="shrink-0 text-slate-500 dark:text-slate-400">Manzil:</dt>
              <dd className="text-right font-semibold text-slate-900 dark:text-white">
                {customerInfo.region}, {customerInfo.district}, {customerInfo.street || "Bosh qarargoh"}
              </dd>
            </div>
          </dl>
        </div>
        <Link
          href="/"
          onClick={() => { setOrdered(false); setStep(1); }}
          className="btn btn-primary mt-8 h-12 px-8 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          Bosh sahifaga qaytish <MdArrowForward className="text-lg" />
        </Link>
      </div>
    );
  }

  // Empty Cart Screen
  if (cart.length === 0 && !ordered) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
        <div className="relative mx-auto mb-8 h-32 w-32 animate-scale-in">
          <div className="absolute inset-0 rounded-[2rem] bg-brand-gradient opacity-30 blur-2xl" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/60 bg-brand-gradient-soft text-brand shadow-soft animate-float dark:border-white/10 dark:text-brand-light">
            <MdShoppingCart className="text-6xl" />
          </div>
        </div>
        <span className="eyebrow animate-fade-up">Savat</span>
        <h1
          className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 animate-fade-up dark:text-white sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          Savatingiz hozircha bo'sh
        </h1>
        <p
          className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500 animate-fade-up dark:text-slate-400 sm:text-base"
          style={{ animationDelay: "120ms" }}
        >
          Xon Bozor katalogidan o'zingizga ma'qul mahsulotlarni tanlang va savatga qo'shing.
        </p>
        <Link
          href="/"
          className="btn btn-primary mt-8 h-12 px-8 animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          Xaridni boshlash <MdArrowForward className="text-lg" />
        </Link>
        <div
          className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-3 text-left text-xs text-slate-500 animate-fade-up dark:text-slate-400 sm:grid-cols-2"
          style={{ animationDelay: "240ms" }}
        >
          <TrustRow icon={MdLocalShipping}>Toshkent bo'yicha 2 soatda yetkazib berish</TrustRow>
          <TrustRow icon={MdSecurity}>100% rasmiy kafolat va xavfsiz to'lov</TrustRow>
        </div>
      </div>
    );
  }

  const savings = cartOldTotal > cartTotal ? cartOldTotal - cartTotal : 0;

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi", "error");
      return;
    }

    setIsLocating(true);
    toast("Lokatsiyangiz aniqlanmoqda...", "info");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.street || addr.pedestrian || addr.suburb || "";
            const house = addr.house_number ? `${addr.house_number}-uy` : "";
            const neighbourhood = addr.neighbourhood || addr.suburb || addr.district || "";
            const city = addr.city || addr.town || addr.county || addr.state || "";

            const formattedStreet =
              [road, house, neighbourhood].filter(Boolean).join(", ") ||
              `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            setCustomerInfo((prev) => ({
              ...prev,
              street: formattedStreet,
              ...(city.toLowerCase().includes("tashkent") || city.toLowerCase().includes("toshkent")
                ? { region: "Toshkent shahri" }
                : {}),
              ...(addr.suburb || addr.district ? { district: addr.suburb || addr.district } : {}),
            }));
            toast("Lokatsiya muvaffaqiyatli aniqlandi!", "success");
          } else {
            setCustomerInfo((prev) => ({
              ...prev,
              street: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            }));
            toast("Lokatsiya koordinatalari olindi!", "success");
          }
        } catch (err) {
          setCustomerInfo((prev) => ({
            ...prev,
            street: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
          toast("Lokatsiya koordinatalari olindi!", "success");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast("Lokatsiyadan foydalanish uchun ruxsat berilmadi", "error");
        } else {
          toast("Lokatsiyani aniqlashda xatolik yuz berdi", "error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleGoToStep2 = () => {
    if (cart.length === 0) return;
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToStep3 = (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      toast("Iltimos, ismingiz va telefon raqamingizni kiriting", "error");
      return;
    }
    setStep(3);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalOrderSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const items = cart.map((item) => ({
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      qty: item.quantity,
    }));

    const addressObj = {
      title: customerInfo.region || "Toshkent shahri",
      text: `${customerInfo.district || ''}, ${customerInfo.street || ''} (Mijoz: ${customerInfo.name}, Tel: ${customerInfo.phone}, TG: ${customerInfo.telegram || "yo'q"}, Izoh: ${customerInfo.notes || "yo'q"})`,
      phone: customerInfo.phone,
    };

    try {
      // Telegram botga Frontenddan to'g'ridan-to'g'ri yuborish
      await sendOrderToTelegram({
        items,
        customerInfo: {
          ...customerInfo,
          addressFull: `${customerInfo.region || "Toshkent shahri"}, ${customerInfo.district || ""}, ${customerInfo.street || ""}`,
        },
        paymentMethod,
        total: cartTotal,
        receiptFile,
      });
    } catch (err) {
      console.warn("Telegram order submission notification:", err);
    } finally {
      setIsSubmitting(false);
    }

    toast("Mahsulotingiz qabul qilindi", "success");
    clearCart();
    setOrdered(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptName(file.name);
      toast("Chek rasmi yuklandi", "success");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* 3 Step Progress Bar */}
      <div className="mb-10 flex justify-center animate-fade-in">
        <div className="glass inline-flex items-center gap-1.5 rounded-3xl p-2 shadow-soft sm:gap-3 sm:px-4">
          <StepPill
            index={1}
            label="Savat"
            active={step === 1}
            done={step > 1}
            onClick={() => setStep(1)}
          />
          <StepConnector filled={step >= 2} />
          <StepPill
            index={2}
            label="Manzilni aniqlash"
            active={step === 2}
            done={step > 2}
            onClick={() => { if (cart.length > 0) setStep(2); }}
          />
          <StepConnector filled={step >= 3} />
          <StepPill
            index={3}
            label="Rasmiylashtirish"
            active={step === 3}
            done={false}
            onClick={() => { if (cart.length > 0 && customerInfo.name && customerInfo.phone) setStep(3); }}
          />
        </div>
      </div>

      {/* STEP 1: SAVAT (CART ITEMS LIST) */}
      {step === 1 && (
        <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
            <div>
              <span className="eyebrow">Xarid savati</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Savat
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{cart.length} xil mahsulot</p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="btn btn-ghost h-10 gap-1.5 px-4 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 sm:text-sm"
            >
              <MdDeleteOutline className="text-base" />
              Savatni tozalash
            </button>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Mahsulotlar ro'yxati */}
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item, idx) => {
                const pid = item.id || item._id;
                return (
                  <div
                    key={pid}
                    className="surface group flex flex-col gap-4 p-4 transition animate-fade-up hover:shadow-lift sm:flex-row sm:items-center sm:gap-5 sm:p-5"
                    style={{ animationDelay: `${Math.min(idx, 6) * 60}ms` }}
                  >
                    <Link
                      href={`/product/${pid}`}
                      className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-100 dark:bg-white/[0.03] dark:ring-white/[0.06]"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <MdShoppingCart className="text-4xl text-brand/30" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${pid}`}>
                        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-brand dark:text-white dark:hover:text-brand-light sm:text-base">
                          {item.name}
                        </h2>
                      </Link>
                      {(item.color || item.storage) && (
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                          {item.color && (
                            <span className="chip">Rang: {item.color}</span>
                          )}
                          {item.storage && (
                            <span className="chip">Xotira: {item.storage}</span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {formatPrice(item.price)} so'm
                        </span>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through dark:text-slate-500">
                            {formatPrice(item.oldPrice)} so'm
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06] sm:w-auto sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(pid, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-xs dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="Kamaytirish"
                        >
                          <MdRemove />
                        </button>
                        <span className="w-10 text-center font-display text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(pid, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-xs dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="Ko'paytirish"
                        >
                          <MdAdd />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(pid)}
                        className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                      >
                        <MdDeleteOutline className="text-base" /> O'chirish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="surface sticky top-24 overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
                <div className="p-6">
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Buyurtma ma'lumoti
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Mahsulotlar ({cart.length}):</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {formatPrice(cartOldTotal || cartTotal)} so'm
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                        <span>Chegirma:</span>
                        <span>-{formatPrice(savings)} so'm</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Yetkazib berish:</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Bepul
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative mx-4 overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-glow">
                  <div aria-hidden="true" className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                  <div className="relative flex items-end justify-between gap-3">
                    <span className="text-sm font-medium text-white/80">Jami to'lov:</span>
                    <span className="font-display text-2xl font-extrabold tracking-tight">
                      {formatPrice(cartTotal)} so'm
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-5">
                  <button
                    type="button"
                    onClick={handleGoToStep2}
                    className="btn btn-primary h-12 w-full text-base"
                  >
                    <span>Buyurtma berish</span>
                    <MdArrowForward className="text-lg" />
                  </button>

                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
                    <TrustRow icon={MdLocalShipping}>Toshkent bo'yicha 2 soatda yetkazib berish</TrustRow>
                    <TrustRow icon={MdSecurity}>100% rasmiy kafolat va xavfsiz to'lov</TrustRow>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STEP 2: MANZILNI ANIQLASH (CUSTOMER INFO & SHIPPING FORM) */}
      {step === 2 && (
        <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
          <form onSubmit={handleGoToStep3} className="space-y-6 lg:col-span-2 animate-fade-up">
            <div className="surface p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                    <MdPerson className="text-xl" />
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                    <span>2. Shaxsiy ma'lumotlar va yetkazib berish manzili</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-ghost h-9 gap-1 px-3 text-xs text-brand dark:text-brand-light"
                >
                  <MdArrowBack /> Savatga qaytish
                </button>
              </div>

              {/* Form Grid */}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className={fieldLabel}>
                    Ism va familiya <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className={iconSlot}>
                      <MdPerson className="text-lg" />
                    </div>
                    <input
                      name="name"
                      required
                      placeholder="Jahongir Abdusalomov"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className="input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={fieldLabel}>
                    Telefon raqami <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className={iconSlot}>
                      <MdPhone className="text-lg" />
                    </div>
                    <input
                      name="phone"
                      required
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Telegram Username */}
                <div className="sm:col-span-2">
                  <label className={fieldLabel}>
                    Telegram username <span className="font-normal text-slate-400 dark:text-slate-500">(kuryer tezkor bog'lanishi uchun)</span>
                  </label>
                  <div className="relative">
                    <div className={iconSlot}>
                      <MdSend className="text-lg" />
                    </div>
                    <input
                      name="telegram"
                      placeholder="@username"
                      value={customerInfo.telegram}
                      onChange={handleInputChange}
                      className="input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Viloyat */}
                <div>
                  <label className={fieldLabel}>
                    Viloyat
                  </label>
                  <select
                    name="region"
                    value={customerInfo.region}
                    onChange={handleInputChange}
                    className="input w-full cursor-pointer"
                  >
                    <option value="Toshkent shahri">Toshkent shahri</option>
                    <option value="Toshkent viloyati">Toshkent viloyati</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Farg'ona">Farg'ona</option>
                    <option value="Andijon">Andijon</option>
                    <option value="Namangan">Namangan</option>
                    <option value="Buxoro">Buxoro</option>
                    <option value="Qashqadaryo">Qashqadaryo</option>
                    <option value="Surxondaryo">Surxondaryo</option>
                    <option value="Xorazm">Xorazm</option>
                    <option value="Navoiy">Navoiy</option>
                    <option value="Jizzax">Jizzax</option>
                    <option value="Sirdaryo">Sirdaryo</option>
                    <option value="Qoraqalpog'iston">Qoraqalpog'iston</option>
                  </select>
                </div>

                {/* Shahar / Tuman */}
                <div>
                  <label className={fieldLabel}>
                    Shahar / Tuman
                  </label>
                  <input
                    name="district"
                    placeholder="Chilonzor tumani"
                    value={customerInfo.district}
                    onChange={handleInputChange}
                    className="input w-full"
                  />
                </div>

                {/* Street */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ko'cha va uy raqami
                  </label>
                  <div className="relative flex items-center">
                    <div className={iconSlot}>
                      <MdLocationOn className="text-lg" />
                    </div>
                    <input
                      name="street"
                      placeholder="Bunyodkor ko'chasi, 42-uy, 18-xonadon"
                      value={customerInfo.street}
                      onChange={handleInputChange}
                      className="input w-full pl-11 pr-36"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      title="GPS orqali joylashuvni aniqlash"
                      className="absolute right-1.5 flex h-9 items-center gap-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 dark:bg-brand/20 dark:hover:bg-brand/30 px-3 text-xs font-bold text-brand dark:text-brand-light transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <MdMyLocation className={`text-sm ${isLocating ? "animate-spin" : ""}`} />
                      <span>{isLocating ? "Aniqlanmoqda..." : "Joylashuvni aniqlash"}</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className={fieldLabel}>
                    Kuryer uchun izoh <span className="font-normal text-slate-400 dark:text-slate-500">(ixtiyoriy)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Domofon kodi 45K, 3-qavat. Eshitilmasa qo'ng'iroq qiling..."
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    className="input h-auto w-full resize-none py-3"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary h-14 w-full text-base"
            >
              <span>Davom etish (To'lovga o'tish)</span>
              <MdArrowForward className="text-lg" />
            </button>
          </form>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="surface sticky top-24 overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Buyurtmangiz ({cart.length} ta)</h3>
                <MdShoppingCart className="text-lg text-slate-400 dark:text-slate-500" />
              </div>
              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto px-5 dark:divide-white/[0.06]">
                {cart.map((item) => (
                  <div key={item.id || item._id} className="flex items-center gap-3 py-3 text-xs">
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt=""
                        className="h-12 w-12 rounded-xl bg-slate-50 object-contain p-1 ring-1 ring-inset ring-slate-100 dark:bg-white/[0.03] dark:ring-white/[0.06]"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.quantity} x {formatPrice(item.price)} so'm</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-4 text-white shadow-glow">
                  <div aria-hidden="true" className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
                  <div className="relative flex items-end justify-between gap-3">
                    <span className="text-sm font-medium text-white/80">Jami to'lov:</span>
                    <span className="font-display text-xl font-extrabold tracking-tight">{formatPrice(cartTotal)} so'm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RASMIYLASHTIRISH VA TO'LOV (ORDER REVIEW & PAYMENT) */}
      {step === 3 && (
        <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2 animate-fade-up">
            {/* Order Items Review */}
            <div className="surface space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                    <MdShoppingCart className="text-xl" />
                  </span>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                    <span>3. Buyurtma tarkibi va to'lov usuli</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-ghost h-9 gap-1 px-3 text-xs text-brand dark:text-brand-light"
                >
                  <MdArrowBack /> Manzilni o'zgartirish
                </button>
              </div>

              {/* Delivery info summary box */}
              <div className="flex gap-4 rounded-2xl border border-brand/15 bg-brand-gradient-soft p-4 text-sm text-slate-600 dark:border-brand/25 dark:text-slate-300">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-xs dark:bg-night-100 dark:text-brand-light">
                  <MdLocationOn className="text-xl" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p><span className="font-semibold text-slate-900 dark:text-white">Qabul qiluvchi:</span> {customerInfo.name} ({customerInfo.phone})</p>
                  {customerInfo.telegram && <p><span className="font-semibold text-slate-900 dark:text-white">Telegram:</span> {customerInfo.telegram}</p>}
                  <p><span className="font-semibold text-slate-900 dark:text-white">Yetkazish manzili:</span> {customerInfo.region}, {customerInfo.district}, {customerInfo.street || "Bosh ko'cha"}</p>
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div className="space-y-3">
                <label className="block font-display text-sm font-bold text-slate-900 dark:text-white">To'lov usulini tanlang:</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <PaymentOption
                    active={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                    icon={MdCreditCard}
                    title="Uzcard / Humo"
                    subtitle="Kartaga o'tkazma"
                  />
                  <PaymentOption
                    active={paymentMethod === "payme"}
                    onClick={() => setPaymentMethod("payme")}
                    icon={MdCreditCard}
                    title="Payme / Click"
                    subtitle="Ilova orqali"
                  />
                  <PaymentOption
                    active={paymentMethod === "cash"}
                    onClick={() => setPaymentMethod("cash")}
                    icon={MdLocalShipping}
                    title="Naqd (Kuryerga)"
                    subtitle="Qabul qilganda"
                  />
                </div>
              </div>

              {/* Card Details & Receipt Upload Box */}
              {paymentMethod === "card" && (
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 animate-fade-in dark:border-white/[0.06] dark:bg-white/[0.03] sm:p-5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">To'lov kartasi (Uzcard / Humo):</span>
                    <span className="chip">Kapitalbank ATB</span>
                  </div>
                  {/* Bank card visual */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1d1240] to-brand-800 p-5 text-white shadow-lift sm:max-w-sm">
                    <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
                    <div aria-hidden="true" className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-brand/40 blur-3xl" />
                    <div className="relative flex items-center justify-between">
                      <span className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" />
                      <MdCreditCard className="text-2xl text-white/60" />
                    </div>
                    <p className="relative mt-6 font-mono text-lg font-bold tracking-[0.18em] sm:text-xl">
                      <span>9860 3501 4356 0489</span>
                    </p>
                    <p className="relative mt-3 text-xs font-medium uppercase tracking-widest text-white/60">
                      <span>Jahongir A.</span>
                    </p>
                  </div>
                  <div className="pt-1">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Chek rasmini yuklang <span className="font-normal text-slate-400 dark:text-slate-500">(ixtiyoriy)</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="receipt-file"
                      />
                      <label
                        htmlFor="receipt-file"
                        className="flex max-w-full cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-brand/30 bg-white px-4 py-3 text-xs font-semibold text-brand transition hover:border-brand/60 hover:bg-brand/5 dark:border-brand-light/30 dark:bg-night-100 dark:text-brand-light dark:hover:bg-brand/10"
                      >
                        <MdUploadFile className="shrink-0 text-lg" />
                        <span className="truncate">{receiptName ? receiptName : "Faylni tanlash"}</span>
                      </label>
                      {receiptName && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <MdCheck /> Yuklandi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalOrderSubmit}
              className="btn h-14 w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-base font-bold text-white shadow-lift transition hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_12px_40px_-12px_rgba(16,185,129,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdCheckCircle className={`text-xl ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}</span>
            </button>
          </div>

          {/* Sidebar Final Summary */}
          <div className="lg:col-span-1">
            <div className="surface sticky top-24 overflow-hidden animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">To'lov xulosasi</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Mahsulotlar ({cart.length}):</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatPrice(cartTotal)} so'm</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Yetkazish:</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Bepul</span>
                  </div>
                </div>
              </div>
              <div className="relative mx-4 overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-glow">
                <div aria-hidden="true" className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex items-end justify-between gap-3">
                  <span className="text-sm font-medium text-white/80">Jami:</span>
                  <span className="font-display text-2xl font-extrabold tracking-tight">{formatPrice(cartTotal)} so'm</span>
                </div>
              </div>
              <div className="space-y-2.5 p-5 text-xs text-slate-500 dark:text-slate-400 sm:p-6">
                <p className="flex items-center gap-2"><MdCheckCircle className="shrink-0 text-base text-emerald-500" /> 14 kun ichida bepul qaytarish kafolati</p>
                <p className="flex items-center gap-2"><MdCheckCircle className="shrink-0 text-base text-emerald-500" /> 100% rasmiy original mahsulotlar</p>
                <p className="flex items-center gap-2"><MdCheckCircle className="shrink-0 text-base text-emerald-500" /> Xavfsiz shifrlangan to'lov</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
