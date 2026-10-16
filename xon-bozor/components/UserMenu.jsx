"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdPersonOutline } from "react-icons/md";
import { getMe, getCurrentUser } from "@/lib/services/users";

export default function UserMenu({ loginLabel }) {
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const cached = getCurrentUser();
    if (cached) setUser(cached);

    let timer = null;
    const syncUser = (immediate = false) => {
      if (!localStorage.getItem("token")) {
        setUser(null);
        return;
      }
      const u = getCurrentUser();
      if (u) setUser(u);

      const doFetch = () => {
        getMe()
          .then((d) => {
            const fresh = d?.user || d;
            if (fresh && fresh.name) {
              setUser(fresh);
              localStorage.setItem("user", JSON.stringify(fresh));
            }
          })
          .catch(() => {});
      };

      if (immediate) {
        doFetch();
      } else {
        doFetch(); // Darhol sinxronlash
      }
    };

    syncUser(true);

    const handleAuthChange = (e) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        syncUser(true);
      }
    };

    const handleStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const name = user?.name || user?.fullName || "";
  const avatar = user?.avatar;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";

  let avatarUrl = null;
  if (avatar && typeof avatar === "string" && avatar.trim()) {
    if (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:") || avatar.startsWith("blob:")) {
      avatarUrl = avatar;
    } else {
      const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
      avatarUrl = `${apiBase}${cleanPath}`;
    }
  }

  // Har safar yangi avatarUrl kelganda xatolik flagini tozalaymiz
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const initialLetter = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <Link
      href={user ? "/profile" : "/login"}
      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-soft dark:hover:bg-white/[0.06] hover:text-brand dark:hover:text-brand-300 transition group"
    >
      {avatarUrl && !imgError ? (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/30 dark:ring-brand/40 shadow-xs">
          <img
            src={avatarUrl}
            alt={name || "User"}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : initialLetter ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand dark:bg-brand-400/20 dark:text-brand-300 font-extrabold text-xs shadow-xs ring-1 ring-brand/20 select-none">
          {initialLetter}
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-300 shadow-xs select-none">
          <MdPersonOutline className="text-lg" />
        </div>
      )}
      <span className="hidden max-w-28 truncate sm:inline font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand dark:group-hover:text-brand-300 transition-colors">
        {name || loginLabel}
      </span>
    </Link>
  );
}

