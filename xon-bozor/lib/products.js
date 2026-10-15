import { api } from "./api";

export const formatPrice = (n) => String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Faqat APIdan kelgan mahsulotlarni formatlash uchun helper
export const mapApiProduct = (item) => {
  if (!item) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";

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
    Boolean(item.used) ||
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
    oldPrice: item.oldPrice || 0,
    price: item.price || 0,
    monthly: item.monthly || Math.round((item.price || 0) / 12),
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";

// Server-side in-memory cache for ultra-fast TTFB (0ms response)
const memoryCache = new Map();

// 1️⃣ Barcha Kategoriyalar Ro'yxatini Olish: Next.js revalidate kesh bilan
export async function fetchCategories() {
  const cacheKey = "categories";
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 120_000) {
    return cached.data;
  }
  try {
    const res = await fetch(`${API_BASE}/api/products/categories`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return cached?.data || [];
    const data = await res.json();
    const result = Array.isArray(data) ? data : [];
    memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
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

// GET /api/products: Server-side SWR kesh (0ms TTFB)
export async function fetchProducts(params = {}) {
  const cacheKey = `products_${JSON.stringify(params)}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // Fresh kesh (< 60s): darhol qaytarish (0ms)
  if (cached && now - cached.timestamp < 60_000) {
    return cached.data;
  }

  // Stale kesh (60s - 15 min): darhol qaytarib, orqa fonda yangilash
  if (cached && now - cached.timestamp < 900_000) {
    if (!cached.refreshing) {
      cached.refreshing = true;
      (async () => {
        try {
          const q = new URLSearchParams(params).toString();
          const url = `${API_BASE}/api/products${q ? `?${q}` : ""}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
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
    const q = new URLSearchParams(params).toString();
    const url = `${API_BASE}/api/products${q ? `?${q}` : ""}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const items = data?.items || (Array.isArray(data) ? data : []);
      const mapped = items.map(mapApiProduct).filter(Boolean);
      memoryCache.set(cacheKey, { data: mapped, timestamp: now, refreshing: false });
      return mapped;
    }
    throw new Error(`Fetch status: ${res.status}`);
  } catch (err) {
    try {
      const res = await api.get("/api/products", { params: { limit: 100, ...params } });
      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const mapped = items.map(mapApiProduct).filter(Boolean);
      memoryCache.set(cacheKey, { data: mapped, timestamp: now, refreshing: false });
      return mapped;
    } catch {
      return cached?.data || [];
    }
  }
}

// 2️⃣ Kategoriya bo'yicha olish: limit 100, tezkor SWR kesh bilan
export async function fetchProductsByCategory(category, fallback = [], limit = 100) {
  const cacheKey = `cat_${category}_${limit}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < 60_000) {
    return cached.data;
  }

  try {
    let categoriesToFetch = [category];
    const catLower = (category || "").toLowerCase();

    if (catLower.includes("used") || catLower.includes("b/u")) {
      categoriesToFetch = ["Used Phones", "B/U Telefonlar"];
    } else if (
      catLower.includes("appliance") ||
      catLower.includes("elektronika") ||
      catLower.includes("maishiy")
    ) {
      categoriesToFetch = ["Home appliances", "Elektronika", "Maishiy texnika"];
    } else if (catLower.includes("accessor") || catLower.includes("aksessuar")) {
      categoriesToFetch = ["Aksessuarlar", "Accessories"];
    } else if (catLower === "phones") {
      categoriesToFetch = ["Phones"];
    }

    const results = await Promise.all(
      categoriesToFetch.map(async (cat) => {
        try {
          const q = new URLSearchParams({ category: cat, limit: String(limit) }).toString();
          const res = await fetch(`${API_BASE}/api/products?${q}`, {
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const data = await res.json();
            return data?.items || (Array.isArray(data) ? data : []);
          }
          return [];
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
    memoryCache.set(cacheKey, { data: finalData, timestamp: now });
    return finalData;
  } catch (err) {
    return cached?.data || fallback;
  }
}

// Server ishga tushishi bilan keshni orqa fonda isitish (Pre-warming)
if (typeof window === "undefined") {
  fetchProducts({ limit: 60 }).catch(() => { });
}
