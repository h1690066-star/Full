"use client";
import { useEffect, useState, useRef } from "react";
import {
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdClose,
} from "react-icons/md";

/**
 * Universal Toast Dispatcher
 * Supports:
 *   toast("Xabar", "success" | "complete")
 *   toast("Xabar", "error" | "err")
 *   toast("Xabar", "warning" | "warn")
 *   toast("Xabar", "info")
 *
 * Helpers:
 *   toast.success("Xabar")
 *   toast.complete("Xabar")
 *   toast.error("Xabar")
 *   toast.err("Xabar")
 *   toast.warn("Xabar")
 *   toast.warning("Xabar")
 *   toast.info("Xabar")
 *   toast.dismiss(id)
 */
export function toast(message, type = "success", options = {}) {
  if (typeof window === "undefined") return;

  const detail =
    typeof message === "object" && message !== null
      ? { ...message }
      : { message: String(message || ""), type, ...options };

  if (!detail.message) return;

  detail.id = detail.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const normalizedType = normalizeToastType(detail.type);
  detail.type = normalizedType;
  detail.duration =
    detail.duration ||
    (normalizedType === "error" ? 4500 : normalizedType === "warning" ? 4000 : 3200);

  window.dispatchEvent(new CustomEvent("app-toast", { detail }));
  return detail.id;
}

toast.success = (msg, opts) =>
  toast(msg, "success", typeof opts === "number" ? { duration: opts } : opts);
toast.complete = (msg, opts) =>
  toast(msg, "complete", typeof opts === "number" ? { duration: opts } : opts);
toast.error = (msg, opts) =>
  toast(msg, "error", typeof opts === "number" ? { duration: opts } : opts);
toast.err = (msg, opts) =>
  toast(msg, "error", typeof opts === "number" ? { duration: opts } : opts);
toast.warn = (msg, opts) =>
  toast(msg, "warning", typeof opts === "number" ? { duration: opts } : opts);
toast.warning = (msg, opts) =>
  toast(msg, "warning", typeof opts === "number" ? { duration: opts } : opts);
toast.info = (msg, opts) =>
  toast(msg, "info", typeof opts === "number" ? { duration: opts } : opts);
toast.dismiss = (id) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-toast-dismiss", { detail: { id } }));
  }
};

function normalizeToastType(type) {
  const t = String(type || "").toLowerCase().trim();
  if (t === "error" || t === "err" || t === "danger" || t === "fail" || t === "xato") {
    return "error";
  }
  if (t === "warn" || t === "warning" || t === "ogohlantirish" || t === "diqqat") {
    return "warning";
  }
  if (t === "info" || t === "information" || t === "malumot") {
    return "info";
  }
  return "success"; // "success", "complete", "ok", etc.
}

const TYPE_CONFIG = {
  success: {
    defaultTitle: "Muvaffaqiyatli",
    Icon: MdCheckCircle,
    border: "border-emerald-500/40",
    glow: "shadow-[0_12px_36px_-6px_rgba(16,185,129,0.35)]",
    iconBox: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ring-2 ring-emerald-500/10",
    titleColor: "text-emerald-400",
    progressBar: "from-emerald-400 via-teal-300 to-emerald-500",
  },
  error: {
    defaultTitle: "Xatolik",
    Icon: MdError,
    border: "border-rose-500/45",
    glow: "shadow-[0_12px_36px_-6px_rgba(244,63,94,0.35)]",
    iconBox: "bg-rose-500/15 border border-rose-500/30 text-rose-400 ring-2 ring-rose-500/10",
    titleColor: "text-rose-400",
    progressBar: "from-rose-500 via-pink-400 to-red-600",
  },
  warning: {
    defaultTitle: "Ogohlantirish",
    Icon: MdWarning,
    border: "border-amber-500/45",
    glow: "shadow-[0_12px_36px_-6px_rgba(245,158,11,0.35)]",
    iconBox: "bg-amber-500/15 border border-amber-500/30 text-amber-400 ring-2 ring-amber-500/10",
    titleColor: "text-amber-400",
    progressBar: "from-amber-400 via-yellow-300 to-orange-500",
  },
  info: {
    defaultTitle: "Ma'lumot",
    Icon: MdInfo,
    border: "border-sky-500/45",
    glow: "shadow-[0_12px_36px_-6px_rgba(14,165,233,0.35)]",
    iconBox: "bg-sky-500/15 border border-sky-500/30 text-sky-400 ring-2 ring-sky-500/10",
    titleColor: "text-sky-400",
    progressBar: "from-sky-400 via-cyan-300 to-indigo-500",
  },
};

function ToastItem({ toast: item, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(item.duration || 3200);
  const startTimeRef = useRef(Date.now());

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.success;
  const { Icon } = cfg;

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 280);
  };

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    const handleDismissEvent = (e) => {
      if (e.detail?.id === item.id) {
        handleDismiss();
      }
    };
    window.addEventListener("app-toast-dismiss", handleDismissEvent);
    return () => window.removeEventListener("app-toast-dismiss", handleDismissEvent);
  }, [item.id]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(400, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden rounded-2xl border ${cfg.border} ${cfg.glow} bg-slate-900/95 dark:bg-[#12131c]/95 text-white backdrop-blur-xl transition-all duration-300 ease-out select-none ${
        isExiting
          ? "opacity-0 translate-x-8 sm:translate-x-12 scale-95 max-h-0 !my-0 !py-0 pointer-events-none"
          : "animate-toast-in max-h-40"
      }`}
    >
      <div className="flex items-start gap-3 p-3.5 sm:p-4">
        {/* Animated Icon Box */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBox}`}>
          <Icon className="text-xl animate-toast-icon" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${cfg.titleColor}`}>
              {item.title || cfg.defaultTitle}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-medium leading-snug text-slate-100 break-words">
            {item.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          aria-label="Yopish"
        >
          <MdClose className="text-base" />
        </button>
      </div>

      {/* Countdown Progress Bar (pauses on hover) */}
      <div className="h-[3px] w-full bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${cfg.progressBar}`}
          style={{
            animation: `toastProgressCountdown ${item.duration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const detail = e.detail || {};
      if (!detail.message) return;

      setToasts((prev) => {
        // Keep at most 4 toasts visible simultaneously to avoid stacking clutter
        const next = [...prev, detail];
        return next.slice(-4);
      });
    };

    window.addEventListener("app-toast", handleToast);
    return () => window.removeEventListener("app-toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:top-6 z-[99999] flex flex-col gap-2.5 sm:max-w-md pointer-events-auto"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
