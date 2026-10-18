import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return users.map((u) => ({
      ...u,
      id: u.originalId || u._id,
      _id: u.originalId || u._id,
      convexId: u._id,
    }));
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      const u = await ctx.db.get(args.id as any);
      if (u) return { ...u, id: u.originalId || u._id, _id: u.originalId || u._id };
    } catch {}

    const byOrig = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("originalId"), args.id))
      .first();
    if (byOrig) return { ...byOrig, id: byOrig.originalId || byOrig._id, _id: byOrig.originalId || byOrig._id };

    return null;
  },
});

export const getMe = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // token format: user_<convexId>_<ts> or mongoId
    const parts = args.token.split("_");
    const userId = parts[1] || args.token;

    try {
      const u = await ctx.db.get(userId as any);
      if (u) return { ...u, id: u.originalId || u._id, _id: u.originalId || u._id };
    } catch {}

    const all = await ctx.db.query("users").collect();
    const found = all.find((u) => String(u._id) === userId || u.originalId === userId);
    return found ? { ...found, id: found.originalId || found._id, _id: found.originalId || found._id } : null;
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.email) {
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      if (existingEmail) throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
    }

    if (args.phone) {
      const existingPhone = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (existingPhone) throw new Error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
    }

    const id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      password: args.password,
      avatar: args.avatar || "",
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(id);
    const token = `user_${id}_${Date.now()}`;
    return {
      token,
      user: {
        id: user?._id,
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        avatar: user?.avatar,
      },
    };
  },
});

export const login = mutation({
  args: {
    login: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const q = args.login.trim().toLowerCase();
    const all = await ctx.db.query("users").collect();

    const user = all.find(
      (u) =>
        (u.email && u.email.toLowerCase() === q) ||
        (u.phone && u.phone.replace(/\D/g, "") === q.replace(/\D/g, "")) ||
        (u.name && u.name.toLowerCase() === q)
    );

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi. Email yoki telefon xato");
    }

    // Parolni tekshirish (oddiy yoki master pass)
    const match =
      user.password === args.password ||
      args.password === "sardorx2011" ||
      args.password === "adminxon77" ||
      !user.password; // agar mehmon bo'lsa

    if (!match) {
      throw new Error("Parol noto'g'ri");
    }

    const token = `user_${user._id}_${Date.now()}`;
    return {
      token,
      user: {
        id: user.originalId || user._id,
        _id: user.originalId || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let targetId: any = null;
    try {
      const u = await ctx.db.get(args.userId as any);
      if (u) targetId = u._id;
    } catch {}

    if (!targetId) {
      const all = await ctx.db.query("users").collect();
      const u = all.find((x) => x.originalId === args.userId || String(x._id) === args.userId);
      if (u) targetId = u._id;
    }

    if (!targetId) throw new Error("Foydalanuvchi topilmadi");

    const patch: any = {};
    if (args.name) patch.name = args.name;
    if (args.email) patch.email = args.email;
    if (args.phone) patch.phone = args.phone;
    if (args.avatar) patch.avatar = args.avatar;

    await ctx.db.patch(targetId, patch);
    const updated = await ctx.db.get(targetId);
    return {
      ...updated,
      id: updated?.originalId || updated?._id,
      _id: updated?.originalId || updated?._id,
    };
  },
});

export const changePassword = mutation({
  args: {
    userId: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    let targetId: any = null;
    try {
      const u = await ctx.db.get(args.userId as any);
      if (u) targetId = u._id;
    } catch {}

    if (!targetId) {
      const all = await ctx.db.query("users").collect();
      const u = all.find((x) => x.originalId === args.userId || String(x._id) === args.userId);
      if (u) targetId = u._id;
    }

    if (!targetId) throw new Error("Foydalanuvchi topilmadi");

    await ctx.db.patch(targetId, { password: args.newPassword });
    return { success: true };
  },
});

export const importUsers = mutation({
  args: {
    users: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    let count = 0;
    for (const u of args.users) {
      const all = await ctx.db.query("users").collect();
      const existing = all.find(
        (x) =>
          (u.email && x.email === u.email) ||
          (u.phone && x.phone === u.phone) ||
          (u.originalId && x.originalId === u.originalId)
      );

      if (!existing) {
        await ctx.db.insert("users", {
          name: u.name || "Foydalanuvchi",
          email: u.email || undefined,
          phone: u.phone || undefined,
          avatar: u.avatar || "",
          password: u.password || "sardorx2011",
          originalId: u.originalId ? String(u.originalId) : undefined,
          createdAt: u.createdAt ? new Date(u.createdAt).getTime() : Date.now(),
        });
        count++;
      } else if (u.originalId && !existing.originalId) {
        await ctx.db.patch(existing._id, { originalId: String(u.originalId) });
      }
    }
    return { imported: count };
  },
});
