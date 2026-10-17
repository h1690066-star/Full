"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdShoppingBag,
  MdLocalShipping,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdArrowForward,
  MdReceiptLong,
  MdLocationOn,
} from "react-icons/md";
import { api } from "@/lib/api";

export default function OrdersClient({ t }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    api
      .get("/api/orders/my")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        setOrders(list);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (val) => {
    const n = Number(val) || 0;
    return n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return {
          label: "To'langan",
          icon: MdCheckCircle,
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
        };
      case "shipping":
        return {
          label: "Yetkazilmoqda",
          icon: MdLocalShipping,
          cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
        };
      case "completed":
        return {
          label: "Yetkazildi",
          icon: MdCheckCircle,
          cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
        };
      case "cancelled":
        return {
          label: "Bekor qilingan",
          icon: MdCancel,
          cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
        };
      default:
        return {
          label: "Ko'rib chiqilmoqda",
          icon: MdAccessTime,
          cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
        };
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="space-y-4">
          <div className="skeleton h-44 rounded-3xl" />
          <div className="skeleton h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-5 animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300">
          <MdReceiptLong className="text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Buyurtmalarni ko'rish
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Buyurtmalaringiz tarixini ko'rish uchun hisobingizga kiring.
        </p>
        <Link href="/login" className="btn-primary inline-flex h-12 px-8">
          Kirish
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-5 animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400">
          <MdShoppingBag className="text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Hozircha buyurtmalar yo'q
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Siz hali birorta ham buyurtma bermagansiz. Katalogdan o'zingizga ma'qul mahsulotni tanlang.
        </p>
        <Link href="/catalog" className="btn-primary inline-flex h-12 px-8">
          Katalogga o'tish
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Mening buyurtmalarim
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Jami {orders.length} ta buyurtma
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          Xaridni davom ettirish <MdArrowForward />
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const badge = getStatusBadge(o.status);
          const StatusIcon = badge.icon;
          return (
            <div
              key={o.id || o.orderNumber}
              className="surface overflow-hidden rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/70 dark:border-white/[0.06] space-y-4 transition hover:border-brand/30"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Buyurtma raqami
                  </span>
                  <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                    {o.orderNumber || o.id}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDate(o.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.cls}`}
                  >
                    <StatusIcon className="text-sm" />
                    <span>{badge.label}</span>
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {(o.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-white/[0.06]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <MdShoppingBag className="text-xl text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.quantity || item.qty} dona × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                      {formatPrice((item.price || 0) * (item.quantity || item.qty || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Address and Total */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/[0.06] pt-4 text-xs">
                {o.address && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MdLocationOn className="text-base text-brand shrink-0" />
                    <span className="line-clamp-1">{o.address.text || o.address.title}</span>
                  </div>
                )}
                <div className="ml-auto text-right">
                  <span className="text-slate-400 mr-2">Jami:</span>
                  <span className="font-display text-lg font-black text-brand tabular-nums">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

