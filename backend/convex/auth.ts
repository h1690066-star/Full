import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin exists, if not initialize default
    let admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin && args.username === "admin") {
      // Auto seed default admin
      const id = await ctx.db.insert("admins", {
        username: "admin",
        password: "adminxon77",
      });
      admin = await ctx.db.get(id);
    }

    if (!admin || admin.password !== args.password) {
      throw new Error("Login yoki parol noto'g'ri");
    }

    // Return a session token
    const token = `convex_admin_${admin._id}_${Date.now()}`;
    return {
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    };
  },
});

export const getPaymentInfo = query({
  args: {},
  handler: async (ctx) => {
    const cardSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "PAYMENT_CARD"))
      .first();
    const holderSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "PAYMENT_HOLDER"))
      .first();
    const rateSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "USD_RATE"))
      .first();

    return {
      card: cardSetting?.value || "9860350143560489",
      holder: holderSetting?.value || "Jahongir Abdusalomov",
      usdRate: rateSetting?.value || 12700,
    };
  },
});
