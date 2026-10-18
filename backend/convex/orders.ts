import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();

    if (args.status && args.status !== "all") {
      orders = orders.filter((o) => o.status === args.status);
    }

    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return orders;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    customer: v.optional(
      v.object({
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        telegram: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
    items: v.array(v.any()),
    address: v.optional(v.any()),
    shipping: v.optional(v.any()),
    promoCode: v.optional(v.string()),
    subtotal: v.optional(v.number()),
    discount: v.optional(v.number()),
    tax: v.optional(v.number()),
    handling: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.optional(v.string()),
    receipt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderNumber =
      "XB-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase();

    // 1. Kamaytirish: mahsulotlar ombori
    for (const item of args.items) {
      if (item.productId) {
        try {
          const product = await ctx.db.get(item.productId);
          if (product && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - (item.qty || 1));
            await ctx.db.patch(item.productId, { stock: newStock });
          }
        } catch {
          // ignore if invalid product ID
        }
      }
    }

    // 2. Foydalanuvchini bazaga qo'shish (agar yo'q bo'lsa)
    const phone = args.customer?.phone || args.address?.phone;
    if (phone) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();

      if (!existingUser) {
        await ctx.db.insert("users", {
          name: args.customer?.name || "Mijoz",
          phone: phone,
          createdAt: Date.now(),
        });
      }
    }

    const orderId = await ctx.db.insert("orders", {
      ...args,
      orderNumber,
      status: "new",
      telegramSent: false,
      createdAt: Date.now(),
    });

    const order = await ctx.db.get(orderId);
    return order;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return await ctx.db.get(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getReceiptUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
