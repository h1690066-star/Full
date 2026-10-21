import React, { useState, useEffect } from 'react';
import {
  Globe,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Image as ImageIcon,
  Phone,
  Clock,
  MapPin, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  Megaphone,
  ArrowRight,
  Upload,
  Layout,
  ShoppingBag,
  Grid,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getSiteContent, updateSiteContent, getImageUrl } from '../api/api';

const VERCEL_SITE_URL = "https://xonbozoruz.vercel.app";

const DEFAULT_DATA = {
  heroSlides: [
    {
      id: 'slide-1',
      badge: 'Eksklyuziv premyera',
      title: 'Yangi iPhone 18 Pro - Xon Bozorda!',
      text: "Kutilgan titan korpus, eng so'nggi A20 chip va maxsus muddatli to'lov shartlari bilan.",
      cta: 'Hozir xarid qiling',
      href: '/catalog/phones',
      image: '/images/hero/hero-1.png',
      align: 'center'
    },
    {
      id: 'slide-2',
      badge: 'Yangi ranglar',
      title: 'iPhone 18 - uchta yangi rang',
      text: "Binafsha, mis va to'q qizil. Original kafolat va 0% muddatli to'lov.",
      cta: 'Batafsil',
      href: '/catalog/iphone',
      image: '/images/hero/hero-2.png',
      align: 'center'
    },
    {
      id: 'slide-3',
      badge: 'Maxsus taklif',
      title: 'Uy uchun zamonaviy maishiy texnikalar',
      text: 'Muzlatgichlar, konditsionerlar va zamonaviy oshxona anjomlari qulay narxlarda.',
      cta: "Katalogga o'tish",
      href: '/catalog/appliances',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&h=600&fit=crop',
      align: 'center'
    }
  ],
  quickCards: [
    { id: 'q-1', title: 'Yangi telefonlar', sub: 'Kafolatli va yangi', href: '/catalog/phones' },
    { id: 'q-2', title: 'B/U telefonlar', sub: "Tekshirilgan a'lo holat", href: '/catalog/used' },
    { id: 'q-3', title: 'Aksessuarlar', sub: 'Chexol, oyna, quvvatlagich', href: '/catalog/accessories' },
    { id: 'q-4', title: 'Maishiy texnika', sub: 'Uy qulayligi uchun', href: '/catalog/appliances' }
  ],
  contact: {
    phone: '+998 95 081 38 09',
    workHours: '09:00 - 21:00',
    address: 'Toshkent sh., Chilonzor tumani',
    telegram: 'https://t.me/xonbozor',
    instagram: 'https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr',
    youtube: 'https://www.youtube.com/@Xonbazar',
    email: 'info@xonbozor.uz'
  },
  perks: [
    { id: 'p-1', text: "0% muddatli to'lov" },
    { id: 'p-2', text: 'Rasmiy kafolat' },
    { id: 'p-3', text: "Toshkent bo'ylab 2 soatda" }
  ],
  sections: {
    productsTitle: 'Mahsulotlar',
    allLabel: "Barchasini ko'rish",
    categoriesTitle: 'Kategoriyalar',
    categoriesSub: "Kerakli bo'limni tez toping",
    footerAbout: "O'zbekistonda original smartfonlar, noutbuklar va eng so'nggi maishiy texnikaning ishonchli do'koni. Rasmiy kafolat va tezkor yetkazib berish."
  },
  promo: {
    tag: 'Eksklyuziv',
    title: 'iPhone 18 Pro',
    text: "Hoxlagan narsa Xon Bozorda — 0% muddatli to'lov",
    cta: 'Batafsil',
    href: '/catalog/iphone'
  },
  announcement: {
    enabled: true,
    text: "🔥 Xon Bozor do'koniga xush kelibsiz! Barcha mahsulotlarga kafolat beriladi."
  }
};

export default function SiteEditor() {
  const [content, setContent] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'live-site'
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'header' | 'hero' | 'quick' | 'products' | 'categories' | 'footer'
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Load site content from API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const resData = await getSiteContent();
        const data = resData?.content || resData;
        if (isMounted && data) {
          setContent({
            heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : DEFAULT_DATA.heroSlides,
            quickCards: data.quickCards && data.quickCards.length > 0 ? data.quickCards : DEFAULT_DATA.quickCards,
            contact: { ...DEFAULT_DATA.contact, ...(data.contact || {}) },
            perks: data.perks && data.perks.length > 0 ? data.perks : DEFAULT_DATA.perks,
            sections: { ...DEFAULT_DATA.sections, ...(data.sections || {}) },
            promo: { ...DEFAULT_DATA.promo, ...(data.promo || {}) },
            announcement: { ...DEFAULT_DATA.announcement, ...(data.announcement || {}) },
            lastPushedAt: data.lastPushedAt || null
          });
        }
      } catch (err) {
        console.warn('Site content load error, using default:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Save and Auto-Push to GitHub -> Vercel
  const handlePushToSite = async () => {
    try {
      setSaving(true);
      setStatusMessage({
        type: 'info',
        text: 'MongoDB ga saqlanmoqda va GitHub ga push qilinmoqda (Vercel auto-deploy)...'
      });
      
      const payload = {
        ...content,
        doGitPush: true
      };

      const res = await updateSiteContent(payload);
      
      setStatusMessage({
        type: 'success',
        text: '🚀 Muvaffaqiyatli saqlandi va GitHub reposiga push qilindi! Vercel (https://xonbozoruz.vercel.app/) avtomatik ravishda yangilanmoqda.'
      });

      if (res.content?.lastPushedAt) {
        setContent(prev => ({ ...prev, lastPushedAt: res.content.lastPushedAt }));
      }
      setTimeout(() => setStatusMessage(null), 8000);
    } catch (err) {
      console.error('Push error:', err);
      setStatusMessage({
        type: 'error',
        text: `Xatolik: ${err.message || 'Saytga chiqarishda muammo yuz berdi'}`
      });
    } finally {
      setSaving(false);
    }
  };

  // Banner slide operations
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: 'Yangi taklif',
      title: 'Yangi mahsulot sarlavhasi',
      text: 'Mahsulot haqida qisqacha ma\'lumot va afzalliklari.',
      cta: 'Xarid qilish',
      href: '/catalog',
      image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=1200&h=600&fit=crop',
      align: 'center'
    };
    setContent(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide]
    }));
    setPreviewSlideIdx(content.heroSlides.length);
  };

  const handleUpdateSlide = (index, field, value) => {
    setContent(prev => {
      const updated = [...prev.heroSlides];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, heroSlides: updated };
    });
  };

  const handleDeleteSlide = (index) => {
    if (content.heroSlides.length <= 1) {
      alert("Kamida bitta banner slayd qolishi kerak!");
      return;
    }
    setContent(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
    if (previewSlideIdx >= content.heroSlides.length - 1) {
      setPreviewSlideIdx(Math.max(0, content.heroSlides.length - 2));
    }
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateSlide(index, 'image', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Quick card operations
  const handleUpdateQuick = (index, field, value) => {
    setContent(prev => {
      const updated = [...prev.quickCards];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, quickCards: updated };
    });
  };

  // Perk operations
  const handleUpdatePerk = (index, value) => {
    setContent(prev => {
      const updated = [...prev.perks];
      updated[index] = { ...updated[index], text: value };
      return { ...prev, perks: updated };
    });
  };

  const currentPreviewSlide = content.heroSlides[previewSlideIdx] || content.heroSlides[0] || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Bosh Sahifani Tahrirlash (Home CMS)
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Vercel Live
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Sayt sarlavhalari, bannerlar, narxlar, telefon va matnlarni o'zgartiring va bir tugma bilan Vercel'ga chiqaring
              </p>
            </div>
          </div>
          {content.lastPushedAt && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              So'nggi chiqarilgan vaqt: {new Date(content.lastPushedAt).toLocaleString('uz-UZ')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'editor'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Tahrirlash</span>
            </button>
            <button
              onClick={() => setViewMode('live-site')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'live-site'
                  ? 'bg-white text-indigo-600 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Jonli Sayt (Vercel)</span>
            </button>
          </div>

          <a
            href={VERCEL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Yangi oynada ochish"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>xonbozoruz.vercel.app</span>
          </a>

          <button
            onClick={handlePushToSite}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{saving ? 'Saytga push qilinmoqda...' : 'Saytga chiqarish va Git push 🚀'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>

          {statusMessage.type === 'success' && (
            <a
              href={VERCEL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 shrink-0"
            >
              <span>Saytni ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* VIEW MODE 1: LIVE VERCEL SITE EMBEDDED IFRAME */}
      {viewMode === 'live-site' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700">Jonli Vercel sayti ko'rinishi:</span>
              <a href={VERCEL_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {VERCEL_SITE_URL}
              </a>
            </div>
            <button
              onClick={() => {
                const iframe = document.getElementById('vercel-preview-frame');
                if (iframe) iframe.src = VERCEL_SITE_URL + '?t=' + Date.now();
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Qayta yuklash</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-[780px] bg-slate-50">
            <iframe
              id="vercel-preview-frame"
              src={VERCEL_SITE_URL}
              title="Xon Bozor Vercel Live Preview"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: VISUAL HOME PAGE BUILDER & REALTIME PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: HOME PAGE SECTIONS EDITOR */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. HEADER & ANNOUNCEMENT BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Sayt Yuqori Qismi (Header, Aloqa & E'lonlar)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tepada ko'rinadigan telefon, ish vaqti va afzalliklar
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Aloqa Markazi Telefoni
                  </label>
                  <input
                    type="text"
                    value={content.contact.phone || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                    placeholder="+998 95 081 38 09"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Ish Vaqti
                  </label>
                  <input
                    type="text"
                    value={content.contact.workHours || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, workHours: e.target.value } }))}
                    placeholder="09:00 - 21:00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">
                    Header Yuqori Afzalliklari (3 ta imtiyoz)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {content.perks.map((perk, pIdx) => (
                      <input
                        key={perk.id || pIdx}
                        type="text"
                        value={perk.text || ''}
                        onChange={(e) => handleUpdatePerk(pIdx, e.target.value)}
                        placeholder={`Afzallik #${pIdx + 1}`}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. HERO CAROUSEL BANNERS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Bosh Sahifa Bannerlar Karuseli ({content.heroSlides.length} ta slayd)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Slaydlar sarlavhasi, nishoni, tugmasi va rasmlari
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddSlide}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Slayd qo'shish</span>
                </button>
              </div>

              {/* Slides list */}
              <div className="space-y-4">
                {content.heroSlides.map((slide, index) => (
                  <div
                    key={slide.id || index}
                    className={`rounded-xl border p-4 space-y-3 transition ${
                      previewSlideIdx === index ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-100' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-800">
                          {slide.title || `Slayd #${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewSlideIdx(index)}
                          className={`px-2 py-0.5 text-[11px] rounded font-medium cursor-pointer ${
                            previewSlideIdx === index ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          Prevyu
                        </button>
                        {content.heroSlides.length > 1 && (
                          <button
                            onClick={() => handleDeleteSlide(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Nishon (Badge)</label>
                        <input
                          type="text"
                          value={slide.badge || ''}
                          onChange={(e) => handleUpdateSlide(index, 'badge', e.target.value)}
                          placeholder="Eksklyuziv premyera"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Tugma matni (CTA)</label>
                        <input
                          type="text"
                          value={slide.cta || ''}
                          onChange={(e) => handleUpdateSlide(index, 'cta', e.target.value)}
                          placeholder="Hozir xarid qiling"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Asosiy Katta Sarlavha</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={(e) => handleUpdateSlide(index, 'title', e.target.value)}
                          placeholder="Yangi iPhone 18 Pro - Xon Bozorda!"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Kichik Tavsif Matni</label>
                        <textarea
                          rows={2}
                          value={slide.text || ''}
                          onChange={(e) => handleUpdateSlide(index, 'text', e.target.value)}
                          placeholder="Kutilgan titan korpus, eng so'nggi A20 chip..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Tugma havolasi (Href)</label>
                        <input
                          type="text"
                          value={slide.href || ''}
                          onChange={(e) => handleUpdateSlide(index, 'href', e.target.value)}
                          placeholder="/catalog/phones"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Banner Rasmi (URL yoki fayl)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={slide.image?.startsWith('data:') ? 'Yuklangan rasm' : (slide.image || '')}
                            onChange={(e) => handleUpdateSlide(index, 'image', e.target.value)}
                            placeholder="/images/hero/hero-1.png"
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                          />
                          <label className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer flex items-center justify-center shrink-0" title="Rasm yuklash">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(index, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. QUICK FEATURE CARDS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tezkor Bo'limlar (Quick Cards - 4 ta blok)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Karusel ostidagi 4 ta asosiy toifa kartochkalari
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {content.quickCards.map((card, idx) => (
                  <div key={card.id || idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-600">Kartochka #{idx + 1}</span>
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => handleUpdateQuick(idx, 'title', e.target.value)}
                      placeholder="Sarlavha"
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                    />
                    <input
                      type="text"
                      value={card.sub || ''}
                      onChange={(e) => handleUpdateQuick(idx, 'sub', e.target.value)}
                      placeholder="Izoh"
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PRODUCTS & PROMO SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Mahsulotlar & Aksiya Sarlavhalari
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bosh sahifadagi mahsulotlar bo'limi va eksklyuziv aksiya bloki
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Mahsulotlar Bo'limi Sarlavhasi</label>
                  <input
                    type="text"
                    value={content.sections?.productsTitle || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      sections: { ...prev.sections, productsTitle: e.target.value }
                    }))}
                    placeholder="Mahsulotlar"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">"Barchasini ko'rish" Tugma Matni</label>
                  <input
                    type="text"
                    value={content.sections?.allLabel || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      sections: { ...prev.sections, allLabel: e.target.value }
                    }))}
                    placeholder="Barchasini ko'rish"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-2">Eksklyuziv Promo Blok:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={content.promo.tag || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, promo: { ...prev.promo, tag: e.target.value } }))}
                      placeholder="Nishon (Eksklyuziv)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                    <input
                      type="text"
                      value={content.promo.title || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, promo: { ...prev.promo, title: e.target.value } }))}
                      placeholder="Sarlavha (iPhone 18 Pro)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                    />
                    <input
                      type="text"
                      value={content.promo.text || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, promo: { ...prev.promo, text: e.target.value } }))}
                      placeholder="Tavsif (0% muddatli to'lov)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. CATEGORIES SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Kategoriyalar Bo'limi
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Toifalar bloki sarlavhasi va kichik izohi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Sarlavha</label>
                  <input
                    type="text"
                    value={content.sections?.categoriesTitle || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      sections: { ...prev.sections, categoriesTitle: e.target.value }
                    }))}
                    placeholder="Kategoriyalar"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Subtitr / Kichik Matn</label>
                  <input
                    type="text"
                    value={content.sections?.categoriesSub || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      sections: { ...prev.sections, categoriesSub: e.target.value }
                    }))}
                    placeholder="Kerakli bo'limni tez toping"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 6. FOOTER & STORE INFO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Sayt Tagligi (Footer & Ijtimoiy Tarmoqlar)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Do'kon manzili, tavsifi va Telegram/Instagram sahifalari
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Do'kon haqida qisqacha tavsif</label>
                  <textarea
                    rows={2}
                    value={content.sections?.footerAbout || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      sections: { ...prev.sections, footerAbout: e.target.value }
                    }))}
                    placeholder="O'zbekistonda original smartfonlar..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Manzil</label>
                  <input
                    type="text"
                    value={content.contact.address || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                    placeholder="Toshkent sh., Chilonzor tumani"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Telegram Havolasi</label>
                  <input
                    type="text"
                    value={content.contact.telegram || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, telegram: e.target.value } }))}
                    placeholder="https://t.me/xonbozor"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">Instagram Havolasi</label>
                  <input
                    type="text"
                    value={content.contact.instagram || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, instagram: e.target.value } }))}
                    placeholder="https://www.instagram.com/xon.bazzar..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px] font-medium">YouTube Havolasi</label>
                  <input
                    type="text"
                    value={content.contact.youtube || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, contact: { ...prev.contact, youtube: e.target.value } }))}
                    placeholder="https://www.youtube.com/@Xonbazar"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: REALTIME HOME PAGE SIMULATOR MOCKUP */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Jonli Maket (Real-time Mockup)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  O'zgarishlar darhol ko'rinadi
                </span>
              </div>

              {/* Mockup Frame */}
              <div className="bg-[#0b0f19] rounded-2xl p-4 shadow-xl border border-slate-800 text-white overflow-hidden space-y-4 max-h-[85vh] overflow-y-auto">
                {/* 1. Header Bar Preview */}
                <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-[10px]">
                      XB
                    </div>
                    <span className="font-extrabold text-sm tracking-tight text-white">
                      Xon <span className="text-indigo-400">Bozor</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-semibold">{content.contact.phone || '+998 95 081 38 09'}</span>
                  </div>
                </div>

                {/* Perks Bar Preview */}
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  {content.perks.map((p, idx) => (
                    <span key={idx} className="truncate">
                      ✓ {p.text}
                    </span>
                  ))}
                </div>

                {/* 2. Hero Carousel Banner Preview */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 h-44 border border-slate-800 shadow-inner group">
                  <img
                    src={getImageUrl(currentPreviewSlide.image) || '/images/hero/hero-1.png'}
                    alt="Banner preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=800&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent p-4 flex flex-col justify-center gap-1.5">
                    {currentPreviewSlide.badge && (
                      <span className="w-fit text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        {currentPreviewSlide.badge}
                      </span>
                    )}
                    <h4 className="text-sm font-extrabold leading-tight text-white line-clamp-2">
                      {currentPreviewSlide.title || 'Sarlavha'}
                    </h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2 max-w-[85%]">
                      {currentPreviewSlide.text || 'Tavsif'}
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 rounded-lg text-white font-semibold text-[10px] shadow-sm">
                        <span>{currentPreviewSlide.cta || 'Batafsil'}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {content.heroSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setPreviewSlideIdx(dotIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          previewSlideIdx === dotIdx ? 'w-4 bg-indigo-500' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Quick Cards Preview */}
                <div className="grid grid-cols-2 gap-2">
                  {content.quickCards.slice(0, 4).map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-center"
                    >
                      <span className="text-[11px] font-bold text-slate-200 truncate">
                        {q.title || 'Bo\'lim'}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate">
                        {q.sub || 'Izoh'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 4. Products Section Header Preview */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold text-white">
                      {content.sections?.productsTitle || 'Mahsulotlar'}
                    </span>
                    <span className="text-indigo-400 text-[11px] font-medium">
                      {content.sections?.allLabel || 'Barchasini ko\'rish'} →
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center">
                        <div className="w-full h-12 bg-slate-800 rounded mb-1 animate-pulse" />
                        <div className="h-2 w-3/4 bg-slate-800 rounded mx-auto mb-1" />
                        <div className="h-2 w-1/2 bg-indigo-500/40 rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Categories Section Preview */}
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="font-extrabold text-white text-xs block">
                    {content.sections?.categoriesTitle || 'Kategoriyalar'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mb-2">
                    {content.sections?.categoriesSub || 'Kerakli bo\'limni tez toping'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">📱 Telefonlar</div>
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800">🔌 Maishiy texnika</div>
                  </div>
                </div>

                {/* 6. Footer Info Preview */}
                <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-400 space-y-1">
                  <p className="line-clamp-2 text-slate-400">
                    {content.sections?.footerAbout || 'Xon Bozor do\'koni'}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-slate-500">
                    <span>{content.contact.address || 'Toshkent sh.'}</span>
                    <span className="text-indigo-400">{content.contact.workHours || '09:00 - 21:00'}</span>
                  </div>
                </div>
              </div>

              {/* Target info reminder box */}
              <div className="mt-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-purple-800">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Avto Git Push va Vercel:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Tugma bosilganda o'zgarishlar GitHub reposiga avtomatik push qilinadi va Vercel <strong>{VERCEL_SITE_URL}</strong> saytiga yangilanishni darhol chiqaradi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
