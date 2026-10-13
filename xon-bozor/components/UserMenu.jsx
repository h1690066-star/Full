"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdPersonOutline } from "react-icons/md";
import { getMe, getCurrentUser } from "@/lib/services/users";

export default function UserMenu({ loginLabel }) {
  const [user, setUser] = useState(null);

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
        timer = setTimeout(doFetch, 1500);
      }
    };

    syncUser(false);

    const handleAuthChange = (e) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        syncUser(true);
      }
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const name = user?.name || user?.fullName;
  const avatar = user?.avatar;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const avatarUrl = avatar ? (avatar.startsWith("http") ? avatar : `${apiBase}${avatar}`) : null;

  return (
    <Link
      href={user ? "/profile" : "/login"}
      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-brand-soft hover:text-brand transition"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || "User"}
          className="h-7 w-7 rounded-full object-cover border border-brand/20 shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-xs">
          {name ? name.charAt(0).toUpperCase() : <MdPersonOutline className="text-xl" />}
        </div>
      )}
      <span className="hidden max-w-28 truncate sm:inline font-semibold">{name || loginLabel}</span>
    </Link>
  );
}

