import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    used: v.optional(v.boolean()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    inStock: v.optional(v.boolean()),
    all: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();

    // Default: only active products unless all is true
    if (!args.all) {
      products = products.filter((p) => p.isActive !== false);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (args.category && args.category !== "Barchasi") {
      const catTrim = args.category.trim().toLowerCase();
      if (/^(used(\s*phones?)?|b\/u(\s*telefonlar)?|ishlatilgan)$/i.test(catTrim)) {
        products = products.filter((p) => p.used === true);
      } else if (/^(home\s*appliances?|maishiy\s*texnika)$/i.test(catTrim)) {
        products = products.filter((p) => /^(home\s*appliances?|maishiy\s*texnika)$/i.test(p.category));
      } else if (/^(computers?|kompyuter(\s*jihozlar(i)?)?|elektronika)$/i.test(catTrim)) {
        products = products.filter((p) => /^(elektronika|computers?)$/i.test(p.category));
      } else {
        products = products.filter((p) => p.category.toLowerCase() === catTrim);
      }
    }

    if (args.used !== undefined) {
      products = products.filter((p) => Boolean(p.used) === args.used);
    }

    if (args.minPrice !== undefined) {
      products = products.filter((p) => p.price >= args.minPrice!);
    }

    if (args.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= args.maxPrice!);
    }

    if (args.inStock) {
      products = products.filter((p) => (p.stock || 0) > 0);
    }

    // Sort newest first
    products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return products;
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      const product = await ctx.db.get(args.id as any);
      if (product) return product;
    } catch {}

    const byOriginal = await ctx.db
      .query("products")
      .withIndex("by_originalId", (q) => q.eq("originalId", args.id))
      .first();
    if (byOriginal) return byOriginal;

    const all = await ctx.db.query("products").collect();
    return all.find((p) => p.originalId === args.id || String(p._id) === args.id) || null;
  },
});

export const categories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").filter((q) => q.neq(q.field("isActive"), false)).collect();
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  },
});

export const getRelated = query({
  args: { category: v.string(), excludeId: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.neq(q.field("isActive"), false))
      .take(6);

    return products.filter((p) => String(p._id) !== args.excludeId && p.originalId !== args.excludeId).slice(0, 4);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    longDescription: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.string(),
    used: v.optional(v.boolean()),
    grade: v.optional(v.string()),
    battery: v.optional(v.number()),
    price: v.number(),
    oldPrice: v.optional(v.number()),
    discount: v.optional(v.number()),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    images: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    storage: v.optional(v.array(v.string())),
    specs: v.optional(v.any()),
    quickSpecs: v.optional(v.any()),
    specGroups: v.optional(v.any()),
    delivery: v.optional(v.any()),
    ratingBreakdown: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("products", {
      ...args,
      stock: args.stock ?? 0,
      isActive: args.isActive ?? true,
      rating: 5,
      reviewsCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    const cleanUpdates = { ...updates };
    delete cleanUpdates._id;
    delete cleanUpdates._creationTime;
    delete cleanUpdates.id;
    cleanUpdates.updatedAt = Date.now();

    await ctx.db.patch(id, cleanUpdates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
