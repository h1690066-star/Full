import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
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
    rating: v.optional(v.number()),
    reviewsCount: v.optional(v.number()),

    images: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    storage: v.optional(v.array(v.string())),
    specs: v.optional(v.any()),
    quickSpecs: v.optional(v.any()),
    specGroups: v.optional(v.any()),
    delivery: v.optional(v.any()),
    ratingBreakdown: v.optional(v.any()),
    originalId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"])
    .index("by_originalId", ["originalId"]),

  orders: defineTable({
    orderNumber: v.string(),
    user: v.optional(v.string()),
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
    status: v.string(), // "new" | "confirmed" | "delivered" | "cancelled"
    telegramSent: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"]),

  users: defineTable({
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    password: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    originalId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_phone", ["phone"])
    .index("by_email", ["email"]),

  admins: defineTable({
    username: v.string(),
    password: v.string(),
  }).index("by_username", ["username"]),

  siteContent: defineTable({
    heroSlides: v.optional(v.array(v.any())),
    quickCards: v.optional(v.array(v.any())),
    contact: v.optional(v.any()),
    perks: v.optional(v.array(v.any())),
    sections: v.optional(v.any()),
    promo: v.optional(v.any()),
    announcement: v.optional(v.any()),
    doGitPush: v.optional(v.any()),
    lastPushedAt: v.optional(v.number()),
    updatedBy: v.optional(v.string()),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  images: defineTable({
    filename: v.string(),
    storageId: v.optional(v.string()),
    data: v.optional(v.string()),
    mime: v.optional(v.string()),
  }).index("by_filename", ["filename"]),
});
