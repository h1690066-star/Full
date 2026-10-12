import { api } from "./api";

export const formatPrice = (n) => String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Faqat APIdan kelgan mahsulotlarni formatlash uchun helper
export const mapApiProduct = (item) => {
  if (!item) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://full-nbal.onrender.com";
  const images = (item.images || []).map((img) =>
    typeof img === "string" && img.startsWith("/uploads/") ? `${apiBase}${img}` : img
  );
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
      categoriesToFetch.map((cat) =>
        api
          .get("/api/products", { params: { category: cat, limit } })
          .then((res) => res.data?.items || (Array.isArray(res.data) ? res.data : []))
          .catch(() => [])
      )
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
    return mapped;
  } catch (err) {
    return [];
  }
}
