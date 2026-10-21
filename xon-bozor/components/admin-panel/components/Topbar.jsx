import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, RefreshCw, Plus, ShieldCheck, Calendar } from 'lucide-react';

export default function Topbar({
  title = 'Boshqaruv paneli',
  search,
  setSearch,
  onRefresh,
  onOpenAddProduct,
}) {
  const { user } = useAuth();
  const userName = user?.name || user?.username || 'Bosh Admin';
  const initials =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'AD';

  const todayStr = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left Title & Live Indicator */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 truncate">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Jonli Baza
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span>Bugun: {todayStr}</span>
            <span>•</span>
            <span className="text-slate-500 font-semibold">Xon Bozor Analytics v2.5</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative w-48 sm:w-72 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search || ''}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Mahsulot, buyurtma yoki mijoz..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Ma'lumotlarni yangilash"
            className="p-2.5 text-slate-600 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden lg:inline">Yangilash</span>
          </button>
        )}

        {/* Quick Add Product */}
        {onOpenAddProduct && (
          <button
            onClick={onOpenAddProduct}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mahsulot</span>
          </button>
        )}

        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        {/* Admin User Profile */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 pl-2 pr-3.5 py-1.5 rounded-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black text-xs rounded-xl flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-extrabold text-slate-900 leading-tight">{userName}</div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
