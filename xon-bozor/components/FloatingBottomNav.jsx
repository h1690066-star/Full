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
  const [lang, setLang] = useState("uz");

  useEffect(() => {
    const sync = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setUser(null);
      } else {
        setUser(getCurrentUser());
      }
    };
    sync();
    const handleAuth = (e) => setUser(e.detail || (localStorage.getItem("token") ? getCurrentUser() : null));
    window.addEventListener("auth-change", handleAuth);

    const updateLang = () => {
      if (typeof document !== "undefined") {
        const m = document.cookie.match(/(^|;\s*)lang=([^;]+)/);
        const l = m && (m[2] === "ru" || m[2] === "en" || m[2] === "uz") ? m[2] : (localStorage.getItem("lang") || "uz");
        setLang(l);
      }
    };
    updateLang();
    window.addEventListener("lang-change", updateLang);

    const dark = document.documentElement.classList.contains("dark");
    setIsDark(dark);
    const handleThemeChange = (e) => setIsDark(e.detail === "dark");
    window.addEventListener("theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("auth-change", handleAuth);
      window.removeEventListener("lang-change", updateLang);
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, []);

  const navLabels = {
    uz: { home: "Bosh sahifa", catalog: "Katalog", cart: "Savat", wishlist: "Saralangan", profile: "Profil" },
    ru: { home: "Главная", catalog: "Каталог", cart: "Корзина", wishlist: "Избранное", profile: "Профиль" },
    en: { home: "Home", catalog: "Catalog", cart: "Cart", wishlist: "Wishlist", profile: "Profile" },
  }[lang] || { home: "Bosh sahifa", catalog: "Katalog", cart: "Savat", wishlist: "Saralangan", profile: "Profil" };

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    const nextDark = !isDark;

    const apply = () => {
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

    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  const tabs = [
    {
      id: "home",
      label: navLabels.home,
      href: "/",
      icon: MdHome,
      isActive: pathname === "/",
    },
    {
      id: "catalog",
      label: navLabels.catalog,
      href: "/catalog",
      icon: MdGridView,
      isActive: pathname.startsWith("/catalog") || pathname.startsWith("/search"),
    },
    {
      id: "cart",
      label: navLabels.cart,
      href: "/cart",
      icon: MdShoppingCart,
      count: hydrated ? cartCount : 0,
      isActive: pathname === "/cart",
    },
    {
      id: "wishlist",
      label: navLabels.wishlist,
      href: "/wishlist",
      icon: MdFavoriteBorder,
      activeIcon: MdFavorite,
      count: hydrated ? wishlistCount : 0,
      isActive: pathname === "/wishlist",
    },
    {
      id: "profile",
      label: navLabels.profile,
      href: user ? "/profile" : "/login",
      icon: MdPersonOutline,
      isActive: pathname === "/profile" || pathname === "/login" || pathname === "/register",
    },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const avatar = user?.avatar;
  const avatarUrl =
    avatar && typeof avatar === "string" && avatar.trim()
      ? avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:") || avatar.startsWith("blob:")
        ? avatar
        : `${apiBase}${avatar.startsWith("/") ? "" : "/"}${avatar}`
      : null;
  const initialLetter = user?.name && user.name.trim().length > 0 ? user.name.trim().charAt(0).toUpperCase() : "";
  const [avatarErr, setAvatarErr] = useState(false);

  useEffect(() => {
    setAvatarErr(false);
  }, [avatarUrl]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto min-[1251px]:hidden">
      <nav className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#1a1b20]/90 p-1.5 shadow-2xl backdrop-blur-xl border border-white/10 transition-all duration-300">
        {tabs.map((tab) => {
          const Icon = tab.isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
          const isProfileTab = tab.id === "profile" && Boolean(user);

          const renderProfileIcon = (active) => {
            if (avatarUrl && !avatarErr) {
              return (
                <img
                  src={avatarUrl}
                  alt={user?.name || "User"}
                  className={`${active ? "h-5 w-5" : "h-6 w-6"} rounded-full object-cover shrink-0 ring-1 ring-white/30`}
                  onError={() => setAvatarErr(true)}
                />
              );
            }
            if (initialLetter) {
              return (
                <span className={`flex ${active ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs"} items-center justify-center rounded-full bg-brand/30 text-white font-black shrink-0`}>
                  {initialLetter}
                </span>
              );
            }
            return <Icon className={active ? "text-lg sm:text-xl shrink-0" : "text-xl sm:text-2xl"} />;
          };

          if (tab.isActive) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-brand/40 transition-all duration-300 scale-105"
              >
                {isProfileTab ? renderProfileIcon(true) : <Icon className="text-lg sm:text-xl shrink-0" />}
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
              {isProfileTab ? renderProfileIcon(false) : <Icon className="text-xl sm:text-2xl" />}

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
