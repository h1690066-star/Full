"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder, MdShoppingCart, MdWbSunny, MdDarkMode } from "react-icons/md";
import { useCart } from "@/lib/cartContext";
import UserMenu from "./UserMenu";

export default function HeaderActions({ t }) {
  const { cartCount, wishlistCount, hydrated } = useCart();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const activeDark = saved === "dark" || (!saved && document.documentElement.classList.contains("dark"));
    setIsDark(activeDark);
    if (activeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const handleThemeChange = (e) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      window.dispatchEvent(new CustomEvent("theme-change", { detail: "dark" }));
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      window.dispatchEvent(new CustomEvent("theme-change", { detail: "light" }));
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Theme Switcher Button */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-soft dark:hover:bg-slate-800 transition"
      >
        {isDark ? (
          <MdWbSunny className="text-xl text-amber-400" />
        ) : (
          <MdDarkMode className="text-xl text-slate-700" />
        )}
      </button>

      <UserMenu loginLabel={t.login} />

      <Link
        href="/wishlist"
        aria-label={t.wishlist}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-soft dark:hover:bg-slate-800 hover:text-brand transition"
      >
        <span className="relative flex items-center justify-center">
          {hydrated && wishlistCount > 0 ? (
            <MdFavorite className="text-2xl text-brand" />
          ) : (
            <MdFavoriteBorder className="text-2xl" />
          )}
          {hydrated && wishlistCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white shadow-sm">
              {wishlistCount}
            </span>
          )}
        </span>
      </Link>

      <Link
        href="/cart"
        aria-label={t.cart}
        className="relative flex h-10 items-center justify-center rounded-xl bg-brand-soft dark:bg-brand/20 px-3 py-2 text-sm font-semibold text-brand dark:text-purple-300 hover:bg-brand/15 transition"
      >
        <span className="relative flex items-center justify-center">
          <MdShoppingCart className="text-2xl" />
          {hydrated && cartCount > 0 && (
            <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white shadow-sm">
              {cartCount}
            </span>
          )}
        </span>
        <span className="hidden sm:inline ml-2">{t.cart}</span>
      </Link>
    </div>
  );
}
