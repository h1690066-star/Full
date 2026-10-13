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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
          <MdFilterList className="text-xl text-brand" />
          <span>Filtrlar</span>
        </h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-bold text-brand hover:underline"
        >
          Tozalash
        </button>
      </div>

      {/* Narx oralig'i */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Narx oralig'i (so'm)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={minPriceInput}
            onChange={handleMinPriceChange}
            placeholder="100 000"
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 px-3 text-center text-xs font-bold outline-none focus:border-brand focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition"
          />
          <input
            type="text"
            value={maxPriceInput}
            onChange={handleMaxPriceChange}
            placeholder="20 000 000"
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 px-3 text-center text-xs font-bold outline-none focus:border-brand focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition"
          />
        </div>
        <div className="pt-2 pb-1">
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
            className="w-full accent-brand cursor-pointer"
          />
        </div>
      </div>

      {/* Faqat Original Toggle */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Faqat original</span>
        <button
          type="button"
          onClick={() => setOnlyOriginal(!onlyOriginal)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            onlyOriginal ? "bg-brand" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              onlyOriginal ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Brend */}
      {brandsList.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Brend</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {brandsList.map((b) => {
              const checked = selectedBrands.includes(b.name);
              return (
                <div
                  key={b.name}
                  onClick={() => toggleBrand(b.name)}
                  className="flex cursor-pointer items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                        checked ? "border-brand bg-brand text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {checked && <MdCheck className="text-xs font-bold" />}
                    </div>
                    <span>{b.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Texnika turi (Faqat Maishiy texnika bo'limi uchun) */}
      {categorySlug === "appliances" ? (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MdKitchen className="text-sm text-brand" />
              <span>Texnika turi</span>
            </h3>
            {selectedApplianceType && (
              <button
                type="button"
                onClick={() => setSelectedApplianceType("")}
                className="text-[10px] text-brand font-bold hover:underline"
              >
                Hammasi
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {APPLIANCE_TYPES.map((a) => {
              const checked = selectedApplianceType?.toLowerCase() === a.match.toLowerCase();
              return (
                <div
                  key={a.match}
                  onClick={() => setSelectedApplianceType(checked ? "" : a.match)}
                  className="flex cursor-pointer items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                        checked
                          ? "border-brand bg-brand text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {checked && <MdCheck className="text-xs font-bold" />}
                    </div>
                    <span>{a.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Telefon modeli */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Telefon modeli</h3>
            <div className="space-y-1.5">
              {MODELS_LIST.map((m) => {
                const checked = selectedModels.includes(m);
                return (
                  <div
                    key={m}
                    onClick={() => toggleModel(m)}
                    className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand select-none"
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                        checked ? "border-brand bg-brand text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {checked && <MdCheck className="text-xs font-bold" />}
                    </div>
                    <span>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Xotira */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Xotira</h3>
            <div className="flex flex-wrap gap-1.5">
              {STORAGE_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStorage(selectedStorage === s ? "" : s)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    selectedStorage === s
                      ? "bg-brand text-white shadow-xs"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* RAM */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Operativ xotira (RAM)</h3>
            <div className="flex flex-wrap gap-1.5">
              {RAM_LIST.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRam(selectedRam === r ? "" : r)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    selectedRam === r
                      ? "bg-brand text-white shadow-xs"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Holati */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Holati</h3>
        <div className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div
            onClick={() => setCondition(condition === "new" ? "" : "new")}
            className="flex items-center gap-2 cursor-pointer hover:text-brand"
          >
            <div
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                condition === "new" ? "border-brand bg-brand" : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {condition === "new" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            <span>Yangi (Muhrlangan)</span>
          </div>
          <div
            onClick={() => setCondition(condition === "used" ? "" : "used")}
            className="flex items-center gap-2 cursor-pointer hover:text-brand"
          >
            <div
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                condition === "used" ? "border-brand bg-brand" : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {condition === "used" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            <span>B/U (Ishlatilgan / A1o holat)</span>
          </div>
        </div>
      </div>

      {/* Rang */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Rang</h3>
        <div className="flex items-center gap-2">
          {COLOR_LIST.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(selectedColor === c.name ? "" : c.name)}
              style={{ backgroundColor: c.hex }}
              className={`h-6 w-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center transition ${
                selectedColor === c.name ? "ring-2 ring-brand ring-offset-1 scale-110" : ""
              }`}
            >
              {selectedColor === c.name && (
                <MdCheck
                  className={`text-xs ${c.hex === "#ffffff" ? "text-slate-900" : "text-white"}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reyting */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <div
          onClick={() => setHighRating(!highRating)}
          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          <div
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              highRating ? "border-brand bg-brand text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            }`}
          >
            {highRating && <MdCheck className="text-xs" />}
          </div>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">★★★★★</span> 4+ yulduz
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      {onApplyMobile && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 lg:hidden">
          <button
            type="button"
            onClick={onApplyMobile}
            className="h-11 w-full rounded-2xl bg-brand font-extrabold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition text-sm"
          >
            Qo'llash
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs"
          >
            Tozalash
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

  const [minPriceInput, setMinPriceInput] = useState("100 000");
  const [maxPriceInput, setMaxPriceInput] = useState("20 000 000");
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
    setMinPriceInput("100 000");
    setMaxPriceInput("20 000 000");
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
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand transition">
          Bosh sahifa
        </Link>
        <MdChevronRight className="text-slate-400 text-sm" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">{categoryName}</span>
      </nav>

      {/* Page Title & Sort Row */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {categoryName}
          </h1>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            ({filteredProducts.length} ta mahsulot)
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex lg:hidden items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs"
          >
            <MdFilterList className="text-base text-brand" />
            <span>Filtrlar</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Saralash:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] pl-3 pr-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-brand cursor-pointer shadow-xs"
              >
                <option value="Mashhur">Mashhur</option>
                <option value="Arzonroq">Arzonroq</option>
                <option value="Qimmatroq">Qimmatroq</option>
                <option value="Yangi">Yangi kelganlar</option>
              </select>
              <MdExpandMore className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Sidebar Filter (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-5 shadow-xs">
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

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#15161c] lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">Filtrlar</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
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
        )}

        {/* Right Main Product Grid (9 columns) */}
        <div className="lg:col-span-9 space-y-4">
          {selectedApplianceType && (
            <div className="flex items-center gap-2 flex-wrap bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-2xl px-4 py-2.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Tanlangan filtr:
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-brand text-white shadow-xs">
                <span>{selectedApplianceType}</span>
                <button
                  type="button"
                  onClick={() => setSelectedApplianceType("")}
                  className="hover:opacity-80 transition"
                  title="Filtrni olib tashlash"
                >
                  <MdClose className="text-sm" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => setSelectedApplianceType("")}
                className="text-xs font-bold text-brand hover:underline ml-auto"
              >
                Hammasini ko'rsatish
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1a1b22] p-12 text-center shadow-xs">
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">Mahsulot mavjud emas</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ushbu bo'limda yoki filtr parametrlari bo'yicha mahsulotlar topilmadi
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-dark transition"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-4">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id || p._id} product={p} t={t} />
              ))}
            </div>
          )}

          {/* Dynamic Pagination (Shown when items > 20) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                aria-label="Oldingi sahifa"
                title="Oldingi sahifa"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none font-bold transition"
              >
                <MdChevronLeft className="text-xl" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => changePage(pNum)}
                  className={`h-10 min-w-[2.5rem] px-3 rounded-2xl font-bold text-sm transition ${
                    page === pNum
                      ? "bg-brand text-white shadow-md shadow-brand/20"
                      : "bg-white dark:bg-[#1a1b22] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1b22] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none font-bold transition"
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
