"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdLanguage, MdExpandMore, MdCheck } from "react-icons/md";
import { LANGS } from "@/lib/dictionaries";

export default function LanguageSwitcher({ current }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = LANGS.find((l) => l.code === current) || LANGS[0];

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const change = (code) => {
    if (code === current) {
      setOpen(false);
      return;
    }
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    try {
      localStorage.setItem("lang", code);
      window.dispatchEvent(new CustomEvent("lang-change", { detail: code }));
    } catch {}
    setOpen(false);
    // window.location.reload() orqali yangi cookie bilan butun sahifa serverdan qayta yuklanadi
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        aria-label="Language"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand font-medium transition cursor-pointer select-none"
      >
        <MdLanguage className="text-base text-brand dark:text-brand-300" />
        <span className="font-semibold">{active.label}</span>
        <MdExpandMore className={`text-base transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-2 z-50 min-w-44 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b22] py-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {LANGS.map((l) => {
            const isSelected = l.code === current;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => change(l.code)}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold transition hover:bg-brand-soft dark:hover:bg-slate-800 cursor-pointer ${
                    isSelected ? "text-brand bg-brand-soft/60 dark:bg-brand/20 font-bold" : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isSelected ? <MdCheck className="text-sm font-black text-brand" /> : <span className="w-3.5" />}
                    <span>{l.label}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">{l.short}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
