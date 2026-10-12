"use client";
import Link from "next/link";
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

function ProductCard({ product: p, t }) {
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

  const [isSelectingQty, setIsSelectingQty] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);

  const handleInitialCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQty(qtyInCart > 0 ? qtyInCart : 1);
    setIsSelectingQty(true);
  };

  const handleConfirmQty = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qtyInCart === 0) {
      addToCart(p, selectedQty);
    } else {
      const diff = selectedQty - qtyInCart;
      if (diff !== 0) updateQuantity(pid, diff);
    }
    setIsSelectingQty(false);
    toast("Mahsulot muvaffaqiyatli qo'shildi", "success");
  };

  const handleMinus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedQty > 1) {
      setSelectedQty((q) => q - 1);
    } else {
      if (qtyInCart > 0) removeFromCart(pid);
      setIsSelectingQty(false);
    }
  };

  const handlePlus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQty((q) => q + 1);
  };

  const handleSavatdaClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQty(qtyInCart);
    setIsSelectingQty(true);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p);
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-2.5 shadow-sm transition hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700">
      {/* Image container */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f5f6fa] dark:bg-[#121319] p-3">
        {/* Badge left */}
        <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm ${
              p.used ? "bg-amber-500" : "bg-emerald-600"
            }`}
          >
            {p.used ? "B/U" : "ORIGINAL"}
          </span>
        </div>

        {/* Wishlist right */}
        <button
          onClick={handleLike}
          aria-label="Wishlist"
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm backdrop-blur-sm transition hover:scale-110"
        >
          {liked ? (
            <MdFavorite className="text-lg text-rose-500" />
          ) : (
            <MdFavoriteBorder className="text-lg text-slate-500 dark:text-slate-300 hover:text-brand" />
          )}
        </button>

        <Link href={`/product/${pid}`} className="flex h-full w-full items-center justify-center">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={p.name}
              width={220}
              height={220}
              className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <MdPhoneIphone className="text-6xl text-brand/25" aria-hidden />
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between pt-2.5 px-1">
        <div>
          {/* Monthly price pill */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-fit rounded bg-amber-400/90 px-2 py-0.5 text-[11px] font-extrabold text-slate-900 shadow-2xs">
              {formatPrice(monthlyPrice)} {c.perMonth}
            </span>
            {p.badgePercent && (
              <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                {p.badgePercent}%
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${pid}`}>
            <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand transition">
              {p.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MdStar className="text-amber-500 text-sm" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{ratingNum.toFixed(1)}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ({reviewsCount} {c.reviews})
            </span>
          </div>
        </div>

        {/* Price & Cart button section */}
        <div className="mt-3 border-t border-slate-100/80 dark:border-slate-800 pt-2">
          <div className="flex items-center justify-between min-h-[36px]">
            {!isSelectingQty && qtyInCart === 0 ? (
              <>
                {/* Price */}
                <div className="min-w-0 flex-1 pr-1">
                  {p.oldPrice && p.oldPrice > p.price && (
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-through leading-tight truncate">
                      {formatPrice(p.oldPrice)} {c.som}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                    {formatPrice(p.price)} {c.som}
                  </p>
                </div>

                {/* Cart Icon Button */}
                <button
                  onClick={handleInitialCartClick}
                  aria-label="Savatga qo'shish"
                  title="Savatga qo'shish"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-md active:scale-95 hover:bg-brand-dark transition"
                >
                  <MdShoppingCart className="text-base sm:text-lg" />
                </button>
              </>
            ) : isSelectingQty ? (
              /* Premium Interactive Quantity Selector */
              <div className="flex h-9 w-full items-center justify-between rounded-xl border border-brand/40 bg-slate-100 dark:bg-[#121319] p-1 shadow-inner animate-in fade-in duration-200">
                <div className="flex flex-1 items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={handleMinus}
                    aria-label="Kamaytirish"
                    title="Kamaytirish"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold shadow-xs hover:bg-brand/10 dark:hover:bg-brand/20 active:scale-95 transition cursor-pointer"
                  >
                    <MdRemove className="text-sm font-black" />
                  </button>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    onClick={handlePlus}
                    aria-label="Ko'paytirish"
                    title="Ko'paytirish"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold shadow-xs hover:bg-brand/10 dark:hover:bg-brand/20 active:scale-95 transition cursor-pointer"
                  >
                    <MdAdd className="text-sm font-black" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmQty}
                  title="Tasdiqlash"
                  aria-label="Tasdiqlash"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition cursor-pointer ml-1"
                >
                  <MdCheck className="text-sm font-extrabold" />
                </button>
              </div>
            ) : (
              /* Savatda Button replacing price row */
              <button
                type="button"
                onClick={handleSavatdaClick}
                title="Savatda"
                aria-label="Savatda"
                className="flex h-8 sm:h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
              >
                <MdCheck className="text-sm sm:text-base font-black" />
                <span>Savatda</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
