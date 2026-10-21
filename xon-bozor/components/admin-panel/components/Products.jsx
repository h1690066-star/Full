import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Image as ImageIcon,
  Layers,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { getProducts, deleteProduct, getImageUrl } from '../api/api';

export default function Products({ onOpenAddProduct, onEditProduct, globalSearch = '' }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [brand, setBrand] = useState('Barchasi');
  const [sort, setSort] = useState('Yangi');

  const [deletingId, setDeletingId] = useState(null);

  const combinedSearch = search || globalSearch || '';

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        category: category !== 'Barchasi' ? category : '',
        brand: brand !== 'Barchasi' ? brand : '',
        search: combinedSearch,
        page,
        limit: 12,
      });

      if (data) {
        const items = data.items || data;
        setProducts(Array.isArray(items) ? items : []);
        setTotal(data.total || items.length || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [page, category, brand, combinedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatdan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      try {
        fetch('https://xonbozoruz.vercel.app/api/revalidate', { method: 'POST', mode: 'no-cors' }).catch(() => {});
      } catch (_) {}
      fetchProductsList();
    } catch (err) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const formatMoney = (val) => {
    if (!val) return '-';
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string' && images) return images;
    return null;
  };

  // Sort items locally as well
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'Arzonroq') return (a.price || 0) - (b.price || 0);
    if (sort === 'Qimmatroq') return (b.price || 0) - (a.price || 0);
    if (sort === 'Omborda kam') return (a.stock || 0) - (b.stock || 0);
    return 0;
  });

  const pageStockSum = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const lowStockCount = products.filter((p) => Number(p.stock || 0) <= 5).length;
  const pageValueSum = products.reduce(
    (acc, p) => acc + Number(p.price || 0) * Math.max(Number(p.stock || 1), 1),
    0
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Jami Mahsulot Turlari
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {total} <span className="text-xs font-semibold text-slate-400">tur</span>
            </div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-0.5">
              Joriy sahifada {pageStockSum} dona zaxira
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sahifadagi Tovar Qiymati
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatMoney(pageValueSum)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              Faol sotuvdagi mahsulotlar
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kam Qolgan Zaxira (&le; 5 dona)
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {lowStockCount} <span className="text-xs font-semibold text-slate-400">ta mahsulot</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
              Omborni to'ldirish tavsiya etiladi
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Mahsulot nomi, brend yoki artikul..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Select Dropdowns & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Kategoriya:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="Phones">Phones</option>
              <option value="Used Phones">Used Phones</option>
              <option value="Elektronika">Kompyuter va Elektronika</option>
              <option value="Aksessuarlar">Aksessuarlar</option>
              <option value="Home appliances">Home appliances</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Brend:</span>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Barchasi">Barchasi</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Honor">Honor</option>
              <option value="ASUS">ASUS</option>
              <option value="MSI">MSI</option>
              <option value="Artel">Artel</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span>Saralash:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="Yangi">Yangi</option>
              <option value="Arzonroq">Arzonroq</option>
              <option value="Qimmatroq">Qimmatroq</option>
              <option value="Omborda kam">Omborda kam</option>
            </select>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi mahsulot</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Mahsulotlar yuklanmoqda...</span>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Mahsulotlar topilmadi</div>
            <div className="text-xs">Qidiruv yoki filtr mezonlarini o'zgartirib ko'ring</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6 w-16">RASM</th>
                  <th className="py-4 px-6">MAHSULOT NOMI</th>
                  <th className="py-4 px-6">KATEGORIYA</th>
                  <th className="py-4 px-6">BREND</th>
                  <th className="py-4 px-6">SOTUV NARXI</th>
                  <th className="py-4 px-6">ESKI NARX</th>
                  <th className="py-4 px-6">CHEGIRMA</th>
                  <th className="py-4 px-6">ZAXIRA</th>
                  <th className="py-4 px-6 text-right">AMALLAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sortedProducts.map((item) => {
                  const imgUrl = getProductImage(item.images);
                  const isLowStock = (item.stock || 0) <= 5;
                  const skuCode = `ART-${(item._id || '').slice(-5).toUpperCase()}-UZ`;

                  return (
                    <tr key={item._id} className="hover:bg-indigo-50/20 transition-colors">
                      {/* RASM */}
                      <td className="py-3.5 px-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full items-center justify-center text-slate-300 ${
                              imgUrl ? 'hidden' : 'flex'
                            }`}
                          >
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </td>

                      {/* NOMI & SKU */}
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900 text-sm leading-snug">{item.name}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{skuCode}</div>
                      </td>

                      {/* KATEGORIYA */}
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {item.category || 'Phones'}
                        </span>
                      </td>

                      {/* BREND */}
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700">
                          {item.brand || 'Apple'}
                        </span>
                      </td>

                      {/* NARX */}
                      <td className="py-3.5 px-6 font-black text-slate-900">
                        {formatMoney(item.price)}
                      </td>

                      {/* ESKI NARX */}
                      <td className="py-3.5 px-6 text-slate-400 line-through">
                        {item.oldPrice ? formatMoney(item.oldPrice) : '-'}
                      </td>

                      {/* CHEGIRMA % */}
                      <td className="py-3.5 px-6">
                        {item.discount ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            -{item.discount}%
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* OMBOR */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            isLowStock
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                          <span>{item.stock || 0} dona</span>
                        </span>
                      </td>

                      {/* AMALLAR */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProduct(item)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Ko'rsatilmoqda{' '}
            <span className="text-slate-900 font-bold">
              {products.length > 0 ? (page - 1) * 12 + 1 : 0}-{Math.min(page * 12, total)}
            </span>{' '}
            dan <span className="text-slate-900 font-bold">{new Intl.NumberFormat('uz-UZ').format(total)}</span> ta
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            <span className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-bold">{page}</span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              disabled={page >= pages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
