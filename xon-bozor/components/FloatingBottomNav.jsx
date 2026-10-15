"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdHome,
  MdGridView,
  MdShoppingCart,
  MdFavoriteBorder,
  MdFavorite,
  MdPersonOutline,
  MdWbSunny,
  MdDarkMode,
} from "react-icons/md";
import { useCart } from "@/lib/cartContext";
import { getCurrentUser } from "@/lib/services/users";

export default function FloatingBottomNav() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, hydrated } = useCart();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuth = (e) => setUser(e.detail || getCurrentUser());
    window.addEventListener("auth-change", handleAuth);

    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
    const handleThemeChange = (e) => setIsDark(e.detail === "dark");
    window.addEventListener("theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("auth-change", handleAuth);
      window.removeEventListener("theme-change", handleThemeChange);
    };
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

  const tabs = [
    {
      id: "home",
      label: "Bosh sahifa",
      href: "/",
      icon: MdHome,
      isActive: pathname === "/",
    },
    {
      id: "catalog",
      label: "Katalog",
      href: "/catalog",
      icon: MdGridView,
      isActive: pathname.startsWith("/catalog") || pathname.startsWith("/search"),
    },
    {
      id: "cart",
      label: "Savat",
      href: "/cart",
      icon: MdShoppingCart,
      count: hydrated ? cartCount : 0,
      isActive: pathname === "/cart",
    },
    {
      id: "wishlist",
      label: "Saralangan",
      href: "/wishlist",
      icon: MdFavoriteBorder,
      activeIcon: MdFavorite,
      count: hydrated ? wishlistCount : 0,
      isActive: pathname === "/wishlist",
    },
    {
      id: "profile",
      label: "Profil",
      href: user ? "/profile" : "/login",
      icon: MdPersonOutline,
      isActive: pathname === "/profile" || pathname === "/login" || pathname === "/register",
    },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto min-[601px]:hidden">
      <nav className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#1a1b20]/90 p-1.5 shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-300">
        {tabs.map((tab) => {
          const Icon = tab.isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

          if (tab.isActive) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-brand/40 transition-all duration-300 scale-105"
              >
                <Icon className="text-lg sm:text-xl shrink-0" />
                <span className="whitespace-nowrap leading-none tracking-tight">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-label={tab.label}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
            >
              <Icon className="text-xl sm:text-2xl" />

              {tab.count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-black text-white shadow-sm border border-[#1a1b20]">
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}

        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark / Light Mode"
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-amber-400 hover:bg-white/10 active:scale-95 transition-all duration-200"
        >
          {isDark ? (
            <MdWbSunny className="text-xl sm:text-2xl text-amber-400" />
          ) : (
            <MdDarkMode className="text-xl sm:text-2xl text-slate-300" />
          )}
        </button>
      </nav>
    </div>
  );
}
