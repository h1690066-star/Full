import React from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  User,
  Crown,
  Package,
} from 'lucide-react';

export default function CustomerDrawer({ customer, isOpen, onClose }) {
  if (!isOpen || !customer) return null;

  const name = customer.name || customer.username || 'Mijoz';
  const email = customer.email || 'Email kiritilmagan';
  const phone = customer.phone || 'Telefon kiritilmagan';
  const initials =
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'MX';

  const regDate = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('uz-UZ')
    : '-';

  const ordersCount = Number(customer.ordersCount || 0);
  const totalSpent = Number(customer.totalSpent || 0);
  const avgCheck = Number(
    customer.avgCheck || (ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0)
  );
  const isVip = customer.isVip || totalSpent >= 10000000 || ordersCount >= 3;
  const orderHistory = Array.isArray(customer.orderHistory) ? customer.orderHistory : [];

  const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm";
  const formatShort = (val) => {
    const n = Number(val || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M so\'m';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K so\'m';
    return n + " so'm";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Mijoz Dosyesi</h2>
              <p className="text-[11px] text-slate-400">Real vaqt xaridlar tarixi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Profile Card Header */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 flex items-start gap-4">
            <div
              className={`w-14 h-14 font-black text-lg rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isVip
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
              }`}
            >
              {initials}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900">{name}</h3>
                {isVip ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> VIP Mijoz
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    ● Faol
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">{phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Ro'yxatdan o'tgan: {regDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Real Stat Boxes (Buyurtmalar, Jami xarid, O'rtacha chek) */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Buyurtmalar</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{ordersCount} ta</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Jami xarid</div>
              <div className="text-sm font-black text-indigo-600 mt-0.5">{formatShort(totalSpent)}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase">O'rtacha chek</div>
              <div className="text-sm font-black text-emerald-600 mt-0.5">{formatShort(avgCheck)}</div>
            </div>
          </div>

          {/* Manzillar Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Yetkazib berish manzili</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              {customer.lastAddress || "Hozircha buyurtma manzili ko'rsatilmagan"}
            </div>
          </div>

          {/* Buyurtmalar tarixi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                Haqiqiy buyurtmalar tarixi
              </span>
              <span className="text-slate-400 text-[11px] font-semibold">
                {orderHistory.length} ta buyurtma
              </span>
            </div>

            {orderHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5">
                <Package className="w-6 h-6 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">Buyurtmalar yo'q</div>
                <div className="text-[11px] text-slate-400">
                  Ushbu mijoz hali buyurtma rasmiylashtirmagan
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {orderHistory.map((item) => {
                  const isConfirmed = item.status === 'confirmed' || item.status === 'Tasdiqlangan';
                  const isCancelled = item.status === 'cancelled' || item.status === 'Bekor qilingan';
                  const dateFormatted = item.date
                    ? new Date(item.date).toLocaleDateString('uz-UZ')
                    : '-';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">{item.orderNumber}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          ● {isConfirmed ? 'Tasdiqlangan' : isCancelled ? 'Bekor qilingan' : 'Yangi'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>
                          {dateFormatted} • {item.itemsCount || 1} ta mahsulot
                        </span>
                        <span className="font-black text-slate-900">{formatMoney(item.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
