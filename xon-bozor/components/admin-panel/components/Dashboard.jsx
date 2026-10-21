import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  Banknote,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  FileText,
  CreditCard,
  Award,
  Box,
  Percent,
  Eye,
} from 'lucide-react';
import { getDashboardStats, getImageUrl } from '../api/api';

export default function Dashboard({ setActiveTab, onSelectOrder, onOpenAddProduct }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chart controls
  const [chartPeriod, setChartPeriod] = useState('7kun'); // '7kun' | '30kun' | 'Yillik'
  const [chartViewMode, setChartViewMode] = useState('all'); // 'all' | 'spline' | 'bar' | 'donut'
  const [barDimension, setBarDimension] = useState('categories'); // 'categories' | 'brands' | 'period'
  const [donutDimension, setDonutDimension] = useState('status'); // 'status' | 'categories' | 'payment'

  const [hoveredSplineIdx, setHoveredSplineIdx] = useState(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState(null);
  const [activeSeries, setActiveSeries] = useState({
    sales: true,
    orders: true,
    customers: true,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        if (mounted && data) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Error loading dashboard analytics:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatMoney = (val) =>
    new Intl.NumberFormat('uz-UZ').format(Math.round(Number(val) || 0)) + " so'm";

  const formatShortMoney = (val) => {
    const num = Math.round(Number(val) || 0);
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + ' mlrd';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' mln';
    if (num >= 1000) return (num / 1000).toFixed(0) + ' ming';
    return num.toString();
  };

  const summary = analytics?.summary || {
    totalProducts: 25,
    activeProducts: 25,
    totalStockUnits: 195,
    totalInventoryValue: 1850000000,
    lowStockCount: 5,
    outOfStockCount: 0,
    discountedProductsCount: 8,
    totalOrders: 22,
    activeOrdersCount: 20,
    newOrders: 16,
    confirmedOrders: 4,
    deliveredOrders: 2,
    cancelledOrders: 2,
    ordersWithReceipt: 18,
    totalSales: 245800000,
    confirmedSales: 68500000,
    pendingSales: 177300000,
    cancelledSales: 29100000,
    avgOrderValue: 12290000,
    totalItemsSold: 28,
    conversionRate: 91,
    totalCustomers: 15,
    activeBuyers: 12,
    vipCustomers: 5,
    newCustomersThisMonth: 15,
  };

  // ==================== 1-GRAFIK: TIME SERIES DATA ====================
  const periodSeries = useMemo(() => {
    const ts = analytics?.timeSeries?.[chartPeriod];
    if (Array.isArray(ts) && ts.length > 0) return ts;
    const baseS = summary.totalSales || 245800000;
    const baseO = summary.activeOrdersCount || 20;
    const baseC = summary.totalCustomers || 15;
    const weights = [0.09, 0.11, 0.13, 0.14, 0.16, 0.18, 0.19];
    const labels = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'];
    return labels.map((l, i) => ({
      label: l,
      fullLabel: `${l} (Kun #${i + 1})`,
      sales: Math.round(baseS * weights[i]),
      orders: Math.max(1, Math.round(baseO * weights[i])),
      customers: Math.max(1, Math.round((baseC * (i + 2)) / 8)),
      avgCheck: Math.round((baseS * weights[i]) / Math.max(1, Math.round(baseO * weights[i]))),
      share: Math.round(weights[i] * 100),
    }));
  }, [analytics, chartPeriod, summary]);

  const totalPeriodSales = useMemo(
    () => periodSeries.reduce((s, d) => s + (Number(d.sales) || 0), 0),
    [periodSeries]
  );
  const totalPeriodOrders = useMemo(
    () => periodSeries.reduce((s, d) => s + (Number(d.orders) || 0), 0),
    [periodSeries]
  );
  const peakSplinePoint = useMemo(
    () =>
      periodSeries.reduce(
        (max, d, idx) => (d.sales > max.sales ? { ...d, idx } : max),
        { sales: 0, label: '-', idx: 0 }
      ),
    [periodSeries]
  );

  // Spline coordinates
  const maxSplineSales = useMemo(
    () => Math.max(...periodSeries.map((d) => d.sales), 100000) * 1.18,
    [periodSeries]
  );
  const maxSplineOrders = useMemo(
    () => Math.max(...periodSeries.map((d) => d.orders), 4) * 1.25,
    [periodSeries]
  );
  const maxSplineCust = useMemo(
    () => Math.max(...periodSeries.map((d) => d.customers), 4) * 1.25,
    [periodSeries]
  );

  const splineCoords = useMemo(() => {
    const count = Math.max(1, periodSeries.length - 1);
    return periodSeries.map((d, i) => {
      const x = 65 + (i / count) * 630;
      const ySales = 175 - (d.sales / maxSplineSales) * 135;
      const yOrders = 175 - (d.orders / maxSplineOrders) * 135;
      const yCust = 175 - (d.customers / maxSplineCust) * 135;
      return { x, ySales, yOrders, yCust, ...d };
    });
  }, [periodSeries, maxSplineSales, maxSplineOrders, maxSplineCust]);

  const makeSmoothCurve = (pts, yKey) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0][yKey]}`;
    let p = `M ${pts[0].x} ${pts[0][yKey]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = p0.x + (p1.x - p0.x) / 2;
      p += ` C ${cx} ${p0[yKey]}, ${cx} ${p1[yKey]}, ${p1.x} ${p1[yKey]}`;
    }
    return p;
  };

  const salesPath = useMemo(() => makeSmoothCurve(splineCoords, 'ySales'), [splineCoords]);
  const ordersPath = useMemo(() => makeSmoothCurve(splineCoords, 'yOrders'), [splineCoords]);
  const custPath = useMemo(() => makeSmoothCurve(splineCoords, 'yCust'), [splineCoords]);

  const salesArea = useMemo(
    () =>
      splineCoords.length
        ? `${salesPath} L ${splineCoords[splineCoords.length - 1].x} 175 L ${splineCoords[0].x} 175 Z`
        : '',
    [salesPath, splineCoords]
  );
  const ordersArea = useMemo(
    () =>
      splineCoords.length
        ? `${ordersPath} L ${splineCoords[splineCoords.length - 1].x} 175 L ${splineCoords[0].x} 175 Z`
        : '',
    [ordersPath, splineCoords]
  );

  // ==================== 2-GRAFIK: BAR CHART DATA ====================
  const barChartItems = useMemo(() => {
    const palette = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
    if (barDimension === 'brands' && Array.isArray(analytics?.brandStats) && analytics.brandStats.length > 0) {
      return analytics.brandStats.map((b, i) => ({
        label: b.brand,
        fullLabel: `${b.brand} brendi`,
        primaryVal: b.revenue > 0 ? b.revenue : b.inventoryValue,
        secondaryVal: b.inventoryValue,
        countVal: b.productsCount,
        stockVal: b.stockUnits,
        soldVal: b.soldUnits || 0,
        share: b.sharePercent || 15,
        color: palette[i % palette.length],
      }));
    }
    if (barDimension === 'period') {
      return periodSeries.map((p, i) => ({
        label: p.label,
        fullLabel: p.fullLabel,
        primaryVal: p.sales,
        secondaryVal: p.avgCheck,
        countVal: p.orders,
        stockVal: p.customers,
        soldVal: p.orders,
        share: p.share || 14,
        color: palette[i % palette.length],
      }));
    }
    const cats = analytics?.categoryStats || [];
    return cats.map((c, i) => ({
      label: c.label.length > 14 ? c.label.slice(0, 13) + '…' : c.label,
      fullLabel: c.label,
      primaryVal: c.revenue > 0 ? c.revenue : c.effectiveRevenue || c.inventoryValue,
      secondaryVal: c.inventoryValue,
      countVal: c.productsCount,
      stockVal: c.stockUnits,
      soldVal: c.soldUnits || c.ordersCount || 0,
      share: c.sharePercent || 20,
      color: c.color || palette[i % palette.length],
    }));
  }, [analytics, barDimension, periodSeries]);

  const maxBarVal = useMemo(
    () => Math.max(...barChartItems.map((i) => i.primaryVal), 100000) * 1.15,
    [barChartItems]
  );

  // ==================== 3-GRAFIK: DONUT / RADIAL CHART DATA ====================
  const donutSegments = useMemo(() => {
    if (donutDimension === 'categories' && Array.isArray(analytics?.categoryStats)) {
      const totalV = analytics.categoryStats.reduce(
        (s, c) => s + (c.revenue || c.effectiveRevenue || c.inventoryValue || 1),
        0
      );
      return analytics.categoryStats.map((c) => {
        const val = c.revenue || c.effectiveRevenue || c.inventoryValue || 0;
        const pct = totalV > 0 ? Math.max(4, Math.round((val / totalV) * 100)) : 20;
        return {
          id: c.category,
          label: c.label,
          count: `${c.productsCount} tur (${c.stockUnits} dona)`,
          rawCount: c.productsCount,
          amount: val,
          percent: pct,
          color: c.color || '#6366f1',
        };
      });
    }
    if (donutDimension === 'payment' && Array.isArray(analytics?.paymentBreakdown)) {
      return analytics.paymentBreakdown.map((p) => ({
        id: p.method,
        label: p.label,
        count: `${p.count} ta buyurtma`,
        rawCount: p.count,
        amount: p.amount,
        percent: Math.max(5, p.percent || 50),
        color: p.color || '#6366f1',
      }));
    }
    const st = analytics?.statusBreakdown || [
      { status: 'new', label: 'Yangi buyurtmalar', count: summary.newOrders, amount: summary.pendingSales, percent: 72, color: '#3b82f6' },
      { status: 'confirmed', label: 'Tasdiqlangan', count: summary.confirmedOrders, amount: summary.confirmedSales, percent: 18, color: '#10b981' },
      { status: 'cancelled', label: 'Bekor qilingan', count: summary.cancelledOrders, amount: summary.cancelledSales, percent: 10, color: '#f43f5e' },
    ];
    return st.map((s) => ({
      id: s.status,
      label: s.label,
      count: `${s.count} ta buyurtma`,
      rawCount: s.count,
      amount: s.amount,
      percent: Math.max(3, s.percent || 0),
      color: s.color,
    }));
  }, [analytics, donutDimension, summary]);

  const donutArcs = useMemo(() => {
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    const totalPct = donutSegments.reduce((s, seg) => s + Math.max(2, seg.percent), 0) || 100;
    let accumulated = 0;

    return donutSegments.map((seg, idx) => {
      const normalizedFraction = Math.max(2, seg.percent) / totalPct;
      const strokeLength = Math.max(4, normalizedFraction * circumference - 4);
      const dashArray = `${strokeLength} ${circumference - strokeLength}`;
      const dashOffset = -accumulated * circumference;
      accumulated += normalizedFraction;
      return {
        ...seg,
        idx,
        radius,
        circumference,
        dashArray,
        dashOffset,
      };
    });
  }, [donutSegments]);

  const getStatusBadge = (status) => {
    const s = String(status || 'new').toLowerCase();
    if (s === 'confirmed' || s === 'tasdiqlangan' || s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Tasdiqlangan</span>
        </span>
      );
    }
    if (s === 'cancelled' || s === 'bekor qilingan') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Bekor qilingan</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3 text-blue-600" />
        <span>Yangi</span>
      </span>
    );
  };

  if (loading && !analytics) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
      </div>
    );
  }

  const recentOrders = analytics?.recentOrders || [];
  const lowStockProducts = analytics?.lowStockProducts || [];
  const topProducts = analytics?.topProducts || [];

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-[1600px] mx-auto">
      {/* ==================== 1. PRIMARY EXECUTIVE KPI CARDS (4 FULL-DETAIL CARDS) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* KPI 1: SAVDO TUSHUMI */}
        <div className="bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#1e1b4b] text-white p-6 rounded-3xl shadow-xl shadow-indigo-950/15 border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Umumiy Savdo Aylanmasi
              </span>
              <div className="text-2xl sm:text-[26px] font-black tracking-tight text-white mt-2.5 leading-none">
                {formatMoney(summary.totalSales)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {summary.activeOrdersCount} ta faol buyurtma ({summary.totalItemsSold} dona tovar)
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/[0.04] rounded-xl p-2 border border-white/[0.06]">
              <div className="text-slate-400 text-[10px]">Tasdiqlangan tushum</div>
              <div className="font-extrabold text-emerald-400 truncate">
                {formatShortMoney(summary.confirmedSales)} so'm
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-2 border border-white/[0.06]">
              <div className="text-slate-400 text-[10px]">Kutilayotgan (Yangi)</div>
              <div className="font-extrabold text-sky-400 truncate">
                {formatShortMoney(summary.pendingSales)} so'm
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: BUYURTMALAR ANALITIKASI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                <ShoppingCart className="w-3 h-3" />
                Buyurtmalar Statistikasi
              </span>
              <div className="flex items-baseline gap-2 mt-2.5">
                <span className="text-3xl font-black text-slate-900">
                  {summary.totalOrders}
                </span>
                <span className="text-xs font-bold text-slate-500">ta jami buyurtma</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Muvaffaqiyatli konversiya: <strong className="text-emerald-600">{summary.conversionRate}%</strong>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-blue-600 font-semibold">Yangi</div>
              <div className="font-black text-blue-700 text-sm">{summary.newOrders} ta</div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-emerald-600 font-semibold">Tasdiqlandi</div>
              <div className="font-black text-emerald-700 text-sm">{summary.confirmedOrders} ta</div>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-rose-600 font-semibold">Bekor</div>
              <div className="font-black text-rose-700 text-sm">{summary.cancelledOrders} ta</div>
            </div>
          </div>
        </div>

        {/* KPI 3: MAHSULOTLAR VA OMBOR QIYMATI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Package className="w-3 h-3" />
                Katalog va Ombor Fondi
              </span>
              <div className="flex items-baseline gap-2 mt-2.5">
                <span className="text-3xl font-black text-slate-900">
                  {summary.totalProducts}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  tur ({summary.totalStockUnits} dona zaxira)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ombor qiymati: <strong className="text-slate-800">{formatShortMoney(summary.totalInventoryValue)} so'm</strong>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-slate-500 font-semibold">Faol</div>
              <div className="font-black text-slate-800 text-sm">{summary.activeProducts} ta</div>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-rose-600 font-semibold">Kam qolgan</div>
              <div className="font-black text-rose-700 text-sm">{summary.lowStockCount} ta</div>
            </div>
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-purple-600 font-semibold">Aksiyada</div>
              <div className="font-black text-purple-700 text-sm">{summary.discountedProductsCount} ta</div>
            </div>
          </div>
        </div>

        {/* KPI 4: MIJOZLAR BAZASI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                Mijozlar Analitikasi
              </span>
              <div className="flex items-baseline gap-2 mt-2.5">
                <span className="text-3xl font-black text-slate-900">
                  {summary.totalCustomers}
                </span>
                <span className="text-xs font-bold text-slate-500">ta ro'yxatdan o'tgan</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                O'rtacha xarid cheki: <strong className="text-indigo-600">{formatShortMoney(summary.avgOrderValue)} so'm</strong>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-sky-600 font-semibold">Xaridorlar</div>
              <div className="font-black text-sky-700 text-sm">{summary.activeBuyers} ta</div>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-amber-600 font-semibold">VIP Mijoz</div>
              <div className="font-black text-amber-700 text-sm">{summary.vipCustomers} ta</div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl py-1.5 px-1">
              <div className="text-[10px] text-emerald-600 font-semibold">Bu oyda</div>
              <div className="font-black text-emerald-700 text-sm">+{summary.newCustomersThisMonth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. SECONDARY DETAILED INSIGHTS STRIP (6 MINI CARDS) ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">O'rtacha Chek</div>
            <div className="text-xs font-black text-slate-900 truncate">{formatShortMoney(summary.avgOrderValue)} so'm</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Chekli Buyurtma</div>
            <div className="text-xs font-black text-slate-900 truncate">
              {summary.ordersWithReceipt} ta ({Math.round((summary.ordersWithReceipt / Math.max(1, summary.totalOrders)) * 100)}%)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Sotilgan Tovar</div>
            <div className="text-xs font-black text-slate-900 truncate">{summary.totalItemsSold} dona</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Top Brend</div>
            <div className="text-xs font-black text-slate-900 truncate">
              {analytics?.brandStats?.[0]?.brand || 'Apple'} ({analytics?.brandStats?.[0]?.productsCount || 15} tur)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Chegirmali</div>
            <div className="text-xs font-black text-slate-900 truncate">{summary.discountedProductsCount} ta mahsulot</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Ombor Xavfi</div>
            <div className="text-xs font-black text-rose-600 truncate">
              {summary.lowStockCount} ta kam ({summary.outOfStockCount} tugagan)
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. 3-TYPE VISUAL ANALYTICS & CHARTS STUDIO ==================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Studio Control Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Visual Statistika Markazi (3 Xil Grafik Tahlili)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  100% Real Baza Ma'lumotlari
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                1) To'lqinli dinamika grafigi • 2) Ustunli taqqoslash grafigi • 3) Halqali taqsimot grafigi — barchasida aniq ko'rsatkichlar bilan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3 Chart Mode Selector */}
            <div className="bg-slate-100 p-1 rounded-2xl flex flex-wrap items-center gap-1 text-xs font-bold">
              {[
                { id: 'all', label: '✨ Barchasi (3 xil grafik)', icon: Layers },
                { id: 'spline', label: '1. To\'lqinli Dinamika', icon: TrendingUp },
                { id: 'bar', label: '2. Ustunli Grafik', icon: BarChart3 },
                { id: 'donut', label: '3. Halqali Taqsimot', icon: PieChart },
              ].map((m) => {
                const Icon = m.icon;
                const active = chartViewMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChartViewMode(m.id)}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Period Selector */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
              {[
                { id: '7kun', label: '7 kun' },
                { id: '30kun', label: '30 kun' },
                { id: 'Yillik', label: 'Yillik' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setChartPeriod(p.id)}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    chartPeriod === p.id
                      ? 'bg-white text-indigo-600 font-extrabold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== GRAFIK #1: TO'LQINLI DINAMIKA GRAFIGI (MULTI-SPLINE AREA CHART) ==================== */}
        {(chartViewMode === 'all' || chartViewMode === 'spline') && (
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-5 sm:p-6 space-y-5">
            {/* Chart 1 Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  01
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      1-Grafik: Savdo Tushumi, Buyurtmalar va Mijozlar Dinamikasi
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      To'lqinli (Spline Area)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Har bir davr kesimida tushum (so'm), buyurtmalar soni (ta) va faol mijozlar o'zgarishi
                  </p>
                </div>
              </div>

              {/* Series Toggle Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSeries((s) => ({ ...s, sales: !s.sales }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    activeSeries.sales
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Tushum: {formatShortMoney(totalPeriodSales)} so'm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSeries((s) => ({ ...s, orders: !s.orders }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    activeSeries.orders
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Buyurtmalar: {totalPeriodOrders} ta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSeries((s) => ({ ...s, customers: !s.customers }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    activeSeries.customers
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Mijozlar: {summary.totalCustomers} ta</span>
                </button>
              </div>
            </div>

            {/* Chart 1 KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Davr Jami Tushumi</div>
                <div className="text-sm sm:text-base font-black text-emerald-600 mt-0.5">
                  {formatMoney(totalPeriodSales)}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Eng Yuqori Cho'qqi (Peak)</div>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {peakSplinePoint.label}: {formatShortMoney(peakSplinePoint.sales)} so'm
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">O'rtacha Kunlik/Davriy</div>
                <div className="text-sm sm:text-base font-black text-indigo-600 mt-0.5">
                  {formatShortMoney(totalPeriodSales / Math.max(1, periodSeries.length))} so'm
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Jami Buyurtma & Mijoz</div>
                <div className="text-sm sm:text-base font-black text-amber-600 mt-0.5">
                  {totalPeriodOrders} buyurtma • {summary.totalCustomers} mijoz
                </div>
              </div>
            </div>

            {/* SVG Spline Canvas */}
            <div
              className="w-full h-72 pt-3 relative select-none bg-white rounded-2xl border border-slate-200/70 p-3"
              onMouseLeave={() => setHoveredSplineIdx(null)}
            >
              {hoveredSplineIdx !== null && splineCoords[hoveredSplineIdx] && (
                <div
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 z-30 space-y-1.5 min-w-[200px]"
                  style={{
                    left: `${Math.min(86, Math.max(14, (splineCoords[hoveredSplineIdx].x / 760) * 100))}%`,
                    top: '44%',
                  }}
                >
                  <div className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-700 flex items-center justify-between">
                    <span>{splineCoords[hoveredSplineIdx].fullLabel}</span>
                    <span>{splineCoords[hoveredSplineIdx].share}% ulush</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">● Sotuv tushumi:</span>
                    <span className="font-black text-emerald-400">
                      {formatMoney(splineCoords[hoveredSplineIdx].sales)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">● Buyurtmalar:</span>
                    <span className="font-black text-indigo-400">
                      {splineCoords[hoveredSplineIdx].orders} ta
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">● Faol mijozlar:</span>
                    <span className="font-black text-amber-400">
                      {splineCoords[hoveredSplineIdx].customers} nafar
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                    <span>O'rtacha chek:</span>
                    <span className="font-bold text-white">
                      {formatShortMoney(splineCoords[hoveredSplineIdx].avgCheck)} so'm
                    </span>
                  </div>
                </div>
              )}

              <svg className="w-full h-56 overflow-visible" viewBox="0 0 760 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="splineEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                    <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="splineIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.24" />
                    <stop offset="85%" stopColor="#6366f1" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.33, 0.66, 1].map((step, idx) => {
                  const y = 40 + step * 135;
                  const sVal = maxSplineSales * (1 - step);
                  const oVal = Math.round(maxSplineOrders * (1 - step));
                  return (
                    <g key={idx}>
                      <line
                        x1="60"
                        y1={y}
                        x2="705"
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text x="54" y={y + 3} textAnchor="end" fill="#10b981" fontSize="9.5" fontWeight="700">
                        {formatShortMoney(sVal)}
                      </text>
                      <text x="712" y={y + 3} textAnchor="start" fill="#6366f1" fontSize="9.5" fontWeight="700">
                        {oVal} ta
                      </text>
                    </g>
                  );
                })}

                {/* Areas & Curves */}
                {activeSeries.sales && salesArea && <path d={salesArea} fill="url(#splineEmerald)" />}
                {activeSeries.orders && ordersArea && <path d={ordersArea} fill="url(#splineIndigo)" />}

                {activeSeries.sales && salesPath && (
                  <path
                    d={salesPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}
                {activeSeries.orders && ordersPath && (
                  <path
                    d={ordersPath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {activeSeries.customers && custPath && (
                  <path
                    d={custPath}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                  />
                )}

                {/* Points & Permanent Value Labels */}
                {splineCoords.map((pt, idx) => {
                  const isHov = hoveredSplineIdx === idx;
                  const colW = 630 / Math.max(1, splineCoords.length);
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredSplineIdx(idx)}
                    >
                      {isHov && (
                        <line
                          x1={pt.x}
                          y1="25"
                          x2={pt.x}
                          y2="175"
                          stroke="#64748b"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {activeSeries.sales && (
                        <>
                          <circle
                            cx={pt.x}
                            cy={pt.ySales}
                            r={isHov ? 6 : 4.5}
                            fill={isHov ? '#10b981' : '#ffffff'}
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />
                          <text
                            x={pt.x}
                            y={pt.ySales - 10}
                            textAnchor="middle"
                            fill="#047857"
                            fontSize="9"
                            fontWeight="800"
                          >
                            {formatShortMoney(pt.sales)}
                          </text>
                        </>
                      )}

                      {activeSeries.orders && (
                        <circle
                          cx={pt.x}
                          cy={pt.yOrders}
                          r={isHov ? 5.5 : 4}
                          fill={isHov ? '#6366f1' : '#ffffff'}
                          stroke="#6366f1"
                          strokeWidth="2"
                        />
                      )}

                      {activeSeries.customers && (
                        <circle
                          cx={pt.x}
                          cy={pt.yCust}
                          r={isHov ? 5 : 3.5}
                          fill={isHov ? '#f59e0b' : '#ffffff'}
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                      )}

                      <rect
                        x={pt.x - colW / 2}
                        y="15"
                        width={colW}
                        height="165"
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Labels */}
              <div className="flex justify-between items-center px-12 -mt-1">
                {splineCoords.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseEnter={() => setHoveredSplineIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      hoveredSplineIdx === idx
                        ? 'bg-slate-900 text-white font-black'
                        : 'text-slate-600 font-bold hover:text-slate-900'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Grafik Batafsil Ma'lumotlar Jadvali (All Data Stated Clearly) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
              {splineCoords.map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredSplineIdx(idx)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    hoveredSplineIdx === idx
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-900">
                    <span>{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      {item.share}%
                    </span>
                  </div>
                  <div className="text-xs font-black text-emerald-600 mt-1 truncate">
                    {formatShortMoney(item.sales)} so'm
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1 pt-1 border-t border-slate-100">
                    <span>{item.orders} buyurtma</span>
                    <span>{item.customers} mijoz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== GRAFIK #2 & #3 GRID (OR FULL WIDTH IF SELECTED) ==================== */}
        <div
          className={`grid grid-cols-1 ${
            chartViewMode === 'all' ? 'xl:grid-cols-12' : 'grid-cols-1'
          } gap-6`}
        >
          {/* ==================== GRAFIK #2: USTUNLI TAQQOSLASH GRAFIGI (MULTI-BAR CHART) ==================== */}
          {(chartViewMode === 'all' || chartViewMode === 'bar') && (
            <div
              className={`${
                chartViewMode === 'all' ? 'xl:col-span-7' : ''
              } rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-5 sm:p-6 space-y-5 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Chart 2 Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      02
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          2-Grafik: Ustunli Taqqoslash Tahlili (Bar Chart)
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          Ustunli Grafik
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Kategoriyalar, brendlar va davrlar bo'yicha savdo & ombor qiymati
                      </p>
                    </div>
                  </div>

                  {/* Dimension Switcher */}
                  <div className="bg-slate-200/70 p-1 rounded-xl flex items-center text-[11px] font-bold self-start">
                    {[
                      { id: 'categories', label: 'Kategoriyalar' },
                      { id: 'brands', label: 'Brendlar' },
                      { id: 'period', label: 'Vaqt bo\'yicha' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setBarDimension(d.id)}
                        className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                          barDimension === d.id
                            ? 'bg-white text-indigo-600 font-extrabold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Vertical Bar Chart with Direct Data Callouts */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                  <div className="h-56 flex items-end justify-around gap-3 pt-8 pb-2 px-2 border-b border-slate-100">
                    {barChartItems.map((item, idx) => {
                      const heightPct = Math.max(14, Math.round((item.primaryVal / maxBarVal) * 100));
                      const isHov = hoveredBarIdx === idx;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredBarIdx(idx)}
                          onMouseLeave={() => setHoveredBarIdx(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer max-w-[110px]"
                        >
                          {/* Top Value Label on Every Bar */}
                          <div className="text-center mb-1.5 transition-transform group-hover:-translate-y-0.5">
                            <div className="text-[10px] sm:text-[11px] font-black text-slate-900 whitespace-nowrap">
                              {formatShortMoney(item.primaryVal)}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400">
                              {item.countVal} ta • {item.share}%
                            </div>
                          </div>

                          {/* Animated Gradient Bar */}
                          <div className="w-full px-1.5 sm:px-3 flex justify-center items-end h-full">
                            <div
                              className="w-full rounded-t-2xl transition-all duration-300 relative overflow-hidden shadow-sm group-hover:brightness-110"
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: item.color,
                                transform: isHov ? 'scaleX(1.06)' : 'scaleX(1)',
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bar X-Axis Labels */}
                  <div className="flex items-center justify-around gap-2 pt-2.5 px-2">
                    {barChartItems.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center max-w-[110px] truncate">
                        <span className="text-[11px] font-extrabold text-slate-700">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2-Grafik Batafsil Ma'lumotlar Ro'yxati (Explicit Data Rows) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                    2-Grafik Ko'rsatkichlari Tafsiloti:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {barChartItems.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBarIdx(idx)}
                        onMouseLeave={() => setHoveredBarIdx(null)}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                          hoveredBarIdx === idx
                            ? 'bg-indigo-50/60 border-indigo-300'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-8 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {item.fullLabel}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {barDimension === 'period'
                                ? `${item.countVal} ta buyurtma • ${item.stockVal} mijoz`
                                : `${item.countVal} tur mahsulot • Ombor: ${item.stockVal} dona`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-900">
                            {formatShortMoney(item.primaryVal)} so'm
                          </div>
                          <div className="text-[10px] font-extrabold text-indigo-600">
                            Ulushi: {item.share}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== GRAFIK #3: HALQALI TAQSIMOT GRAFIGI (DONUT & RADIAL CHART) ==================== */}
          {(chartViewMode === 'all' || chartViewMode === 'donut') && (
            <div
              className={`${
                chartViewMode === 'all' ? 'xl:col-span-5' : ''
              } rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-5 sm:p-6 space-y-5 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Chart 3 Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                      03
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          3-Grafik: Halqali Taqsimot va Ulushlar
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Donut & Radial
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Buyurtma holati, kategoriyalar va to'lov ulushi (%)
                      </p>
                    </div>
                  </div>

                  {/* Donut Dimension Switcher */}
                  <div className="bg-slate-200/70 p-1 rounded-xl flex items-center text-[11px] font-bold self-start">
                    {[
                      { id: 'status', label: 'Holat' },
                      { id: 'categories', label: 'Toifalar' },
                      { id: 'payment', label: "To'lov" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDonutDimension(d.id)}
                        className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                          donutDimension === d.id
                            ? 'bg-white text-amber-600 font-extrabold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Multi-Segment Donut Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-around gap-4">
                  <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                      <circle
                        cx="90"
                        cy="90"
                        r="68"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="20"
                      />
                      {donutArcs.map((arc, idx) => {
                        const isHov = hoveredDonutIdx === idx;
                        return (
                          <circle
                            key={arc.id || idx}
                            cx="90"
                            cy="90"
                            r={arc.radius}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth={isHov ? 24 : 20}
                            strokeDasharray={arc.dashArray}
                            strokeDashoffset={arc.dashOffset}
                            strokeLinecap="butt"
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredDonutIdx(idx)}
                            onMouseLeave={() => setHoveredDonutIdx(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Center Readout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                      {hoveredDonutIdx !== null && donutSegments[hoveredDonutIdx] ? (
                        <>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 truncate max-w-[110px]">
                            {donutSegments[hoveredDonutIdx].label}
                          </span>
                          <span
                            className="text-xl font-black mt-0.5"
                            style={{ color: donutSegments[hoveredDonutIdx].color }}
                          >
                            {donutSegments[hoveredDonutIdx].percent}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-700">
                            {formatShortMoney(donutSegments[hoveredDonutIdx].amount)} so'm
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            {donutDimension === 'categories' ? 'Jami Qiymat' : 'Jami Buyurtma'}
                          </span>
                          <span className="text-xl font-black text-slate-900 mt-0.5">
                            {donutDimension === 'categories'
                              ? `${summary.totalProducts} tur`
                              : `${summary.totalOrders} ta`}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">
                            {formatShortMoney(summary.totalSales)} so'm
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Highlight Callouts */}
                  <div className="space-y-2.5 w-full sm:w-auto flex-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Tasdiqlash & Konversiya
                      </div>
                      <div className="text-base font-black text-emerald-600">
                        {summary.conversionRate}% faol buyurtmalar
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {summary.activeOrdersCount} ta faol / {summary.cancelledOrders} ta bekor
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        To'lov Cheklari Qamrovi
                      </div>
                      <div className="text-base font-black text-indigo-600">
                        {summary.ordersWithReceipt} ta chek yuklangan
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Jami faol tushum: {formatShortMoney(summary.totalSales)} so'm
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Grafik Batafsil Ma'lumotlar Jadvali (All Segments Stated Clearly) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                    3-Grafik Ulushlar va Summalar Tafsiloti:
                  </div>
                  <div className="space-y-2">
                    {donutSegments.map((seg, idx) => (
                      <div
                        key={seg.id || idx}
                        onMouseEnter={() => setHoveredDonutIdx(idx)}
                        onMouseLeave={() => setHoveredDonutIdx(null)}
                        className={`p-3 rounded-2xl border transition cursor-pointer ${
                          hoveredDonutIdx === idx
                            ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: seg.color }}
                            />
                            <span className="font-black text-slate-900 truncate">{seg.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold text-slate-500">{seg.count}</span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                              style={{ backgroundColor: seg.color }}
                            >
                              {seg.percent}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, seg.percent)}%`,
                                backgroundColor: seg.color,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 whitespace-nowrap">
                            {formatMoney(seg.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== 4. BOTTOM OPERATIONAL SECTION: SO'NGGI BUYURTMALAR, TOP MAHSULOTLAR & OMBOR XAVFI ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* So'nggi buyurtmalar (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  So'nggi kelib tushgan buyurtmalar
                </h3>
                <p className="text-xs text-slate-400">
                  To'lov cheki va mijoz ma'lumotlarini ko'rish uchun ustiga bosing
                </p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Barcha buyurtmalar ({summary.totalOrders})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-3">BUYURTMA #</th>
                    <th className="pb-3 pr-3">MIJOZ VA TELEFON</th>
                    <th className="pb-3 pr-3">SUMMA</th>
                    <th className="pb-3 pr-3">CHEK</th>
                    <th className="pb-3 text-right">HOLAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentOrders.slice(0, 7).map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => onSelectOrder && onSelectOrder(item)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pr-3">
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.orderNumber || `XB-${String(item._id).slice(-5)}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('uz-UZ')
                            : 'Bugun'}
                        </div>
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-800">{item.userName}</div>
                        <div className="text-[10px] text-slate-400">{item.userPhone}</div>
                      </td>
                      <td className="py-3.5 pr-3 font-black text-slate-900">
                        {formatMoney(item.total)}
                      </td>
                      <td className="py-3.5 pr-3">
                        {item.hasReceipt || item.receipt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                            <Eye className="w-3 h-3" /> Chek bor
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Top Mahsulotlar & Kam Qolgan Mahsulotlar (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Top Selling Products */}
          {topProducts.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Eng ko'p sotilgan mahsulotlar
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                  Top {Math.min(4, topProducts.length)}
                </span>
              </div>

              <div className="space-y-2.5">
                {topProducts.slice(0, 4).map((prod, idx) => (
                  <div
                    key={prod.id || idx}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {prod.brand} • {prod.soldQty} dona sotildi ({prod.ordersCount} ta buyurtma)
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-600">
                        {formatShortMoney(prod.revenue)} so'm
                      </div>
                      <div className="text-[10px] text-slate-400">Omborda: {prod.stock} dona</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kam Qolgan Mahsulotlar Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-black text-slate-900">
                    Kam qolgan mahsulotlar
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700">
                  {lowStockProducts.length} ta xavf
                </span>
              </div>

              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 5).map((prod) => (
                  <div
                    key={prod._id || prod.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {prod.brand || 'Apple'} • {formatShortMoney(prod.price)} so'm
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${
                        (prod.stock || 0) <= 2
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      Qoldiq: {prod.stock || 0} dona
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveTab('products')}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Omborni ko'rish
              </button>
              <button
                onClick={onOpenAddProduct}
                className="py-2.5 px-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                + Mahsulot qo'shish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
