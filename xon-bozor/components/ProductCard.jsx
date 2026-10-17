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

  const { cart, addToCart, updateQuantity, toggleWishlist, isInWishlist } = useCart();
  const pid = p.id || p._id;
  const ratingNum = Number(p.rating) || 4.9;
  const reviewsCount = p.reviewsCount ?? p.reviews ?? 128;
  const monthlyPrice = p.monthly || Math.round((p.price || 0) / 12);
  const imgUrl = (p.images && p.images[0]) || p.image;
  const liked = isInWishlist(pid);

  const cartItem = cart.find((i) => (i.id || i._id) === pid);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const [imgError, setImgError] = useState(false);

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

  const handleAddToCart = (e) => {
    stop(e);
    if (!requireAuth()) return;
    addToCart(p, 1);
    toast("Mahsulot savatga qo'shildi", "success");
  };

  const handleMinus = (e) => {
    stop(e);
    updateQuantity(pid, -1);
  };

  const handlePlus = (e) => {
    stop(e);
    updateQuantity(pid, 1);
  };

  const handleLike = (e) => {
    stop(e);
    if (!requireAuth()) return;
    toggleWishlist(p);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-[#181920] border border-slate-200/80 dark:border-white/10 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] hover:-translate-y-0.5">
      {/* 1:1 Kvadrat Rasm maydoni */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-[#12131a]">
        {/* Holat nishoni (ORIGINAL / B/U) */}
        <span
          className={`absolute left-2 top-2 z-10 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide text-white shadow-xs ${
            p.used ? "bg-amber-500" : "bg-emerald-600"
          }`}
        >
          {!p.used && <MdCheck className="text-[10px]" aria-hidden />}
          {p.used ? "B/U" : "ORIGINAL"}
        </span>

        {/* Sevimlilar (Wishlist) tugmasi */}
        <button
          type="button"
          onClick={handleLike}
          aria-label="Wishlist"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#20222e]/90 text-slate-400 dark:text-slate-300 shadow-xs ring-1 ring-slate-200/70 dark:ring-white/10 backdrop-blur-xs transition hover:text-rose-500 active:scale-90 cursor-pointer"
        >
          {liked ? (
            <MdFavorite className="text-[15px] sm:text-[17px] text-rose-500" />
          ) : (
            <MdFavoriteBorder className="text-[15px] sm:text-[17px]" />
          )}
        </button>

        {/* Rasm */}
        <Link
          href={`/product/${pid}`}
          className="relative flex h-full w-full items-center justify-center p-2.5 sm:p-3 select-none"
        >
          {imgUrl && !imgError ? (
            <div className="relative h-full w-full">
              <Image
                src={imgUrl}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 190px, (max-width: 1024px) 240px, 260px"
                className="object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center select-none">
              <MdPhoneIphone className="text-4xl sm:text-5xl text-brand/30" aria-hidden />
              <span className="mt-1 line-clamp-1 text-[10px] sm:text-[11px] font-semibold text-slate-400">
                {p.brand || "Xon Bozor"}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Kontent qismi */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
        <div className="space-y-1">
          {/* 1. Narx */}
          <div className="flex flex-wrap items-baseline gap-x-1.5 overflow-hidden">
            <p className="text-sm min-[380px]:text-base sm:text-lg font-black leading-tight tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatPrice(p.price)}
              <span className="ml-1 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                {c.som}
              </span>
            </p>
            {p.oldPrice && p.oldPrice > p.price ? (
              <p className="text-[10px] sm:text-xs font-medium leading-none text-slate-400 line-through tabular-nums">
                {formatPrice(p.oldPrice)}
              </p>
            ) : null}
          </div>

          {/* 2. Muddatli to'lov (Uzum uslubidagi sariq lenta) */}
          <div>
            <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-400/15 px-1.5 py-0.5 text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-300 tabular-nums">
              {formatPrice(monthlyPrice)} {c.perMonth}
            </span>
          </div>

          {/* 3. Nomi */}
          <Link href={`/product/${pid}`} className="block pt-0.5">
            <h3 className="h-8 sm:h-9 text-xs sm:text-[13px] font-medium leading-4 text-slate-700 dark:text-slate-200 line-clamp-2 transition-colors group-hover:text-brand">
              {p.name}
            </h3>
          </Link>

          {/* 4. Reyting */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
            <MdStar className="text-[13px] sm:text-[15px] text-amber-500 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {ratingNum.toFixed(1)}
            </span>
            <span>({reviewsCount} {c.reviews})</span>
          </div>
        </div>

        {/* 5. Savat tugmasi / Stepper */}
        <div className="pt-2">
          {qtyInCart > 0 ? (
            <div
              onClick={stop}
              className="flex h-8 sm:h-9 w-full items-center justify-between rounded-xl bg-slate-100 dark:bg-white/[0.08] px-1.5 ring-1 ring-slate-200/60 dark:ring-white/10"
            >
              <button
                type="button"
                onClick={handleMinus}
                aria-label="Kamaytirish"
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 active:scale-90 transition cursor-pointer"
              >
                <MdRemove className="text-base" />
              </button>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                {qtyInCart}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                aria-label="Ko'paytirish"
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 active:scale-90 transition cursor-pointer"
              >
                <MdAdd className="text-base" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label="Savatga qo'shish"
              className="group/cart flex h-8 sm:h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-xs sm:text-[13px] font-bold text-white shadow-sm shadow-brand/25 hover:bg-brand-dark active:scale-[0.98] transition cursor-pointer"
            >
              <MdShoppingCart className="text-base sm:text-lg" />
              <span>Savatga</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);