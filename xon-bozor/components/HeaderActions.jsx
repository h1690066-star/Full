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
    document.documentElement.classList.add("theme-transitioning");
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
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 450);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {/* Theme Switcher Button */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="icon-btn"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          {isDark ? (
            <MdWbSunny className="text-[22px] text-amber-400 animate-scale-in" />
          ) : (
            <MdDarkMode className="text-[22px] text-slate-700 animate-scale-in" />
          )}
        </span>
      </button>

      <UserMenu loginLabel={t.login} />

      <Link
        href="/wishlist"
        aria-label={t.wishlist}
        className="icon-btn"
      >
        {hydrated && wishlistCount > 0 ? (
          <MdFavorite className="text-[23px] text-rose-500" />
        ) : (
          <MdFavoriteBorder className="text-[23px]" />
        )}
        {hydrated && wishlistCount > 0 && (
          <span className="badge-count right-0.5 top-0.5">{wishlistCount}</span>
        )}
      </Link>

      <Link
        href="/cart"
        aria-label={t.cart}
        className="group relative ml-1 flex h-11 items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand-dark px-3.5 text-sm font-bold text-white shadow-md shadow-brand/20 transition active:scale-95 sm:px-4"
      >
        <span className="relative flex items-center justify-center text-white">
          <MdShoppingCart className="text-[22px]" />
          {hydrated && cartCount > 0 && (
            <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-slate-900 ring-2 ring-brand">
              {cartCount}
            </span>
          )}
        </span>
        <span className="relative hidden sm:inline text-white font-bold">{t.cart}</span>
      </Link>
    </div>
  );
}
