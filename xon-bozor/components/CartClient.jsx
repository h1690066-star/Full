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
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-slate-400">{t.auth?.loading || "Yuklanmoqda..."}</p>
      </div>
    );
  }

  // Success Screen
  if (ordered) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-lg">
          <MdCheckCircle className="text-6xl" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          Mahsulotingiz qabul qilindi!
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Tez orada operatorimiz siz ko'rsatgan raqam yoki Telegram orqali bog'lanadi.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-5 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300 shadow-sm">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Buyurtma ma'lumotlari:</p>
          <p><span className="font-semibold text-slate-500 dark:text-slate-400">Qabul qiluvchi:</span> {customerInfo.name || "Mijoz"}</p>
          <p><span className="font-semibold text-slate-500 dark:text-slate-400">Telefon:</span> {customerInfo.phone || "+998 -- --- -- --"}</p>
          {customerInfo.telegram && (
            <p><span className="font-semibold text-slate-500 dark:text-slate-400">Telegram:</span> {customerInfo.telegram}</p>
          )}
          <p><span className="font-semibold text-slate-500 dark:text-slate-400">Manzil:</span> {customerInfo.region}, {customerInfo.district}, {customerInfo.street || "Bosh qarargoh"}</p>
        </div>
        <Link
          href="/"
          onClick={() => { setOrdered(false); setStep(1); }}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 font-bold text-white shadow-md hover:bg-brand-dark transition"
        >
          Bosh sahifaga qaytish <MdArrowForward />
        </Link>
      </div>
    );
  }

  // Empty Cart Screen
  if (cart.length === 0 && !ordered) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft dark:bg-brand/20 text-brand">
          <MdShoppingCart className="text-5xl" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Savatingiz hozircha bo'sh</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Xon Bozor katalogidan o'zingizga ma'qul mahsulotlarni tanlang va savatga qo'shing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark transition shadow-md"
        >
          Xaridni boshlash <MdArrowForward />
        </Link>
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
      // 1. Telegram botga so'rov yuborish (Rasm, ism, nomer, manzil, to'lov turi va mahsulotlar)
      const tgForm = new FormData();
      tgForm.append("items", JSON.stringify(items));
      tgForm.append("customerInfo", JSON.stringify(customerInfo));
      tgForm.append("address", JSON.stringify(addressObj));
      tgForm.append("paymentMethod", paymentMethod);
      tgForm.append("total", String(cartTotal));
      if (receiptFile) {
        tgForm.append("receipt", receiptFile);
      }

      fetch("/api/telegram-order", {
        method: "POST",
        body: tgForm,
      }).catch((tgErr) => console.warn("Telegram order send warning:", tgErr));

      // 2. Backend bazasiga saqlash
      if (receiptFile) {
        const formData = new FormData();
        formData.append("items", JSON.stringify(items));
        formData.append("address", JSON.stringify(addressObj));
        formData.append("receipt", receiptFile);
        formData.append("paymentMethod", paymentMethod);

        await api.post("/api/orders", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }).catch(async () => {
          await api.post("/api/orders", { items, address: addressObj, paymentMethod, total: cartTotal }).catch(() => {});
        });
      } else {
        await api.post("/api/orders", {
          items,
          address: addressObj,
          paymentMethod,
          total: cartTotal,
        }).catch(() => {});
      }
    } catch (err) {
      console.log("Order submitted fallback logic executed");
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 3 Step Progress Bar */}
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 text-xs sm:text-sm font-bold">

        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 transition ${
            step >= 1 ? "text-brand" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <span
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-extrabold transition ${
              step === 1
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : step > 1
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {step > 1 ? <MdCheck className="text-base" /> : "1"}
          </span>
          <span>1. Savat</span>
        </button>

        <div className={`h-0.5 w-6 sm:w-16 transition ${step >= 2 ? "bg-brand" : "bg-slate-200 dark:bg-slate-800"}`} />

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => { if (cart.length > 0) setStep(2); }}
          className={`flex items-center gap-2 transition ${
            step >= 2 ? "text-brand" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <span
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-extrabold transition ${
              step === 2
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : step > 2
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {step > 2 ? <MdCheck className="text-base" /> : "2"}
          </span>
          <span>2. Manzilni aniqlash</span>
        </button>

        <div className={`h-0.5 w-6 sm:w-16 transition ${step >= 3 ? "bg-brand" : "bg-slate-200 dark:bg-slate-800"}`} />

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => { if (cart.length > 0 && customerInfo.name && customerInfo.phone) setStep(3); }}
          className={`flex items-center gap-2 transition ${
            step >= 3 ? "text-brand" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <span
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-extrabold transition ${
              step === 3
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            3
          </span>
          <span>3. Rasmiylashtirish</span>
        </button>
      </div>

      {/* STEP 1: SAVAT (CART ITEMS LIST) */}
      {step === 1 && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">Savat</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{cart.length} xil mahsulot</p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-500 hover:underline sm:text-sm"
            >
              Savatni tozalash
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Mahsulotlar ro'yxati */}
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item) => {
                const pid = item.id || item._id;
                return (
                  <div
                    key={pid}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-4 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <Link
                      href={`/product/${pid}`}
                      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800 p-2"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      ) : (
                        <MdShoppingCart className="text-3xl text-brand/30" />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${pid}`}>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 hover:text-brand line-clamp-2">
                          {item.name}
                        </h2>
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {item.color && (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">Rang: {item.color}</span>
                        )}
                        {item.storage && (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">Xotira: {item.storage}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {formatPrice(item.price)} so'm
                        </span>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(item.oldPrice)} so'm
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-3 self-end sm:self-center">
                      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(pid, -1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          aria-label="Kamaytirish"
                        >
                          <MdRemove />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(pid, 1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          aria-label="Ko'paytirish"
                        >
                          <MdAdd />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(pid)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition"
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
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-xs sticky top-24">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Buyurtma ma'lumoti</h2>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Mahsulotlar ({cart.length}):</span>
                    <span>{formatPrice(cartOldTotal || cartTotal)} so'm</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Chegirma:</span>
                      <span>-{formatPrice(savings)} so'm</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Yetkazib berish:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Bepul</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline font-bold">
                    <span className="text-base text-slate-900 dark:text-white">Jami to'lov:</span>
                    <span className="text-xl text-brand">{formatPrice(cartTotal)} so'm</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoToStep2}
                  className="mt-6 w-full rounded-2xl bg-brand py-3.5 text-center font-bold text-white hover:bg-brand-dark transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Buyurtma berish</span>
                  <MdArrowForward className="text-lg" />
                </button>

                <div className="mt-6 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MdLocalShipping className="text-base text-brand" />
                    <span>Toshkent bo'yicha 2 soatda yetkazib berish</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdSecurity className="text-base text-brand" />
                    <span>100% rasmiy kafolat va xavfsiz to'lov</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STEP 2: MANZILNI ANIQLASH (CUSTOMER INFO & SHIPPING FORM) */}
      {step === 2 && (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <form onSubmit={handleGoToStep3} className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdPerson className="text-brand text-xl" />
                  <span>2. Shaxsiy ma'lumotlar va yetkazib berish manzili</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <MdArrowBack /> Savatga qaytish
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ism va familiya <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <MdPerson className="text-lg" />
                    </div>
                    <input
                      name="name"
                      required
                      placeholder="Jahongir Abdusalomov"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 pl-10 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Telefon raqami <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <MdPhone className="text-lg" />
                    </div>
                    <input
                      name="phone"
                      required
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 pl-10 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition"
                    />
                  </div>
                </div>

                {/* Telegram Username */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Telegram username <span className="text-slate-400 font-normal">(kuryer tezkor bog'lanishi uchun)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <MdSend className="text-lg" />
                    </div>
                    <input
                      name="telegram"
                      placeholder="@username"
                      value={customerInfo.telegram}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 pl-10 pr-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition"
                    />
                  </div>
                </div>

                {/* Viloyat */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Viloyat
                  </label>
                  <select
                    name="region"
                    value={customerInfo.region}
                    onChange={handleInputChange}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition cursor-pointer"
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
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Shahar / Tuman
                  </label>
                  <input
                    name="district"
                    placeholder="Chilonzor tumani"
                    value={customerInfo.district}
                    onChange={handleInputChange}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition"
                  />
                </div>

                {/* Street */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ko'cha va uy raqami
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 dark:bg-brand/20 dark:hover:bg-brand/30 px-2.5 py-1 text-xs font-bold text-brand transition disabled:opacity-50"
                    >
                      <MdMyLocation className={`text-sm ${isLocating ? "animate-spin" : ""}`} />
                      <span>{isLocating ? "Aniqlanmoqda..." : "Lokatsiyani aniqlash"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <MdLocationOn className="text-lg" />
                    </div>
                    <input
                      name="street"
                      placeholder="Bunyodkor ko'chasi, 42-uy, 18-xonadon"
                      value={customerInfo.street}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 pl-10 pr-28 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand transition"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      title="Lokatsiyani aniqlash"
                      className="absolute inset-y-1 right-1 px-3 flex items-center gap-1 text-xs font-bold text-brand hover:bg-brand/10 dark:hover:bg-brand/20 rounded-lg transition"
                    >
                      <MdMyLocation className={isLocating ? "animate-spin" : ""} />
                      <span>{isLocating ? "..." : "Aniqlash"}</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kuryer uchun izoh <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Domofon kodi 45K, 3-qavat. Eshitilmasa qo'ng'iroq qiling..."
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 p-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-brand transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand py-3.5 text-center font-bold text-white hover:bg-brand-dark transition shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span>Davom etish (To'lovga o'tish)</span>
              <MdArrowForward className="text-lg" />
            </button>
          </form>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-5 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Buyurtmangiz ({cart.length} ta)</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id || item._id} className="py-2 flex items-center gap-2.5 text-xs">
                    <img src={item.image} alt="" className="h-10 w-10 object-contain rounded bg-slate-50 dark:bg-slate-800" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.quantity} x {formatPrice(item.price)} so'm</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-baseline font-bold text-sm">
                <span className="text-slate-900 dark:text-white">Jami to'lov:</span>
                <span className="text-brand text-lg">{formatPrice(cartTotal)} so'm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RASMIYLASHTIRISH VA TO'LOV (ORDER REVIEW & PAYMENT) */}
      {step === 3 && (
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items Review */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MdShoppingCart className="text-brand text-xl" />
                  <span>3. Buyurtma tarkibi va to'lov usuli</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <MdArrowBack /> Manzilni o'zgartirish
                </button>
              </div>

              {/* Delivery info summary box */}
              <div className="rounded-xl bg-purple-50/60 dark:bg-purple-950/30 p-3.5 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p><span className="font-bold text-slate-900 dark:text-white">Qabul qiluvchi:</span> {customerInfo.name} ({customerInfo.phone})</p>
                {customerInfo.telegram && <p><span className="font-bold text-slate-900 dark:text-white">Telegram:</span> {customerInfo.telegram}</p>}
                <p><span className="font-bold text-slate-900 dark:text-white">Yetkazish manzili:</span> {customerInfo.region}, {customerInfo.district}, {customerInfo.street || "Bosh ko'cha"}</p>
              </div>

              {/* Payment Methods Choice */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">To'lov usulini tanlang:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      paymentMethod === "card"
                        ? "border-brand bg-brand/10 dark:bg-brand/20 text-brand shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <MdCreditCard className="text-lg" />
                    <span>Uzcard / Humo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("payme")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      paymentMethod === "payme"
                        ? "border-brand bg-brand/10 dark:bg-brand/20 text-brand shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <MdCreditCard className="text-lg" />
                    <span>Payme / Click</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      paymentMethod === "cash"
                        ? "border-brand bg-brand/10 dark:bg-brand/20 text-brand shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <MdLocalShipping className="text-lg" />
                    <span>Naqd (Kuryerga)</span>
                  </button>
                </div>
              </div>

              {/* Card Details & Receipt Upload Box */}
              {paymentMethod === "card" && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white">To'lov kartasi (Uzcard / Humo):</span>
                    <span className="font-bold text-brand">Kapitalbank ATB</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-3 text-sm font-mono font-bold shadow-sm">
                    <span>9860 3501 4356 0489</span>
                    <span className="text-xs font-sans text-slate-400">Jahongir A.</span>
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Chek rasmini yuklang <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="receipt-file"
                      />
                      <label
                        htmlFor="receipt-file"
                        className="flex items-center gap-2 rounded-xl border border-dashed border-brand/50 bg-brand/5 px-4 py-2 text-xs font-bold text-brand cursor-pointer hover:bg-brand/10 transition"
                      >
                        <MdUploadFile className="text-lg" />
                        <span>{receiptName ? receiptName : "Faylni tanlash"}</span>
                      </label>
                      {receiptName && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-4 text-center font-extrabold text-white transition shadow-lg text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MdCheckCircle className={`text-xl ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}</span>
            </button>
          </div>

          {/* Sidebar Final Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-5 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">To'lov xulosasi</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Mahsulotlar ({cart.length}):</span>
                  <span>{formatPrice(cartTotal)} so'm</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Yetkazish:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Bepul</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-slate-900 dark:text-white">Jami:</span>
                  <span className="text-brand text-lg">{formatPrice(cartTotal)} so'm</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p>✓ 14 kun ichida bepul qaytarish kafolati</p>
                <p>✓ 100% rasmiy original mahsulotlar</p>
                <p>✓ Xavfsiz shifrlangan to'lov</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
