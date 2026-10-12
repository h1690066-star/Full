import { api } from "./api";

export const formatPrice = (n) => String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Faqat APIdan kelgan mahsulotlarni formatlash uchun helper
export const mapApiProduct = (item) => {
  if (!item) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const images = (item.images || []).map((img) =>
    typeof img === "string" && img.startsWith("/uploads/") ? `${apiBase}${img}` : img
  );
  const mainImage =
    images[0] ||
    (typeof item.image === "string" && item.image.startsWith("/uploads/") ? `${apiBase}${item.image}` : item.image) ||
    null;

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
    used: item.used || false,
    grade: item.grade || "excellent",
    battery: item.battery || 95,
  };
};

export const newPhones = [];
export const usedPhones = [];
export const appliances = [];
export const accessories = [];

// 1️⃣ Barcha Kategoriyalar Ro'yxatini Olish API: GET /api/products/categories
export async function fetchCategories() {
  try {
    const res = await api.get("/api/products/categories");
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    return [];
  }
}

// GET /api/products
export async function fetchProducts(params = {}) {
  try {
    const res = await api.get("/api/products", { params: { limit: 1000, ...params } });
    const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
    return items.map(mapApiProduct).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// 2️⃣ Har bir Kategoriya bo'yicha API So'rovi: GET /api/products?category=...
export async function fetchProductsByCategory(category, fallback = [], limit = 1000) {
  try {
    const res = await api.get("/api/products", { params: { category, limit } });
    const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
    const mapped = items.map(mapApiProduct).filter(Boolean);
    if (mapped.length > 0) return mapped;

    // Kategoriya taxallusi (alias) bo'yicha qayta izlash (Used Phones <-> B/U Telefonlar, Home appliances <-> Elektronika)
    let aliasCategory = null;
    if (category === "Used Phones") aliasCategory = "B/U Telefonlar";
    else if (category === "B/U Telefonlar") aliasCategory = "Used Phones";
    else if (category === "Home appliances") aliasCategory = "Elektronika";
    else if (category === "Elektronika") aliasCategory = "Home appliances";

    if (aliasCategory) {
      const aliasRes = await api.get("/api/products", { params: { category: aliasCategory, limit } });
      const aliasItems = aliasRes.data?.items || (Array.isArray(aliasRes.data) ? aliasRes.data : []);
      const aliasMapped = aliasItems.map(mapApiProduct).filter(Boolean);
      if (aliasMapped.length > 0) return aliasMapped;
    }

    return [];
  } catch (err) {
    return [];
  }
}
