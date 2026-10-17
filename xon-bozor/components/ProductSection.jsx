"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  MdChevronRight,
  MdArrowForward,
  MdLocalFireDepartment,
  MdSearch,
  MdClose,
} from "react-icons/md";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductSection({
  title = "Mahsulotlar",
  href = "/catalog",
  allLabel = "Barchasini ko'rish",
  products,
  t,
  hot = false,
  id = "products",
  priority = false,
}) {
  const [items, setItems] = useState(products || []);
  const [loading, setLoading] = useState(!products || products.length === 0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (products && products.length > 0) {
      setItems(products);
      setLoading(false);
    }
  }, [products]);

  // Agar serverdan kelgan mahsulotlar ro'yxati bo'sh bo'lsa (masalan cold-start), client-side yuklaymiz
  useEffect(() => {
    if (!products || products.length === 0) {
      setLoading(true);
      fetch("/api/products?limit=10000")
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.items || [];
          if (list.length > 0) {
            let filteredList = list;
            if (id === "new") {
              filteredList = list.filter((p) => {
                const cat = (p.category || "").toLowerCase();
                return !p.used && (cat === "phones" || cat === "smartfonlar" || !cat);
              });
            } else if (id === "used") {
              filteredList = list.filter((p) => p.used);
            } else if (id === "appliances") {
              filteredList = list.filter((p) => {
                const cat = (p.category || "").toLowerCase();
                return (
                  cat.includes("appliance") ||
                  cat.includes("maishiy") ||
                  cat.includes("elektronika")
                );
              });
            }
            if (filteredList.length > 0) {
              setItems(filteredList);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [products, id]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items || [];
    const q = query.trim().toLowerCase();
    return (items || []).filter((p) =>
      (p.name || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <section id={id} className="mx-auto max-w-7xl px-3 sm:px-4 pt-8 sm:pt-10" aria-labelledby={`${id}-h`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Chap taraf: Sarlavha va link */}
        <div className="flex items-center gap-2">
          <Link href={href} className="flex items-center gap-1 group">
            {hot && <MdLocalFireDepartment className="text-2xl text-orange-500" />}
            <h2
              id={`${id}-h`}
              className="text-xl font-extrabold sm:text-2xl text-slate-900 dark:text-white group-hover:text-brand transition"
            >
              {title}
            </h2>
            <MdChevronRight className="text-2xl text-brand group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            href={href}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            {allLabel}
            <MdArrowForward />
          </Link>
        </div>

        {/* O'ng taraf: Qidiruv maydoni (Search) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-80">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${title || "Mahsulotlar"} ichidan qidirish...`}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-brand shadow-xs transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Tozalash"
              >
                <MdClose className="text-sm" />
              </button>
            )}
          </div>
          <Link
            href={href}
            className="sm:hidden inline-flex items-center gap-1 text-xs font-semibold text-brand whitespace-nowrap"
          >
            {allLabel}
            <MdArrowForward />
          </Link>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          <ProductSkeleton count={10} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1b22] p-8 text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Mahsulot mavjud emas</p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-2 text-xs font-semibold text-brand hover:underline block mx-auto"
            >
              Qidiruvni tozalash
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {filtered.map((p, idx) => (
            <ProductCard key={p.id || p._id} product={p} t={t} priority={priority && idx < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
