"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdStar,
  MdFavorite,
  MdFavoriteBorder,
  MdShoppingCart,
  MdCheck,
  MdLocalShipping,
  MdVerifiedUser,
  MdAutorenew,
  MdLock,
  MdChevronRight,
  MdChevronLeft,
  MdFlashOn,
  MdAdd,
  MdRemove,
  MdZoomIn,
} from "react-icons/md";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import ProductCard from "./ProductCard";
import { toast } from "./ToastContainer";

const COLOR_NAME_MAP = {
  "#000000": "Qora",
  "#ffffff": "Oq",
  "#fff": "Oq",
  "#000": "Qora",
  "#808080": "Kulrang",
  "#c0c0c0": "Kumush",
  "#ffd700": "Tilla (Gold)",
  "#ff0000": "Qizil",
  "#0000ff": "Ko'k",
  "#008000": "Yashil",
  "#6b21a8": "Binafsha",
  "#8b5cf6": "Binafsha",
  "#a855f7": "Binafsha",
  "#2563eb": "Ko'k",
  "#3b82f6": "Moviy",
  "#059669": "Yashil",
  "#d4c5b9": "Bej (Beige)",
  "#1e293b": "To'q kulrang",
  "#334155": "Kulrang",
  black: { hex: "#111827", name: "Qora" },
  white: { hex: "#ffffff", name: "Oq" },
  blue: { hex: "#2563eb", name: "Ko'k" },
  red: { hex: "#ef4444", name: "Qizil" },
  green: { hex: "#10b981", name: "Yashil" },
  purple: { hex: "#8b5cf6", name: "Binafsha" },
  gold: { hex: "#eab308", name: "Tilla" },
  silver: { hex: "#cbd5e1", name: "Kumush" },
  gray: { hex: "#64748b", name: "Kulrang" },
  grey: { hex: "#64748b", name: "Kulrang" },
  beige: { hex: "#d4c5b9", name: "Bej" },
  qora: { hex: "#111827", name: "Qora" },
  oq: { hex: "#ffffff", name: "Oq" },
  kok: { hex: "#2563eb", name: "Ko'k" },
  "ko'k": { hex: "#2563eb", name: "Ko'k" },
  qizil: { hex: "#ef4444", name: "Qizil" },
  yashil: { hex: "#10b981", name: "Yashil" },
  binafsha: { hex: "#8b5cf6", name: "Binafsha" },
  tilla: { hex: "#eab308", name: "Tilla" },
  kumush: { hex: "#cbd5e1", name: "Kumush" },
  kulrang: { hex: "#64748b", name: "Kulrang" },
};

function parseProductColor(c) {
  if (!c) return { hex: "#6b00ff", name: "", isLight: false };
  const raw = String(c).trim();
  const lower = raw.toLowerCase();

  if (COLOR_NAME_MAP[lower]) {
    const val = COLOR_NAME_MAP[lower];
    if (typeof val === "string") {
      const isLight = lower === "#ffffff" || lower === "#fff" || lower === "#cbd5e1";
      return { hex: lower, name: val, isLight };
    }
    const isLight =
      val.hex.toLowerCase() === "#ffffff" ||
      val.hex.toLowerCase() === "#fff" ||
      val.hex.toLowerCase() === "#cbd5e1";
    return { hex: val.hex, name: val.name, isLight };
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
    const isLight = lower === "#ffffff" || lower === "#fff";
    return { hex: raw, name: COLOR_NAME_MAP[lower] || raw, isLight };
  }

  if (lower.includes("qora") || lower.includes("black") || lower.includes("dark")) {
    return { hex: "#18181b", name: raw, isLight: false };
  }
  if (lower.includes("oq") || lower.includes("white") || lower.includes("silver") || lower.includes("kumush")) {
    return { hex: "#ffffff", name: raw, isLight: true };
  }
  if (lower.includes("ko'k") || lower.includes("kok") || lower.includes("blue")) {
    return { hex: "#2563eb", name: raw, isLight: false };
  }
  if (lower.includes("binafsha") || lower.includes("purple") || lower.includes("violet")) {
    return { hex: "#8b5cf6", name: raw, isLight: false };
  }
  if (lower.includes("tilla") || lower.includes("gold") || lower.includes("yellow")) {
    return { hex: "#eab308", name: raw, isLight: false };
  }
  if (lower.includes("titan") || lower.includes("natural")) {
    return { hex: "#94a3b8", name: raw, isLight: false };
  }

  return { hex: "#6b00ff", name: raw, isLight: false };
}

export default function ProductDetailClient({ product, related = [], t }) {
  const router = useRouter();
  const { cart, addToCart, toggleWishlist, isInWishlist } = useCart();

  const pid = product.id || product._id;
  const isLiked = isInWishlist(pid);
  const cartItem = cart?.find((i) => (i.id || i._id) === pid);
  const isAlreadyInCart = Boolean(cartItem);

  // Dynamic Colors from API (e.g. ["Qora Titan", "Oq Titan", "Tabiiy Titan"])
  const apiColors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [];
  const [selectedColor, setSelectedColor] = useState(apiColors[0] || "");

  // Dynamic Storage from API (e.g. ["256GB", "512GB", "1TB"])
  const apiStorage = Array.isArray(product.storage) && product.storage.length > 0 ? product.storage : [];
  const [selectedStorage, setSelectedStorage] = useState(apiStorage[0] || "");

  // Quantity
  const [qty, setQty] = useState(1);

  // Dynamic Gallery Images from API
  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : ["/logo.png"]);
  const [activeImg, setActiveImg] = useState(allImages[0]);
  const [imgError, setImgError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("specs");

  // Add to cart state
  const [added, setAdded] = useState(false);

  const price = product.price || 0;
  const oldPrice = product.oldPrice || 0;
  const discountPercent = product.discount || (oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const monthlyPrice = product.monthly || Math.round(price / 12);

  const requireAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        toast("Xarid qilish yoki saralash uchun avval ro'yxatdan o'ting", "warning");
        router.push("/register");
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireAuth()) return;
    if (isAlreadyInCart) {
      toast("Mahsulot allaqachon savatda mavjud", "info");
      return;
    }
    addToCart(product, qty, { color: selectedColor, storage: selectedStorage });
    setAdded(true);
    toast("Mahsulot savatga qo'shildi", "success");
  };

  const handleBuyNow = () => {
    if (!requireAuth()) return;
    addToCart(product, qty, { color: selectedColor, storage: selectedStorage });
    router.push("/cart");
  };

  const handleWishlistClick = () => {
    if (!requireAuth()) return;
    toggleWishlist(product);
  };

  // Dynamic Specs List from API
  const specsList = Array.isArray(product.specs) && product.specs.length > 0
    ? product.specs
    : (product.longDescription
        ? product.longDescription.split("\n").filter(Boolean).map((line) => {
            const parts = line.split(":");
            return { label: parts[0]?.trim() || "Xususiyat", value: parts.slice(1).join(":")?.trim() || line };
          })
        : []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand transition">Bosh sahifa</Link>
        <MdChevronRight className="text-slate-400" />
        <Link href="/catalog" className="hover:text-brand transition">Katalog</Link>
        {product.category && (
          <>
            <MdChevronRight className="text-slate-400" />
            <Link href={`/catalog/${encodeURIComponent(product.category.toLowerCase())}`} className="hover:text-brand transition">
              {product.category}
            </Link>
          </>
        )}
        {product.brand && (
          <>
            <MdChevronRight className="text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{product.brand}</span>
          </>
        )}
        <MdChevronRight className="text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Details Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Chap: Galereya (5 ustun) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto no-scrollbar shrink-0">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(img)}
                  aria-label={`Rasm ${i + 1}`}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 bg-slate-50 dark:bg-slate-800 p-1 transition ${
                    activeImg === img ? "border-brand shadow-sm ring-2 ring-brand/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Container */}
          <div className="relative flex-1 aspect-square sm:aspect-auto sm:h-[460px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-4 flex items-center justify-center overflow-hidden shadow-xs">
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm tracking-wider ${
                  product.used ? "bg-amber-500" : "bg-emerald-600"
                }`}
              >
                {product.used ? "B/U" : "ORIGINAL"}
              </span>
              {product.brand && (
                <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm tracking-wider">
                  {product.brand}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleWishlistClick}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-100 dark:border-slate-700 hover:scale-110 transition"
              aria-label="Saralanganlarga qo'shish"
            >
              {isLiked ? (
                <MdFavorite className="text-xl text-rose-500" />
              ) : (
                <MdFavoriteBorder className="text-xl text-slate-500 dark:text-slate-300 hover:text-brand" />
              )}
            </button>

            {activeImg && !imgError ? (
              <img
                src={activeImg}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition duration-300 hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center select-none">
                <MdPhoneIphone className="text-8xl text-brand/30" />
                <span className="text-xs font-bold text-slate-400 mt-2">{product.brand || "Xon Bozor"}</span>
              </div>
            )}

            <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
              <MdZoomIn className="text-xl" />
            </span>
          </div>
        </div>

        {/* O'rta: Sarlavha, narx va parametrlar (4 ustun) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <MdStar className="text-amber-500 text-sm" />
                <span>{Number(product.rating || 5.0).toFixed(1)}</span>
                <span className="font-normal text-slate-500 dark:text-slate-400">({product.reviews || 0} ta sharh)</span>
              </div>
              {product.stock !== undefined && (
                <>
                  <span>|</span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Omborda: {product.stock} ta</span>
                </>
              )}
              <span>|</span>
              <span className="text-slate-400 dark:text-slate-500">ID: {pid}</span>
            </div>
          </div>

          {/* Narx qutisi va Muddatli to'lov */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1b22] p-4 space-y-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand tracking-tight">
                  {formatPrice(price)} so'm
                </span>
                {oldPrice > price && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    {formatPrice(oldPrice)} so'm
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-md bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Muddatli to'lov banner */}
            <div className="flex items-center justify-between rounded-xl bg-amber-400 border border-amber-500/30 p-2.5 text-xs font-bold text-slate-900 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-950 px-2 py-0.5 text-[11px] font-extrabold text-white">
                  {formatPrice(monthlyPrice)} so'm / oyiga
                </span>
                <span className="font-bold text-slate-900">12 oyga muddatli to'lov</span>
              </div>
              <MdChevronRight className="text-xl text-slate-900" />
            </div>
          </div>

          {/* Dynamic Colors from API */}
          {apiColors.length > 0 && (
            <div>
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-2">
                Rang: <span className="font-semibold text-brand dark:text-purple-300">{parseProductColor(selectedColor).name || selectedColor}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {apiColors.map((colName) => {
                  const info = parseProductColor(colName);
                  const isSelected = selectedColor === colName;
                  return (
                    <button
                      key={colName}
                      type="button"
                      onClick={() => setSelectedColor(colName)}
                      title={info.name || colName}
                      aria-label={info.name || colName}
                      className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-brand ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md shadow-brand/20"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full shadow-inner border border-slate-300/80 dark:border-white/20 transition-transform"
                        style={{ backgroundColor: info.hex }}
                      >
                        {isSelected && (
                          <MdCheck
                            className={`text-base font-black ${
                              info.isLight ? "text-slate-900" : "text-white"
                            }`}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Storage from API */}
          {apiStorage.length > 0 && (
            <div>
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-1.5">
                Doimiy xotira (ROM):
              </label>
              <div className="flex flex-wrap gap-2">
                {apiStorage.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStorage(s)}
                    className={`flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                      selectedStorage === s
                        ? "border-brand bg-brand text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand/40"
                    }`}
                  >
                    {selectedStorage === s && <MdCheck className="text-sm text-white font-bold" />}
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Miqdor (Quantity) */}
          <div className="pt-1">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-1.5">
              Miqdor:
            </label>
            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Kamaytirish"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand transition active:scale-90 cursor-pointer"
              >
                <MdRemove className="text-base font-black" />
              </button>
              <span className="w-12 text-center text-sm font-black text-slate-900 dark:text-white select-none">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Ko'paytirish"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand transition active:scale-90 cursor-pointer"
              >
                <MdAdd className="text-base font-black" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              {/* Main Savatga qo'shish button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm sm:text-base font-extrabold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                  added || isAlreadyInCart
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                    : "bg-brand hover:bg-brand-dark shadow-brand/25"
                }`}
              >
                {added || isAlreadyInCart ? (
                  <>
                    <MdCheck className="text-xl font-black" />
                    <span className="whitespace-nowrap">Savatda</span>
                  </>
                ) : (
                  <>
                    <MdShoppingCart className="text-xl" />
                    <span className="whitespace-nowrap">Savatga qo'shish</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistClick}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition active:scale-95 shadow-2xs cursor-pointer"
                aria-label="Saralanganlarga qo'shish"
                title="Saralanganlarga qo'shish"
              >
                {isLiked ? (
                  <MdFavorite className="text-2xl text-rose-500 animate-in zoom-in-75 duration-200" />
                ) : (
                  <MdFavoriteBorder className="text-2xl" />
                )}
              </button>
            </div>

            {/* 1 klikda xarid qilish */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 dark:bg-brand/20 border border-brand/25 dark:border-brand/40 text-sm sm:text-base font-extrabold text-brand dark:text-purple-300 hover:bg-brand/20 active:scale-[0.98] transition cursor-pointer"
            >
              <MdFlashOn className="text-xl text-brand dark:text-purple-300" />
              <span className="whitespace-nowrap">1 klikda xarid qilish</span>
            </button>
          </div>
        </div>

        {/* O'ng: Sotuvchi va Kafolat Karti (3 ustun) */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-5 shadow-xs space-y-4">
            {/* Delivery Box */}
            <div className="flex items-start gap-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 p-3.5 border border-purple-100/60 dark:border-purple-900/40">
              <MdLocalShipping className="text-2xl text-brand shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold text-slate-900 dark:text-white">Yetkazib berish <span className="text-emerald-600 dark:text-emerald-400">(Bepul)</span></p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Toshkent va viloyatlar bo'yicha tezkor yetkazib berish.
                </p>
              </div>
            </div>

            {/* Sotuvchi Box */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SOTUVCHI:</span>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                    Xon Bozor Store <MdCheck className="text-brand text-xs bg-brand/10 rounded-full p-0.5" />
                  </p>
                  <p className="text-xs text-amber-500 font-bold">★ 4.9 <span className="text-slate-400 font-normal">• Rasmiy do'kon</span></p>
                </div>
              </div>
            </div>

            {/* Guarantee Perks List */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <MdVerifiedUser className="text-lg text-brand shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">Garantya: 12 oy</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Rasmiy kafolat beriladi</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MdAutorenew className="text-lg text-brand shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">Qulay qaytarish</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">14 kun ichida almashtirish</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MdLock className="text-lg text-brand shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">Xavfsiz to'lov</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Naqd, Uzcard, Humo, Visa</p>
                </div>
              </div>
            </div>

            {/* Accepted Cards Logos */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black tracking-wider text-slate-600 dark:text-slate-300">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">UZCARD</span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">HUMO</span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">VISA</span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1">MASTERCARD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Tabbed Section */}
      <div className="mt-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-6 shadow-xs">
        <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 pb-3 text-sm font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`pb-2 border-b-2 transition ${
              activeTab === "specs" ? "border-brand text-brand" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Xususiyatlari ({specsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`pb-2 border-b-2 transition ${
              activeTab === "desc" ? "border-brand text-brand" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Tavsif
          </button>
        </div>

        {activeTab === "specs" && (
          <div className="mt-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Batafsil texnik parametrlari
            </h3>
            {specsList.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm max-w-3xl">
                {specsList.map((s, idx) => (
                  <div key={idx} className="flex py-3 gap-4">
                    <span className="w-1/3 font-semibold text-slate-500 dark:text-slate-400">{s.label}</span>
                    <span className="w-2/3 font-bold text-slate-900 dark:text-slate-100">{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">Texnik xususiyatlar ko'rsatilmagan.</p>
            )}
          </div>
        )}

        {activeTab === "desc" && (
          <div className="mt-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl space-y-3 font-medium whitespace-pre-line">
            <p>
              {product.longDescription || product.description || "Mahsulot tavsifi kiritilmagan."}
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Related Products Section from API */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              O'xshash mahsulotlar
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id || p._id} product={p} t={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
