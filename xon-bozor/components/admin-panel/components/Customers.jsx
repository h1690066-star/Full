import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserX,
  Crown,
  ShoppingBag,
  Wallet,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { getUsers } from '../api/api';
import CustomerDrawer from './CustomerDrawer';

export default function Customers({ globalSearch = '' }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all'); // 'all' | 'active' | 'vip'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const data = await getUsers();
        const items = data.items || data;
        setUsersList(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm";
  const formatShortMoney = (val) => {
    const n = Number(val || 0);
    if (n >= 1000000000) return (n / 1000000000).toFixed(2) + ' mlrd';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' mln';
    if (n >= 1000) return (n / 1000).toFixed(0) + ' ming';
    return n.toString();
  };

  const combinedSearch = (search || globalSearch || '').trim().toLowerCase();

  // Real metrics from enriched backend response
  const totalCustomers = usersList.length;
  const activeBuyersCount = usersList.filter((u) => Number(u.ordersCount || 0) > 0).length;
  const vipCustomersCount = usersList.filter(
    (u) => u.isVip || Number(u.totalSpent || 0) >= 10000000 || Number(u.ordersCount || 0) >= 3
  ).length;
  const totalCustomerSpend = usersList.reduce((acc, u) => acc + Number(u.totalSpent || 0), 0);

  const filteredUsers = usersList.filter((u) => {
    const ordersCount = Number(u.ordersCount || 0);
    const totalSpent = Number(u.totalSpent || 0);
    const isVip = u.isVip || totalSpent >= 10000000 || ordersCount >= 3;

    if (segmentFilter === 'active' && ordersCount === 0) return false;
    if (segmentFilter === 'vip' && !isVip) return false;

    if (!combinedSearch) return true;
    const name = (u.name || u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    return name.includes(combinedSearch) || email.includes(combinedSearch) || phone.includes(combinedSearch);
  });

  const handleOpenCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top 4 Real CRM Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Jami Mijozlar Bazasi
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalCustomers} <span className="text-xs font-semibold text-slate-400">nafar</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1">
              Ro'yxatdan o'tgan profil va xaridorlar
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Xarid Qilgan Faollar
            </div>
            <div className="text-2xl font-black text-slate-900">
              {activeBuyersCount} <span className="text-xs font-semibold text-slate-400">nafar</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              Kamida 1 ta buyurtma berganlar
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              VIP Mijozlar
            </div>
            <div className="text-2xl font-black text-slate-900">
              {vipCustomersCount} <span className="text-xs font-semibold text-slate-400">nafar</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-600 mt-1">
              10 mln+ so'm yoki 3+ buyurtma
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Jami Mijozlar Xaridi
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatShortMoney(totalCustomerSpend)} <span className="text-xs font-semibold text-slate-400">so'm</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1">
              {formatMoney(totalCustomerSpend)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold w-full md:w-auto">
          {[
            { id: 'all', label: `Barchasi (${totalCustomers})` },
            { id: 'active', label: `Xarid qilganlar (${activeBuyersCount})` },
            { id: 'vip', label: `VIP Mijozlar (${vipCustomersCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSegmentFilter(tab.id)}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                segmentFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email yoki telefon raqami..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium"
          />
        </div>
      </div>

      {/* Customer Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Haqiqiy mijozlar bazasi yuklanmoqda...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <UserX className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">Mijoz topilmadi</div>
            <div className="text-xs max-w-xs mx-auto text-slate-400 font-medium">
              Qidiruv yoki filtr mezonlariga mos keladigan mijozlar mavjud emas.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">MIJOZ PROFILI</th>
                  <th className="py-4 px-6">ALOQA MA'LUMOTLARI</th>
                  <th className="py-4 px-6">MANZIL</th>
                  <th className="py-4 px-6">BUYURTMALAR</th>
                  <th className="py-4 px-6">HAQIQIY XARID SUMMASI</th>
                  <th className="py-4 px-6">RO'YXATDAN O'TGAN</th>
                  <th className="py-4 px-6 text-right">BATAFSIL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((item, index) => {
                  const name = item.name || item.username || 'Mijoz';
                  const initials =
                    name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2) || 'MX';

                  const ordersCount = Number(item.ordersCount || 0);
                  const totalSpent = Number(item.totalSpent || 0);
                  const isVip = item.isVip || totalSpent >= 10000000 || ordersCount >= 3;
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('uz-UZ')
                    : '-';

                  return (
                    <tr
                      key={item.id || item._id || index}
                      onClick={() => handleOpenCustomer(item)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                    >
                      {/* MIJOZ */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 font-black text-xs rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                              isVip
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                                : ordersCount > 0
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{name}</span>
                              {isVip && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-700">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              {ordersCount > 0 ? 'Faol xaridor' : "Ro'yxatdan o'tgan"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ALOQA */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.phone || 'Kiritilmagan'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{item.email || '-'}</span>
                        </div>
                      </td>

                      {/* MANZIL */}
                      <td className="py-4 px-6 text-slate-600 max-w-[200px] truncate">
                        {item.lastAddress || 'Manzil kiritilmagan'}
                      </td>

                      {/* BUYURTMALAR */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            ordersCount > 0
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {ordersCount} ta buyurtma
                        </span>
                      </td>

                      {/* JAMI XARID */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 text-xs">
                          {formatMoney(totalSpent)}
                        </div>
                        {ordersCount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            O'rtacha: {formatShortMoney(item.avgCheck || Math.round(totalSpent / ordersCount))} so'm
                          </div>
                        )}
                      </td>

                      {/* SANA */}
                      <td className="py-4 px-6 text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* AMALLAR */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomer(item);
                          }}
                          className="p-2 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          title="Mijoz ma'lumotlarini ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Ko'rsatilyapti: <span className="text-slate-900 font-bold">{filteredUsers.length}</span> dan{' '}
            <span className="text-slate-900 font-bold">{usersList.length}</span> ta mijoz
          </div>
          <div className="text-[11px] text-slate-400">
            Mijoz ustiga bosib barcha buyurtmalari tarixini ko'ring
          </div>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      <CustomerDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
