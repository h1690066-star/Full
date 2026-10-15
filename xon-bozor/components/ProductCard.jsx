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

  const { cart, addToCart, updateQuantity, removeFromCart, toggleWishlist, isInWishlist } = useCart();
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    addToCart(p, 1);
    toast("Mahsulot savatga qo'shildi", "success");
  };

  const handleMinus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qtyInCart <= 1) {
      removeFromCart(pid);
      toast("Mahsulot savatdan olindi", "info");
    } else {
      updateQuantity(pid, -1);
    }
  };

  const handlePlus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(pid, 1);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth()) return;
    toggleWishlist(p);
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#181920] p-2.5 sm:p-3 shadow-xs transition duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Rasm konteyneri - har doim oq fonda toza va chiroyli chiqadi */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-2xs border border-slate-100 dark:border-white/5">
        {/* Holat nishoni (ORIGINAL / B/U) */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs ${
              p.used ? "bg-amber-500" : "bg-emerald-600"
            }`}
          >
            {p.used ? "B/U" : "ORIGINAL"}
          </span>
        </div>

        {/* Sevimlilar tugmasi */}
        <button
          onClick={handleLike}
          aria-label="Wishlist"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/90 shadow-sm border border-slate-100 dark:border-slate-800/80 backdrop-blur-sm transition hover:scale-110 active:scale-95 cursor-pointer"
        >
          {liked ? (
            <MdFavorite className="text-lg text-rose-500" />
          ) : (
            <MdFavoriteBorder className="text-lg text-slate-400 dark:text-slate-300 hover:text-brand" />
          )}
        </button>

        {/* Mahsulot rasmi */}
        <Link href={`/product/${pid}`} className="flex h-full w-full items-center justify-center">
          {imgUrl && !imgError ? (
            <Image
              src={imgUrl}
              alt={p.name}
              width={220}
              height={220}
              className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 240px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center select-none">
              <MdPhoneIphone className="text-5xl text-brand/30" aria-hidden />
              <span className="text-[11px] font-bold text-slate-400 mt-1 line-clamp-1">{p.brand || "Xon Bozor"}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Kontent qismi - 2-rasm (Uzum Market) uslubida */}
      <div className="flex flex-1 flex-col justify-between pt-2.5 px-0.5">
        <div className="space-y-1.5">
          {/* 1. Narx (1-bo'lib eng tepada chiqadi) */}
          <div className="min-w-0">
            <p className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
              {formatPrice(p.price)} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.som}</span>
            </p>
            {p.oldPrice && p.oldPrice > p.price && (
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-through leading-tight">
                {formatPrice(p.oldPrice)} {c.som}
              </p>
            )}
          </div>

          {/* 2. Pasida ozgina ma'lumot: Muddatli to'lov nishoni */}
          <div className="pt-0.5">
            <span className="inline-block rounded-md bg-amber-400/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-slate-900 shadow-2xs">
              {formatPrice(monthlyPrice)} {c.perMonth}
            </span>
          </div>

          {/* Mahsulot nomi */}
          <Link href={`/product/${pid}`} className="block">
            <h3 className="line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-brand transition">
              {p.name}
            </h3>
          </Link>

          {/* Reyting va sharhlar */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MdStar className="text-amber-500 text-sm" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{ratingNum.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({reviewsCount} {c.reviews})
            </span>
          </div>
        </div>

        {/* 3. Eng pasida: Savatga qo'shish tugmasi (2-rasmdagidek to'liq kenglikda) */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {qtyInCart === 0 ? (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label="Savatga qo'shish"
              title="Savatga qo'shish"
              className="flex w-full h-9 items-center justify-center gap-2 rounded-xl bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark active:scale-[0.98] transition cursor-pointer text-xs sm:text-sm font-extrabold"
            >
              <MdShoppingCart className="text-base" />
              <span>Savatga qo'shish</span>
            </button>
          ) : (
            /* Tanlangandan keyin: [- 1 +], nechta kerakligini tanlash va oldida chiroyli animatsiyali galochka */
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex w-full h-9 items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-emerald-500/40 dark:border-emerald-500/40 shadow-2xs transition"
            >
              <button
                type="button"
                onClick={handleMinus}
                aria-label="Kamaytirish"
                title="Kamaytirish"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition active:scale-90 cursor-pointer shrink-0"
              >
                <MdRemove className="text-sm font-black" />
              </button>

              {/* Tanlangan soni va oldida chiroyli animatsiyali galochka */}
              <div
                className="flex items-center gap-1.5 px-2 select-none cursor-default"
                title={`${qtyInCart} ta savatga tanlangan`}
              >
                <span
                  key={qtyInCart}
                  className="flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs animate-check-pop"
                >
                  <MdCheck className="text-[11px] sm:text-xs font-black" />
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">
                  {qtyInCart}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlus}
                aria-label="Ko'paytirish"
                title="Ko'paytirish"
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-white transition active:scale-90 cursor-pointer shrink-0"
              >
                <MdAdd className="text-sm font-black" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
