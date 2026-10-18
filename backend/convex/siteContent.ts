import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SITE_CONTENT = {
  heroSlides: [
    {
      id: "1",
      badge: "Yangi keldi",
      title: "iPhone 16 Pro Max",
      text: "Titan korpus, eng kuchli A18 Pro protsessori va professional kamera.",
      cta: "Xarid qilish",
      href: "/catalog?category=Phones",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=600&fit=crop",
      align: "center",
    },
  ],
  quickCards: [
    { id: "1", title: "Apple", sub: "Barcha original modellar", href: "/catalog?brand=Apple" },
    { id: "2", title: "Samsung", sub: "Galaxy seriyasi", href: "/catalog?brand=Samsung" },
    { id: "3", title: "Xiaomi", sub: "Hamyonbop flagmanlar", href: "/catalog?brand=Xiaomi" },
    { id: "4", title: "B/U Telefonlar", sub: "Kafolatli ikkilamchi bozor", href: "/catalog?used=true" },
  ],
  contact: {
    phone: "+998 95 081 38 09",
    workHours: "09:00 - 21:00",
    address: "Toshkent sh., Chilonzor tumani",
    telegram: "https://t.me/xonbozor",
    instagram: "https://www.instagram.com/xon.bazzar?igsh=aHRhbXNpa3R6OTg4&utm_source=qr",
    youtube: "https://www.youtube.com/@Xonbazar",
    email: "info@xonbozor.uz",
  },
  perks: [
    { id: "1", text: "1 yil rasmiy kafolat" },
    { id: "2", text: "O'zbekiston bo'ylab tezkor yetkazib berish" },
    { id: "3", text: "100% original mahsulotlar" },
    { id: "4", text: "Qulay to'lov turlari" },
  ],
  sections: {
    productsTitle: "Mahsulotlar",
    allLabel: "Barchasini ko'rish",
    categoriesTitle: "Kategoriyalar",
    categoriesSub: "Kerakli bo'limni tez toping",
    footerAbout:
      "O'zbekistonda original smartfonlar, noutbuklar va eng so'nggi maishiy texnikaning ishonchli do'koni. Rasmiy kafolat va tezkor yetkazib berish.",
  },
  promo: {
    tag: "Eksklyuziv",
    title: "iPhone 16 Pro",
    text: "Xon Bozorda — qulay narxlarda",
    cta: "Batafsil",
    href: "/catalog?category=Phones",
  },
  announcement: {
    enabled: true,
    text: "🔥 Xon Bozor do'koniga xush kelibsiz! Barcha mahsulotlarga kafolat beriladi.",
  },
  updatedBy: "admin",
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const content = await ctx.db.query("siteContent").first();
    if (!content) {
      return DEFAULT_SITE_CONTENT;
    }
    return content;
  },
});

export const update = mutation({
  args: {
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteContent").first();
    const cleanContent = { ...args.content };
    delete cleanContent._id;
    delete cleanContent._creationTime;
    cleanContent.lastPushedAt = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, cleanContent);
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("siteContent", cleanContent);
      return await ctx.db.get(id);
    }
  },
});
