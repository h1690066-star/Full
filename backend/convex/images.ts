import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByFilename = query({
  args: { filename: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();
  },
});

export const saveImage = mutation({
  args: {
    filename: v.string(),
    data: v.optional(v.string()),
    storageId: v.optional(v.string()),
    mime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("images")
      .withIndex("by_filename", (q) => q.eq("filename", args.filename))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data || existing.data,
        storageId: args.storageId || existing.storageId,
        mime: args.mime || existing.mime,
      });
      return existing._id;
    }

    return await ctx.db.insert("images", args);
  },
});
