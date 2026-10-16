"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, memo } from "react";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdStar,
  MdShoppingCart,
  MdCheck,
  MdDoneAll,
  MdClose,
  MdAdd,
  MdRemove,
  MdPhoneIphone,
} from "react-icons/md";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import { toast } from "./ToastContainer";

function ProductCard({ product: p, t, priority = false }) {
  const router = useRouter();
  const c = t?.card || {
    add: "Savatga",
    perMonth: "so'm/oyiga",
    som: "so'm",
    reviews: "sharh",
    original: "ORIGINAL",
    used: "B/U",
  };

  const { cart, addToCart, toggleWishlist, isInWishlist } = useCart();
  const pid = p.id || p._id;
  const ratingNum = Number(p.rating) || 4.9;
  const reviewsCount = p.reviewsCount ?? p.reviews ?? 128;
  const monthlyPrice = p.monthly || Math.round((p.price || 0) / 12);
  const imgUrl = (p.images && p.images[0]) || p.image;
  const liked = isInWishlist(pid);

  const cartItem = cart.find((i) => (i.id || i._id) === pid);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const [imgError, setImgError] = useState(false);
  // Savatga qo'shishdan oldingi tanlash rejimi (hali savatga qo'shilmagan)
  const [picking, setPicking] = useState(false);
  const [pickQty, setPickQty] = useState(1);

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

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 1-bosqich: "Savatga qo'shish" -> faqat tanlash rejimi ochiladi, savatga hali qo'shilmaydi
  const handleStartPick = (e) => {
    stop(e);
    if (!requireAuth()) return;
    setPickQty(1);
    setPicking(true);
  };

  // 1 da turganda "-" bosilsa tanlash bekor qilinadi (savatga qo'shilmaydi)
  const handleMinus = (e) => {
    stop(e);
    if (pickQty <= 1) {
      setPicking(false);
      return;
    }
    setPickQty((q) => q - 1);
  };

  const handlePlus = (e) => {
    stop(e);
    setPickQty((q) => Math.min(q + 1, 99));
  };

  // 2-bosqich: galochka bosilganda tanlangan soni bilan savatga qo'shiladi
  const handleConfirm = (e) => {
    stop(e);
    if (!requireAuth()) return;
    addToCart(p, pickQty);
    setPicking(false);
    toast("Mahsulot savatga qo'shildi", "success");
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    toggleWishlist(p);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#181920] border border-slate-200/80 dark:border-white/10 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] hover:-translate-y-0.5">
      {/* Rasm konteyneri: Qat'iy 1:1 kvadrat, hech qachon cho'zilmaydi yoki buzilmaydi */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-[#12131a]">
        {/* Holat nishoni (ORIGINAL / B/U) */}
        <span
          className={`absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full py-0.5 pl-1.5 pr-2 text-[10px] font-bold tracking-wide text-white shadow-xs ${
            p.used ? "bg-amber-500" : "bg-emerald-600"
          }`}
        >
          {!p.used && <MdCheck className="text-[11px]" aria-hidden />}
          {p.used ? "B/U" : "ORIGINAL"}
        </span>

        {/* Sevimlilar tugmasi */}
        <button
          type="button"
          onClick={handleLike}
          aria-label="Wishlist"
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#20222e]/90 text-slate-400 dark:text-slate-300 shadow-sm ring-1 ring-slate-200/70 dark:ring-white/10 backdrop-blur transition hover:text-rose-500 active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {liked ? (
            <MdFavorite className="text-[18px] text-rose-500" />
          ) : (
            <MdFavoriteBorder className="text-[18px]" />
          )}
        </button>

        {/* Mahsulot rasmi: Qat'iy markazlashtirilgan, fill + object-contain, padding bilan */}
        <Link
          href={`/product/${pid}`}
          className="relative flex h-full w-full items-center justify-center p-3.5 sm:p-4 select-none"
        >
          {imgUrl && !imgError ? (
            <div className="relative h-full w-full">
              <Image
                src={imgUrl}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 240px"
                className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center select-none">
              <MdPhoneIphone className="text-5xl text-brand/30" aria-hidden />
              <span className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">
                {p.brand || "Xon Bozor"}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Kontent qismi: Har bir element qat'iy standart balandlikda tekis */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
        <div className="space-y-1.5">
          {/* 1. Narx */}
          <div className="flex h-5 items-baseline gap-x-2 overflow-hidden">
            <p className="text-base sm:text-lg font-extrabold leading-none tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatPrice(p.price)}
              <span className="ml-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{c.som}</span>
            </p>
            {p.oldPrice && p.oldPrice > p.price ? (
              <p className="text-[11px] font-medium leading-none text-slate-400 line-through tabular-nums">
                {formatPrice(p.oldPrice)}
              </p>
            ) : null}
          </div>

          {/* 2. Muddatli to'lov */}
          <div className="flex h-5 items-center">
            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold leading-none text-amber-900 dark:bg-amber-400/15 dark:text-amber-300 tabular-nums">
              {formatPrice(monthlyPrice)} {c.perMonth}
            </span>
          </div>

          {/* 3. Mahsulot nomi (Har doim 2 qator balandlikda h-10) */}
          <Link href={`/product/${pid}`} className="block">
            <h3 className="h-10 text-[13px] font-medium leading-5 text-slate-700 dark:text-slate-200 line-clamp-2 transition-colors group-hover:text-brand">
              {p.name}
            </h3>
          </Link>

          {/* 4. Reyting va sharhlar */}
          <div className="flex h-4 items-center gap-1 text-xs">
            <MdStar className="text-[15px] text-amber-500 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">{ratingNum.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({reviewsCount} {c.reviews})
            </span>
          </div>
        </div>

        {/* 5. Savat bloki: 3 holat — qo'shish / tanlash / savatda (Har doim pastda, bir xil balandlikda) */}
        <div className="pt-2.5">
          {qtyInCart > 0 ? (
            /* 3) Savatda: bosilsa hech narsa qo'shilmaydi */
            <div
              role="status"
              className="flex h-10 sm:h-11 w-full select-none cursor-default items-center justify-center gap-2 rounded-xl bg-emerald-500/10 text-[13px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/40 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/35"
            >
              <MdDoneAll key={qtyInCart} className="text-xl animate-check-pop" aria-hidden />
              <span>Savatda</span>
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] leading-none tabular-nums">
                {qtyInCart} ta
              </span>
            </div>
          ) : picking ? (
            /* 2) Tanlash: chapda miqdor boshqaruvi, o'ngda alohida tasdiqlash tugmasi */
            <div onClick={stop} className="flex h-10 sm:h-11 w-full items-center gap-1.5">
              <div className="flex h-full flex-1 items-center justify-between rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.06] dark:ring-white/10">
                <button
                  type="button"
                  onClick={handleMinus}
                  aria-label={pickQty <= 1 ? "Bekor qilish" : "Kamaytirish"}
                  title={pickQty <= 1 ? "Bekor qilish" : "Kamaytirish"}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-rose-500 hover:shadow-sm active:scale-90 cursor-pointer dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {pickQty <= 1 ? <MdClose className="text-[17px]" /> : <MdRemove className="text-xl" />}
                </button>

                <span
                  className="min-w-6 select-none text-center text-[14px] sm:text-[15px] font-extrabold leading-none text-slate-900 dark:text-white tabular-nums"
                  title={`${pickQty} ta tanlangan`}
                >
                  {pickQty}
                </span>

                <button
                  type="button"
                  onClick={handlePlus}
                  aria-label="Ko'paytirish"
                  title="Ko'paytirish"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white hover:text-brand hover:shadow-sm active:scale-90 cursor-pointer dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <MdAdd className="text-xl" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                aria-label="Savatga qo'shish"
                title="Savatga qo'shish"
                className="flex h-full w-10 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                <MdCheck className="text-[22px]" />
              </button>
            </div>
          ) : (
            /* 1) Boshlang'ich: Savatga qo'shish */
            <button
              type="button"
              onClick={handleStartPick}
              aria-label="Savatga qo'shish"
              title="Savatga qo'shish"
              className="group/cart relative flex h-10 sm:h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand text-[13px] font-bold text-white shadow-lg shadow-brand/25 ring-1 ring-inset ring-white/15 transition duration-200 hover:bg-brand-dark hover:shadow-brand/40 active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-sm transition duration-500 group-hover/cart:left-[130%] group-hover/cart:opacity-100"
              />
              <MdShoppingCart className="text-[18px] transition-transform duration-200 group-hover/cart:-translate-y-px group-hover/cart:scale-110" />
              <span className="relative">Savatga qo'shish</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);