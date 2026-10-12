"use client";
import Link from "next/link";
import { MdFavoriteBorder, MdArrowForward } from "react-icons/md";
import { useCart } from "@/lib/cartContext";
import ProductCard from "./ProductCard";

export default function WishlistClient({ t }) {
  const { wishlist, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-slate-400">{t.auth?.loading || "Yuklanmoqda..."}</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <MdFavoriteBorder className="text-5xl" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">Saralanganlar bo'sh</h1>
        <p className="mt-2 text-sm text-slate-500">
          O'zingizga yoqqan mahsulotlarning yurakcha belgisini bosib, keyinroq xarid qilish uchun saqlab qo'ying.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark transition"
        >
          Mahsulotlarni ko'rish <MdArrowForward />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Saralanganlar</h1>
          <p className="text-sm text-slate-500">{wishlist.length} ta saqlangan mahsulot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4">
        {wishlist.map((p) => (
          <ProductCard key={p.id || p._id} product={p} t={t} />
        ))}
      </div>
    </div>
  );
}

