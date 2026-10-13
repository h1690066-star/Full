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

  // Faqat URL yo'q bo'lsa base64 fallback ishlatiladi
  const embeddedImages = (item.imagesData || [])
    .filter((d) => d && d.data)
    .map((d) => `data:${d.mime || "image/jpeg"};base64,${d.data}`);

  const images = rawImages.length > 0 ? rawImages : embeddedImages;
  const mainImage =
    images[0] ||
    (typeof item.image === "string" && item.image.startsWith("/uploads/") ? `${apiBase}${item.image}` : item.image) ||
    null;

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

// 1️⃣ Barcha Kategoriyalar Ro'yxatini Olish: Next.js revalidate kesh bilan
export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/products/categories`, {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    try {
      const res = await api.get("/api/products/categories");
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  }
}

// GET /api/products: Next.js ISR kesh bilan
export async function fetchProducts(params = {}) {
  try {
    const q = new URLSearchParams(params).toString();
    const url = `${API_BASE}/api/products${q ? `?${q}` : ""}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const items = data?.items || (Array.isArray(data) ? data : []);
      return items.map(mapApiProduct).filter(Boolean);
    }
    throw new Error(`Fetch status: ${res.status}`);
  } catch (err) {
    // Axios fallback
    try {
      const res = await api.get("/api/products", { params: { limit: 100, ...params } });
      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      return items.map(mapApiProduct).filter(Boolean);
    } catch {
      return [];
    }
  }
}

// 2️⃣ Kategoriya bo'yicha olish: limit 100, tezkor kesh bilan
export async function fetchProductsByCategory(category, fallback = [], limit = 100) {
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
            signal: AbortSignal.timeout(5000),
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
    return mapped.length > 0 ? mapped : fallback;
  } catch (err) {
    return fallback;
  }
}
