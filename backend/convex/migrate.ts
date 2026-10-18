import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const importProducts = mutation({
  args: {
    products: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const p of args.products) {
      // Check if product with same name already exists
      const existing = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("name"), p.name))
        .first();

      if (!existing) {
        await ctx.db.insert("products", {
          name: p.name || "Mahsulot",
          description: p.description || "",
          longDescription: p.longDescription || "",
          brand: p.brand || "",
          category: p.category || "Smartfonlar",
          used: Boolean(p.used),
          grade: p.grade || "excellent",
          battery: p.battery || 95,
          price: Number(p.price) || 0,
          oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
          discount: p.discount ? Number(p.discount) : 0,
          stock: p.stock !== undefined ? Number(p.stock) : 10,
          isActive: p.isActive !== false,
          rating: Number(p.rating) || 5,
          reviewsCount: Number(p.reviewsCount) || 0,
          images: Array.isArray(p.images) ? p.images : [],
          colors: Array.isArray(p.colors) ? p.colors : [],
          storage: Array.isArray(p.storage) ? p.storage : [],
          specs: Array.isArray(p.specs) ? p.specs : [],
          quickSpecs: Array.isArray(p.quickSpecs) ? p.quickSpecs : [],
          specGroups: Array.isArray(p.specGroups) ? p.specGroups : [],
          delivery: p.delivery || {},
          ratingBreakdown: p.ratingBreakdown || {},
          originalId: p.originalId ? String(p.originalId) : undefined,
          createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
          updatedAt: Date.now(),
        });
      } else if (p.originalId && !existing.originalId) {
        await ctx.db.patch(existing._id, { originalId: String(p.originalId) });
      }
    }
    return { imported: count };
  },
});

export const importOrders = mutation({
  args: {
    orders: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const o of args.orders) {
      const existing = await ctx.db
        .query("orders")
        .withIndex("by_orderNumber", (q) => q.eq("orderNumber", o.orderNumber))
        .first();

      if (!existing && o.orderNumber) {
        await ctx.db.insert("orders", {
          orderNumber: o.orderNumber,
          customer: o.customer || {},
          items: Array.isArray(o.items) ? o.items : [],
          address: o.address || {},
          shipping: o.shipping || {},
          promoCode: o.promoCode || "",
          subtotal: Number(o.subtotal) || 0,
          discount: Number(o.discount) || 0,
          tax: Number(o.tax) || 0,
          handling: Number(o.handling) || 0,
          total: Number(o.total) || 0,
          paymentMethod: o.paymentMethod || "card",
          receipt: o.receipt || "",
          status: o.status || "new",
          telegramSent: Boolean(o.telegramSent),
          createdAt: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
        });
        count++;
      }
    }
    return { imported: count };
  },
});

export const importSiteContent = mutation({
  args: {
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteContent").first();
    const clean = { ...args.content };
    delete clean._id;
    delete clean.__v;
    delete clean.createdAt;
    delete clean.updatedAt;

    if (existing) {
      await ctx.db.patch(existing._id, clean);
      return { updated: true };
    } else {
      await ctx.db.insert("siteContent", clean);
      return { inserted: true };
    }
  },
});
