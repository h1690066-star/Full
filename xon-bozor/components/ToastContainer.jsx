"use client";
import { useEffect, useState } from "react";
import { MdCheckCircle, MdInfo, MdClose } from "react-icons/md";

export function toast(message, type = "success") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type, id: Date.now() } }));
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type, id } = e.detail || {};
      if (!message) return;
      
      const newToast = { id, message, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener("app-toast", handleToast);
    return () => window.removeEventListener("app-toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 dark:bg-[#1a1b22]/95 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 sm:slide-in-from-right-5"
        >
          <div className="flex items-center gap-2.5">
            <MdCheckCircle className="text-xl text-emerald-400 shrink-0" />
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-slate-400 hover:text-white transition p-0.5"
            aria-label="Yopish"
          >
            <MdClose className="text-base" />
          </button>
        </div>
      ))}
    </div>
  );
}

