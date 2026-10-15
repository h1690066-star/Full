"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, memo } from "react";
import {
  MdChevronRight,
  MdChevronLeft,
  MdFilterList,
  MdCheck,
  MdClose,
  MdExpandMore,
  MdKitchen,
  MdSearchOff,
  MdTune,
  MdVerified,
  MdStar,
} from "react-icons/md";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

const APPLIANCE_TYPES = [
  { name: "Muzlatgichlar", match: "Muzlatgich" },
  { name: "Kir yuvish mashinalari", match: "Kir yuvish" },
  { name: "Konditsionerlar", match: "Konditsioner" },
  { name: "Mikroto'lqinli pechlar", match: "Mikrotolqinli" },
  { name: "Changyutgichlar", match: "Changyutgich" },
];

const MODELS_LIST = ["iPhone 18 Pro", "iPhone 17", "iPhone 16", "Galaxy S25", "Galaxy A55", "Xiaomi 15"];
const STORAGE_LIST = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const RAM_LIST = ["4GB", "6GB", "8GB", "12GB"];
const COLOR_LIST = [
  { name: "Black", hex: "#000000" },
  { name: "Beige", hex: "#d4c5b9" },
  { name: "White", hex: "#ffffff" },
  { name: "Purple", hex: "#6b21a8" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#059669" },
];

/* ---------- Presentational class helpers ---------- */
const SECTION = "border-t border-slate-100 dark:border-white/[0.06] pt-5 space-y-3";
const SECTION_TITLE =
  "text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400";
const ROW =
  "group flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 -mx-2.5 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition select-none";
const checkBox = (checked) =>
  `flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
    checked
      ? "border-transparent bg-brand-gradient text-white shadow-glow scale-105"
      : "border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.03] group-hover:border-brand/50"
  }`;
const pill = (active) =>
  `rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
    active
      ? "bg-brand-gradient text-white shadow-glow"
      : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:border-brand/40 hover:text-brand dark:hover:text-white"
  }`;
const radio = (active) =>
  `flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
    active ? "border-brand bg-brand shadow-glow" : "border-slate-300 dark:border-white/20 group-hover:border-brand/50"
  }`;
const PRICE_INPUT =
  "input h-11 w-full px-3 text-center text-[13px] font-semibold font-display tabular-nums";
const PAGE_BTN =
  "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-night-100 text-slate-700 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:text-brand dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition";

const SidebarFilters = memo(function SidebarFilters({
  categorySlug,
  selectedApplianceType,
  setSelectedApplianceType,
  minPriceInput,
  maxPriceInput,
  handleMinPriceChange,
  handleMaxPriceChange,
  handleSliderChange,
  onlyOriginal,
  setOnlyOriginal,
  brandsList,
  selectedBrands,
  toggleBrand,
  selectedModels,
  toggleModel,
  selectedStorage,
  setSelectedStorage,
  selectedRam,
  setSelectedRam,
  condition,
  setCondition,
  selectedColor,
  setSelectedColor,
  highRating,
  setHighRating,
  resetFilters,
  onApplyMobile,
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`flex items-center justify-between ${onApplyMobile ? "hidden" : ""}`}>
        <h2 className="flex items-center gap-2.5 font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand dark:text-brand-light">
            <MdFilterList className="text-lg" />
          </span>
          <span>Filtrlar</span>
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full px-3 py-1 text-xs font-semibold text-brand dark:text-brand-light hover:bg-brand/5 dark:hover:bg-white/[0.05] transition"
        >
          Tozalash
        </button>
      </div>

      {/* Narx oralig'i */}
      <div className={`space-y-3 ${onApplyMobile ? "" : "border-t border-slate-100 dark:border-white/[0.06] pt-5"}`}>
        <h3 className={SECTION_TITLE}>Narx oralig'i (so'm)</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Dan
            </label>
            <input
              type="text"
              value={minPriceInput}
              onChange={handleMinPriceChange}
              placeholder="100 000"
              className="input h-10 w-full px-2.5 text-left text-xs font-semibold font-display tabular-nums focus:border-brand"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gacha
            </label>
            <input
              type="text"
              value={maxPriceInput}
              onChange={handleMaxPriceChange}
              placeholder="20 000 000"
              className="input h-10 w-full px-2.5 text-left text-xs font-semibold font-display tabular-nums focus:border-brand"
            />
          </div>
        </div>
        <div className="px-0.5 pt-1">
          <input
            type="range"
            min={0}
            max={20000000}
            step={500000}
            value={
              parseInt(String(maxPriceInput).replace(/\D/g, ""), 10) >= 100000
                ? parseInt(String(maxPriceInput).replace(/\D/g, ""), 10)
                : 20000000
            }
            onChange={handleSliderChange}
            className="h-1.5 w-full cursor-pointer accent-brand"
          />
          <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
            <span>0</span>
            <span>20 mln</span>
          </div>
        </div>
      </div>

      {/* Faqat Original Toggle */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] pt-5">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/[0.03] px-3.5 py-3">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
            <MdVerified className="text-lg text-emerald-500" />
            Faqat original
          </span>
          <button
            type="button"
            onClick={() => setOnlyOriginal(!onlyOriginal)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
              onlyOriginal ? "bg-brand-gradient shadow-glow" : "bg-slate-300 dark:bg-white/15"
            }`}
          >
            <span
              className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-xs transition-transform duration-300 ${
                onlyOriginal ? "translate-x-[22px]" : "translate-x-[3px]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Brend */}
      {brandsList.length > 0 && (
        <div className={SECTION}>
          <h3 className={SECTION_TITLE}>Brend</h3>
          <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1 custom-scrollbar">
            {brandsList.map((b) => {
              const checked = selectedBrands.includes(b.name);
              return (
                <div key={b.name} onClick={() => toggleBrand(b.name)} className={ROW}>
                  <div className="flex items-center gap-2.5">
                    <div className={checkBox(checked)}>
                      {checked && <MdCheck className="text-xs" />}
                    </div>
                    <span className={checked ? "font-semibold text-slate-900 dark:text-white" : ""}>{b.name}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                    {b.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Texnika turi (Faqat Maishiy texnika bo'limi uchun) */}
      {categorySlug === "appliances" ? (
        <div className={SECTION}>
          <div className="flex items-center justify-between">
            <h3 className={`${SECTION_TITLE} flex items-center gap-1.5`}>
              <MdKitchen className="text-sm text-brand" />
              <span>Texnika turi</span>
            </h3>
            {selectedApplianceType && (
              <button
                type="button"
                onClick={() => setSelectedApplianceType("")}
                className="text-[11px] font-semibold text-brand dark:text-brand-light hover:underline"
              >
                Hammasi
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {APPLIANCE_TYPES.map((a) => {
              const checked = selectedApplianceType?.toLowerCase() === a.match.toLowerCase();
              return (
                <div
                  key={a.match}
                  onClick={() => setSelectedApplianceType(checked ? "" : a.match)}
                  className={ROW}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={checkBox(checked)}>
                      {checked && <MdCheck className="text-xs" />}
                    </div>
                    <span className={checked ? "font-semibold text-slate-900 dark:text-white" : ""}>{a.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Telefon modeli */}
          <div className={SECTION}>
            <h3 className={SECTION_TITLE}>Telefon modeli</h3>
            <div className="space-y-0.5">
              {MODELS_LIST.map((m) => {
                const checked = selectedModels.includes(m);
                return (
                  <div key={m} onClick={() => toggleModel(m)} className={`${ROW} !justify-start gap-2.5`}>
                    <div className={checkBox(checked)}>
                      {checked && <MdCheck className="text-xs" />}
                    </div>
                    <span className={checked ? "font-semibold text-slate-900 dark:text-white" : ""}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Xotira */}
          <div className={SECTION}>
            <h3 className={SECTION_TITLE}>Xotira</h3>
            <div className="flex flex-wrap gap-2">
              {STORAGE_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStorage(selectedStorage === s ? "" : s)}
                  className={pill(selectedStorage === s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* RAM */}
          <div className={SECTION}>
            <h3 className={SECTION_TITLE}>Operativ xotira (RAM)</h3>
            <div className="flex flex-wrap gap-2">
              {RAM_LIST.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRam(selectedRam === r ? "" : r)}
                  className={pill(selectedRam === r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Holati */}
      <div className={SECTION}>
        <h3 className={SECTION_TITLE}>Holati</h3>
        <div className="space-y-0.5">
          <div
            onClick={() => setCondition(condition === "new" ? "" : "new")}
            className={`${ROW} !justify-start gap-2.5`}
          >
            <div className={radio(condition === "new")}>
              {condition === "new" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            <span className={condition === "new" ? "font-semibold text-slate-900 dark:text-white" : ""}>
              Yangi (Muhrlangan)
            </span>
          </div>
          <div
            onClick={() => setCondition(condition === "used" ? "" : "used")}
            className={`${ROW} !justify-start gap-2.5`}
          >
            <div className={radio(condition === "used")}>
              {condition === "used" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            <span className={condition === "used" ? "font-semibold text-slate-900 dark:text-white" : ""}>
              B/U (Ishlatilgan / A1o holat)
            </span>
          </div>
        </div>
      </div>

      {/* Rang */}
      <div className={SECTION}>
        <h3 className={SECTION_TITLE}>Rang</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          {COLOR_LIST.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              onClick={() => setSelectedColor(selectedColor === c.name ? "" : c.name)}
              style={{ backgroundColor: c.hex }}
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-black/10 dark:border-white/15 shadow-2xs transition-all duration-200 hover:scale-110 ${
                selectedColor === c.name
                  ? "ring-2 ring-brand ring-offset-2 ring-offset-white dark:ring-offset-night-100 scale-110"
                  : ""
              }`}
            >
              {selectedColor === c.name && (
                <MdCheck
                  className={`text-sm ${c.hex === "#ffffff" ? "text-slate-900" : "text-white"}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reyting */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] pt-5">
        <div onClick={() => setHighRating(!highRating)} className={`${ROW} !justify-start gap-2.5`}>
          <div className={checkBox(highRating)}>
            {highRating && <MdCheck className="text-xs" />}
          </div>
          <span className="flex items-center gap-1.5">
            <span className="flex text-amber-400">
              {[0, 1, 2, 3, 4].map((i) => (
                <MdStar key={i} className="text-[15px]" />
              ))}
            </span>
            <span className={highRating ? "font-semibold text-slate-900 dark:text-white" : ""}>4+ yulduz</span>
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      {onApplyMobile && (
        <div className="sticky bottom-0 -mx-5 grid grid-cols-[1fr_2fr] gap-2.5 border-t border-slate-100 dark:border-white/[0.06] bg-white/90 dark:bg-night-100/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl lg:hidden">
          <button type="button" onClick={resetFilters} className="btn btn-secondary h-12 w-full">
            Tozalash
          </button>
          <button type="button" onClick={onApplyMobile} className="btn btn-primary h-12 w-full">
            Qo'llash
          </button>
        </div>
      )}
    </div>
  );
});

export default function CatalogClient({
  products: initialProducts = [],
  categoryName = "Mahsulotlar",
  categorySlug = "",
  t,
}) {
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  const searchParams = useSearchParams();
  const urlType = searchParams?.get("type") || searchParams?.get("search") || searchParams?.get("q") || "";

  // Filter States
  const [selectedApplianceType, setSelectedApplianceType] = useState(urlType);

  useEffect(() => {
    if (urlType) {
      setSelectedApplianceType(urlType);
    }
  }, [urlType]);

  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [onlyOriginal, setOnlyOriginal] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [condition, setCondition] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [highRating, setHighRating] = useState(false);
  const [sortBy, setSortBy] = useState("Mashhur");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Formatting helpers
  const formatThousands = (val) => {
    const digits = String(val || "").replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("ru-RU").replace(/,/g, " ");
  };

  const parseNum = (val) => {
    if (!val) return 0;
    const num = parseInt(String(val).replace(/\D/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  const handleMinPriceChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMinPriceInput(raw ? formatThousands(raw) : "");
  }, []);

  const handleMaxPriceChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMaxPriceInput(raw ? formatThousands(raw) : "");
  }, []);

  const handleSliderChange = useCallback((e) => {
    setMaxPriceInput(formatThousands(e.target.value));
  }, []);

  // Dynamic Brands list from products
  const brandsList = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.brand) {
        map[p.brand] = (map[p.brand] || 0) + 1;
      }
    });
    return Object.keys(map).map((name) => ({ name, count: map[name] }));
  }, [products]);

  const toggleBrand = useCallback((brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const toggleModel = useCallback((model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setOnlyOriginal(false);
    setSelectedBrands([]);
    setSelectedModels([]);
    setSelectedStorage("");
    setSelectedRam("");
    setCondition("");
    setSelectedColor("");
    setHighRating(false);
    setSelectedApplianceType("");
  }, []);

  // Safe filter logic
  const filteredProducts = useMemo(() => {
    const minP = parseNum(minPriceInput);
    const maxP = parseNum(maxPriceInput);

    const effectiveMaxP = maxP >= 100000 && maxP >= minP ? maxP : 0;
    const effectiveMinP = minP;

    let items = products.filter((p) => {
      const pPrice = Number(p.price) || 0;
      if (effectiveMinP > 0 && pPrice < effectiveMinP) return false;
      if (effectiveMaxP > 0 && pPrice > effectiveMaxP) return false;

      if (selectedApplianceType) {
        const qLower = selectedApplianceType.toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        if (!pName.includes(qLower) && !pCat.includes(qLower)) return false;
      }

      if (onlyOriginal && p.used) return false;
      if (condition === "new" && p.used) return false;
      if (condition === "used" && !p.used) return false;
      if (selectedBrands.length > 0 && p.brand && !selectedBrands.includes(p.brand)) return false;
      if (selectedModels.length > 0 && !selectedModels.some((m) => (p.name || "").includes(m))) return false;
      if (selectedStorage && p.storage && p.storage !== selectedStorage) return false;
      if (selectedRam && p.ram && p.ram !== selectedRam) return false;
      if (highRating && (p.rating || 5) < 4.0) return false;

      return true;
    });

    // Sorting
    if (sortBy === "Arzonroq") {
      items = [...items].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "Qimmatroq") {
      items = [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "Yangi") {
      items = [...items].sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
    }

    return items;
  }, [
    products,
    selectedApplianceType,
    minPriceInput,
    maxPriceInput,
    onlyOriginal,
    condition,
    selectedBrands,
    selectedModels,
    selectedStorage,
    selectedRam,
    highRating,
    sortBy,
  ]);

  // Pagination logic (20 items per page)
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    selectedApplianceType,
    minPriceInput,
    maxPriceInput,
    onlyOriginal,
    condition,
    selectedBrands,
    selectedModels,
    selectedStorage,
    selectedRam,
    highRating,
    sortBy,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 pb-28 min-[601px]:pb-0">
      {/* Page Hero Header */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-night-100 px-5 py-7 sm:px-8 sm:py-10 shadow-soft animate-fade-up">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-60 dark:opacity-30" />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl dark:bg-brand/25" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20" />

        <div className="relative">
          {/* Breadcrumbs */}
          <nav className="mb-5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="rounded-md px-1 py-0.5 hover:text-brand dark:hover:text-white transition">
              Bosh sahifa
            </Link>
            <MdChevronRight className="text-sm text-slate-400" />
            <span className="px-1 font-semibold text-slate-800 dark:text-slate-200">{categoryName}</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="eyebrow">Katalog</span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                {categoryName}
              </h1>
              <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Original mahsulotlar, rasmiy kafolat va qulay muddatli to'lov.
              </p>
            </div>
            <div className="flex items-baseline gap-2 self-start rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] px-4 py-3 backdrop-blur sm:self-auto">
              <span className="font-display text-2xl font-extrabold tabular-nums text-gradient">
                {filteredProducts.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ta mahsulot</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Container */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left Sidebar Filter (Desktop) */}
        <aside
          className="surface hidden p-5 lg:sticky lg:top-24 lg:col-span-3 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto custom-scrollbar animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <SidebarFilters
            categorySlug={categorySlug}
            selectedApplianceType={selectedApplianceType}
            setSelectedApplianceType={setSelectedApplianceType}
            minPriceInput={minPriceInput}
            maxPriceInput={maxPriceInput}
            handleMinPriceChange={handleMinPriceChange}
            handleMaxPriceChange={handleMaxPriceChange}
            handleSliderChange={handleSliderChange}
            onlyOriginal={onlyOriginal}
            setOnlyOriginal={setOnlyOriginal}
            brandsList={brandsList}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            selectedModels={selectedModels}
            toggleModel={toggleModel}
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
            selectedRam={selectedRam}
            setSelectedRam={setSelectedRam}
            condition={condition}
            setCondition={setCondition}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            highRating={highRating}
            setHighRating={setHighRating}
            resetFilters={resetFilters}
          />
        </aside>

        {/* Mobile Filter Sheet */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              aria-hidden
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in"
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col overflow-hidden rounded-t-4xl border-t border-slate-200/70 dark:border-white/[0.08] bg-white dark:bg-night-100 shadow-lift animate-fade-up">
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-10 rounded-full bg-slate-200 dark:bg-white/15" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 pt-3">
                <span className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand dark:text-brand-light">
                    <MdTune className="text-lg" />
                  </span>
                  Filtrlar
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="icon-btn"
                  aria-label="Yopish"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto border-t border-slate-100 dark:border-white/[0.06] px-5 pt-5">
                <SidebarFilters
                  categorySlug={categorySlug}
                  selectedApplianceType={selectedApplianceType}
                  setSelectedApplianceType={setSelectedApplianceType}
                  minPriceInput={minPriceInput}
                  maxPriceInput={maxPriceInput}
                  handleMinPriceChange={handleMinPriceChange}
                  handleMaxPriceChange={handleMaxPriceChange}
                  handleSliderChange={handleSliderChange}
                  onlyOriginal={onlyOriginal}
                  setOnlyOriginal={setOnlyOriginal}
                  brandsList={brandsList}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  selectedModels={selectedModels}
                  toggleModel={toggleModel}
                  selectedStorage={selectedStorage}
                  setSelectedStorage={setSelectedStorage}
                  selectedRam={selectedRam}
                  setSelectedRam={setSelectedRam}
                  condition={condition}
                  setCondition={setCondition}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  highRating={highRating}
                  setHighRating={setHighRating}
                  resetFilters={resetFilters}
                  onApplyMobile={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Main Product Grid (9 columns) */}
        <div className="space-y-4 lg:col-span-9 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {/* Toolbar: filter trigger + sort */}
          <div className="glass flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 dark:border-white/[0.06] px-3 py-2.5 shadow-2xs sm:px-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="btn btn-secondary h-10 gap-2 px-4 lg:hidden"
              >
                <MdTune className="text-base text-brand dark:text-brand-light" />
                <span>Filtrlar</span>
              </button>
              <span className="hidden text-[13px] font-medium text-slate-500 dark:text-slate-400 sm:inline">
                <span className="font-display font-bold tabular-nums text-slate-900 dark:text-white">
                  {filteredProducts.length}
                </span>{" "}
                ta mahsulot topildi
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">Saralash:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input h-10 w-auto cursor-pointer appearance-none py-0 pl-3.5 pr-9 text-[13px] font-semibold"
                >
                  <option value="Mashhur">Mashhur</option>
                  <option value="Arzonroq">Arzonroq</option>
                  <option value="Qimmatroq">Qimmatroq</option>
                  <option value="Yangi">Yangi kelganlar</option>
                </select>
                <MdExpandMore className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
              </div>
            </div>
          </div>

          {selectedApplianceType && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-brand/15 bg-brand-gradient-soft px-4 py-2.5 animate-fade-in">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Tanlangan filtr:
              </span>
              <span className="chip inline-flex items-center gap-1.5 bg-brand-gradient text-white shadow-glow border-transparent">
                <span>{selectedApplianceType}</span>
                <button
                  type="button"
                  onClick={() => setSelectedApplianceType("")}
                  className="rounded-full p-0.5 hover:bg-white/20 transition"
                  title="Filtrni olib tashlash"
                >
                  <MdClose className="text-sm" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => setSelectedApplianceType("")}
                className="ml-auto text-xs font-semibold text-brand dark:text-brand-light hover:underline"
              >
                Hammasini ko'rsatish
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="surface relative overflow-hidden px-6 py-16 text-center sm:py-20">
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-gradient-soft ring-1 ring-brand/10 animate-float">
                <MdSearchOff className="text-4xl text-brand dark:text-brand-light" />
              </div>
              <p className="relative mt-6 font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Mahsulot mavjud emas
              </p>
              <p className="relative mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Ushbu bo'limda yoki filtr parametrlari bo'yicha mahsulotlar topilmadi
              </p>
              <button type="button" onClick={resetFilters} className="btn btn-primary relative mt-7 h-12 px-6">
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id || p._id} product={p} t={t} />
              ))}
            </div>
          )}

          {/* Dynamic Pagination (Shown when items > 20) */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-8">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                aria-label="Oldingi sahifa"
                title="Oldingi sahifa"
                className={PAGE_BTN}
              >
                <MdChevronLeft className="text-xl" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => changePage(pNum)}
                  className={`h-11 min-w-[2.75rem] rounded-2xl px-3 font-display text-sm font-bold tabular-nums transition ${
                    page === pNum
                      ? "bg-brand-gradient text-white shadow-glow"
                      : "border border-slate-200 dark:border-white/10 bg-white dark:bg-night-100 text-slate-700 dark:text-slate-200 shadow-2xs hover:border-brand/40 hover:text-brand dark:hover:text-white"
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => changePage(page + 1)}
                aria-label="Keyingi sahifa"
                title="Keyingi sahifa"
                className={PAGE_BTN}
              >
                <MdChevronRight className="text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
