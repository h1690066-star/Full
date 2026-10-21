import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  LogOut,
  Globe,
  Database,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenAddProduct, counts = {} }) {
  const { logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Boshqaruv paneli',
      sub: 'Statistika va 3 xil grafik',
      icon: LayoutDashboard,
      badge: '3 Grafik',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'products',
      label: 'Mahsulotlar',
      sub: 'Katalog va ombor zaxirasi',
      icon: Package,
      badge: counts.products ? `${counts.products} ta` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'orders',
      label: 'Buyurtmalar',
      sub: "To'lov cheklari va holat",
      icon: ShoppingCart,
      badge: counts.orders ? `${counts.orders} ta` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'customers',
      label: 'Mijozlar',
      sub: 'Xaridorlar va tarix',
      icon: Users,
      badge: counts.customers ? `${counts.customers} ta` : null,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'site-editor',
      label: 'Saytni tahrirlash',
      sub: 'Bannerlar va jonli CMS',
      icon: Globe,
      badge: 'CMS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <aside className="w-72 bg-[#070b14] text-white flex flex-col min-h-screen shrink-0 border-r border-slate-800/80 relative overflow-hidden select-none">
      {/* Decorative Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 -right-20 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/[0.07] relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-emerald-500 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-[#0b1120] rounded-[15px] flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white leading-none">
                XON BOZOR
              </h2>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Yangi avlod boshqaruv tizimi
            </p>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-6 pt-5 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center justify-between relative z-10">
        <span>Asosiy Bo'limlar</span>
        <Sparkles className="w-3 h-3 text-indigo-400" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3.5 py-2 space-y-1.5 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/25 via-violet-600/15 to-transparent border-indigo-500/40 text-white shadow-lg shadow-indigo-950/50'
                  : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-900/90 text-slate-400 group-hover:text-white group-hover:bg-slate-800 border border-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className={`text-xs leading-tight ${isActive ? 'font-bold text-white' : 'font-semibold'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Database Status Card */}
      <div className="px-4 py-2 relative z-10">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/[0.07] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend & Baza</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Faol
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Barcha eski va yangi ma'lumotlar sinxronlangan ({counts.products || 25} mahsulot, {counts.orders || 22} buyurtma).
          </p>
        </div>
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-4 space-y-2.5 border-t border-white/[0.07] relative z-10">
        <button
          onClick={onOpenAddProduct}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi mahsulot qo'shish</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
}
