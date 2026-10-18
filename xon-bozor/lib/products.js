import { api } from "./api";

export const formatPrice = (n) => {
  const num = Math.round(Number(n) || 0);
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Faqat APIdan kelgan mahsulotlarni formatlash uchun helper
export const mapApiProduct = (item) => {
  if (!item) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3211";

  // URL rasmlarni afzal ko'ramiz (HTML hajmini kichik va yuklanishni tez qilish uchun)
  const rawImages = (item.images || [])
    .map((img) => (typeof img === "string" && img.startsWith("/uploads/") ? `${apiBase}${img}` : img))
    .filter(Boolean);

  // Katta base64 rasmlar (80KB+) HTML hajmini 800KB ga oshirib, mobil LCP ni 15s ga cho'zadi.
  // Faqat 4KB dan kichik bo'lsa yoki URL bo'lmasa xavfsiz placeholder beramiz.
  const embeddedImages = (item.imagesData || [])
    .filter((d) => d && d.data && d.data.length < 5000)
    .map((d) => `data:${d.mime || "image/jpeg"};base64,${d.data}`);

  const defaultPlaceholder = "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=400&fit=crop";
  const images = rawImages.length > 0 ? rawImages : embeddedImages.length > 0 ? embeddedImages : [defaultPlaceholder];
  const mainImage =
    images[0] ||
    (typeof item.image === "string" && item.image.startsWith("/uploads/") ? `${apiBase}${item.image}` : item.image) ||
    defaultPlaceholder;

  const isUsed =
    item.used === true ||
    item.used === "true" ||
    item.category === "Used Phones" ||
    item.category === "B/U Telefonlar" ||
    (typeof item.name === "string" &&
      (item.name.toLowerCase().includes("(used") ||
        item.name.toLowerCase().includes("(b/u)")));

  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    name: item.name || "Mahsulot",
    rating: item.rating ?? 5.0,
    reviews: item.reviewsCount ?? item.reviews ?? 0,
    oldPrice: item.oldPrice ? Math.round(Number(item.oldPrice) || 0) : 0,
    price: Math.round(Number(item.price) || 0),
    monthly: item.monthly ? Math.round(Number(item.monthly) || 0) : Math.round((Number(item.price) || 0) / 12),
    images: images.length > 0 ? images : mainImage ? [mainImage] : [],
    image: mainImage,
    category: item.category,
    brand: item.brand,
    description: item.description || "",
    longDescription: item.longDescription || "",
    specs: item.specs || [],
    colors: item.colors || [],
    storage: item.storage || [],
    stock: item.stock ?? 0,
    discount: item.discount || 0,
    used: isUsed,
    grade: item.grade || "excellent",
    battery: item.battery || 95,
  };
};

export const newPhones = [];
export const usedPhones = [];
export const appliances = [];
export const accessories = [];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3211";

// Server-side in-memory cache
const memoryCache = new Map();

export function clearProductsCache() {
  memoryCache.clear();
}

// 1️⃣ Barcha Kategoriyalar Ro'yxatini Olish
export async function fetchCategories() {
  const cacheKey = "categories";
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 60_000) {
    return cached.data;
  }
  try {
    const res = await fetch(`${API_BASE}/api/products/categories`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const data = await res.json();
      const result = Array.isArray(data) ? data : [];
      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
    throw new Error("Categories fetch status: " + res.status);
  } catch (err) {
    try {
      const res = await api.get("/api/products/categories");
      const result = Array.isArray(res.data) ? res.data : [];
      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return cached?.data || [];
    }
  }
}

// GET /api/products: Server-side SWR kesh
export async function fetchProducts(params = {}) {
  const cacheKey = `products_${JSON.stringify(params)}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // Fresh kesh (< 20s): darhol qaytarish
  if (cached && cached.data?.length > 0 && now - cached.timestamp < 20_000) {
    return cached.data;
  }

  // Stale kesh (20s - 3 min): darhol qaytarib, orqa fonda yangilash
  if (cached && cached.data?.length > 0 && now - cached.timestamp < 180_000) {
    if (!cached.refreshing) {
      cached.refreshing = true;
      (async () => {
        try {
          const q = new URLSearchParams({ limit: "10000", ...params }).toString();
          const url = `${API_BASE}/api/products${q ? `?${q}` : ""}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(40000) });
          if (res.ok) {
            const data = await res.json();
            const items = data?.items || (Array.isArray(data) ? data : []);
            const mapped = items.map(mapApiProduct).filter(Boolean);
            if (mapped.length > 0) {
              memoryCache.set(cacheKey, { data: mapped, timestamp: Date.now(), refreshing: false });
            }
          }
        } catch (_) {
        } finally {
          if (memoryCache.has(cacheKey)) memoryCache.get(cacheKey).refreshing = false;
        }
      })();
    }
    return cached.data;
  }

  // Kesh yo'q bo'lsa yoki eskirgan bo'lsa
  try {
    const q = new URLSearchParams({ limit: "10000", ...params }).toString();
    const url = `${API_BASE}/api/products${q ? `?${q}` : ""}`;
    const res = await fetch(url, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(40000),
    });
    if (res.ok) {
      const data = await res.json();
      const items = data?.items || (Array.isArray(data) ? data : []);
      const mapped = items.map(mapApiProduct).filter(Boolean);
      if (mapped.length > 0) {
        memoryCache.set(cacheKey, { data: mapped, timestamp: now, refreshing: false });
        return mapped;
      }
    }
    // Agar Render 503 bo'lsa (bandwidth tugaganda), lokal 5000 portdan tortish
    try {
      const localRes = await fetch(`http://localhost:5000/api/products${q ? `?${q}` : ""}`, { signal: AbortSignal.timeout(5000) });
      if (localRes.ok) {
        const localData = await localRes.json();
        const items = localData?.items || (Array.isArray(localData) ? localData : []);
        const mapped = items.map(mapApiProduct).filter(Boolean);
        if (mapped.length > 0) {
          memoryCache.set(cacheKey, { data: mapped, timestamp: now, refreshing: false });
          return mapped;
        }
      }
    } catch (_) {}
    throw new Error(`Fetch status: ${res.status}`);
  } catch (err) {
    try {
      const res = await api.get("/api/products", { params: { limit: 10000, ...params } });
      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const mapped = items.map(mapApiProduct).filter(Boolean);
      if (mapped.length > 0) {
        memoryCache.set(cacheKey, { data: mapped, timestamp: now, refreshing: false });
        return mapped;
      }
    } catch {
      return cached?.data || [];
    }
    return cached?.data || [];
  }
}

// 2️⃣ Kategoriya bo'yicha olish (cheksiz limit)
export async function fetchProductsByCategory(category, fallback = [], limit = 10000) {
  const cacheKey = `cat_${category}_${limit}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && cached.data?.length > 0 && now - cached.timestamp < 20_000) {
    return cached.data;
  }

  try {
    let categoriesToFetch = [category];
    const catLower = (category || "").toLowerCase();

    if (catLower.includes("used") || catLower.includes("b/u")) {
      categoriesToFetch = ["Used Phones", "B/U Telefonlar"];
    } else if (catLower.includes("computer") || catLower.includes("kompyuter")) {
      categoriesToFetch = ["Elektronika", "Computers"];
    } else if (
      catLower.includes("appliance") ||
      catLower.includes("maishiy")
    ) {
      categoriesToFetch = ["Home appliances", "Maishiy texnika"];
    } else if (catLower.includes("accessor") || catLower.includes("aksessuar")) {
      categoriesToFetch = ["Aksessuarlar", "Accessories"];
    } else if (catLower === "phones") {
      categoriesToFetch = ["Phones"];
    }

    const results = await Promise.all(
      categoriesToFetch.map(async (cat) => {
        try {
          const q = new URLSearchParams({ category: cat, limit: String(limit || 10000) }).toString();
          const res = await fetch(`${API_BASE}/api/products?${q}`, {
            next: { revalidate: 30 },
            signal: AbortSignal.timeout(40000),
          });
          if (res.ok) {
            const data = await res.json();
            return data?.items || (Array.isArray(data) ? data : []);
          }
        } catch (_) {}
        try {
          const res = await api.get("/api/products", { params: { category: cat, limit: limit || 10000 } });
          return res.data?.items || (Array.isArray(res.data) ? res.data : []);
        } catch {
          return [];
        }
      })
    );

    const merged = [];
    const seen = new Set();
    for (const list of results) {
      for (const item of list) {
        const id = item._id || item.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          merged.push(item);
        }
      }
    }

    const mapped = merged.map(mapApiProduct).filter(Boolean);
    const finalData = mapped.length > 0 ? mapped : (cached?.data || fallback);
    if (finalData.length > 0) {
      memoryCache.set(cacheKey, { data: finalData, timestamp: now });
    }
    return finalData;
  } catch (err) {
    return cached?.data || fallback;
  }
}

// Server ishga tushishi bilan keshni orqa fonda isitish (Pre-warming)
if (typeof window === "undefined") {
  fetchProducts({ limit: 10000 }).catch(() => { });
}

export const isComputerEquipment = (p) => {
  if (!p) return false;
  const name = (p.name || "").toLowerCase();
  const brand = (p.brand || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  const txt = `${name} ${brand} ${desc} ${cat}`;

  return (
    txt.includes("asus") ||
    txt.includes("tuf") ||
    txt.includes("msi") ||
    txt.includes("rtx") ||
    txt.includes("gtx") ||
    txt.includes("geforce") ||
    txt.includes("nvidia") ||
    txt.includes("laptop") ||
    txt.includes("noutbuk") ||
    txt.includes("kompyuter") ||
    txt.includes("videokarta") ||
    txt.includes("graphics card") ||
    txt.includes("gpu") ||
    txt.includes("ram ddr") ||
    txt.includes("monitor") ||
    txt.includes("mag 275")
  );
};

export const isHouseholdAppliance = (p) => {
  if (!p) return false;
  if (isComputerEquipment(p)) return false;
  const name = (p.name || "").toLowerCase();
  const brand = (p.brand || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  const txt = `${name} ${brand} ${desc} ${cat}`;

  return (
    cat.includes("appliance") ||
    cat.includes("maishiy") ||
    txt.includes("muzlatgich") ||
    txt.includes("kir yuvish") ||
    txt.includes("konditsioner") ||
    txt.includes("plitasi") ||
    txt.includes("plita") ||
    txt.includes("gaz plitasi") ||
    txt.includes("duxovka") ||
    txt.includes("mikrotolqinli") ||
    txt.includes("mikroto'lqinli") ||
    txt.includes("changyutgich") ||
    txt.includes("artel") ||
    txt.includes("hofmann") ||
    txt.includes("midea") ||
    txt.includes("haier") ||
    txt.includes("tv") ||
    txt.includes("televizor")
  );
};
