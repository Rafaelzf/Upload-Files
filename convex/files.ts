import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";

export const createFiles = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("You must be logged in to create files.");
    }

    await ctx.db.insert("files", {
      name: args.name,
    });
  },
});

export const getFiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }
    return await ctx.db.query("files").collect();
  },
});
