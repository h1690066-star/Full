"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, memo } from "react";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdStar,
  MdShoppingCart,
  MdAdd,
  MdRemove,
  MdPhoneIphone,
} from "react-icons/md";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cartContext";
import { toast } from "./ToastContainer";

function ProductCard({ product: p, t }) {
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
            <img
              src={imgUrl}
              alt={p.name}
              width={220}
              height={220}
              className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
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

      {/* Kontent qismi */}
      <div className="flex flex-1 flex-col justify-between pt-2.5 px-0.5">
        <div>
          {/* Muddatli to'lov nishoni */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-fit rounded-md bg-amber-400/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-slate-900 shadow-2xs">
              {formatPrice(monthlyPrice)} {c.perMonth}
            </span>
          </div>

          {/* Mahsulot nomi */}
          <Link href={`/product/${pid}`}>
            <h3 className="line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-brand transition">
              {p.name}
            </h3>
          </Link>

          {/* Reyting va sharhlar */}
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MdStar className="text-amber-500 text-sm" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{ratingNum.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({reviewsCount} {c.reviews})
            </span>
          </div>
        </div>

        {/* Narx va Savat qismi - Narx har doim ko'rinib turadi */}
        <div className="mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div className="flex items-center justify-between min-h-[38px] gap-2">
            {/* Chap taraf: Narx */}
            <div className="min-w-0 flex-1">
              {p.oldPrice && p.oldPrice > p.price && (
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-through leading-tight truncate">
                  {formatPrice(p.oldPrice)} {c.som}
                </p>
              )}
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                {formatPrice(p.price)} <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{c.som}</span>
              </p>
            </div>

            {/* O'ng taraf: Savat tugmasi yoki Qty Counter */}
            {qtyInCart === 0 ? (
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label="Savatga qo'shish"
                title="Savatga qo'shish"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/20 hover:bg-brand-dark active:scale-95 transition cursor-pointer"
              >
                <MdShoppingCart className="text-base sm:text-lg" />
              </button>
            ) : (
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <button
                  type="button"
                  onClick={handleMinus}
                  aria-label="Kamaytirish"
                  title="Kamaytirish"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition shadow-xs active:scale-90 cursor-pointer"
                >
                  <MdRemove className="text-sm font-black" />
                </button>
                <span className="px-2 text-xs font-black text-slate-900 dark:text-white min-w-[1.4rem] text-center select-none">
                  {qtyInCart}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  aria-label="Ko'paytirish"
                  title="Ko'paytirish"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition shadow-xs active:scale-90 cursor-pointer"
                >
                  <MdAdd className="text-sm font-black" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
