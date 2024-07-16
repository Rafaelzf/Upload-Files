import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  const hasAcess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  if (!hasAcess) {
    return null;
  }

  return { user };
}

export const createFiles = mutation({
  args: {
    name: v.string(),
    type: fileTypes,
    filedId: v.id("_storage"),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const hasAcess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAcess) {
      throw new ConvexError("You do not have acess to this org.");
    }

    await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      filedId: args.filedId,
      orgId: args.orgId,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("No access to file.");
    }
    await ctx.db.delete(args.fileId);

    // const access = await hasAccessToFile(ctx, args.fileId);
    // if (!access) {
    //   throw new ConvexError("no access to file");
    // }
    // assertCanDeleteFile(access.user, access.file);
    // await ctx.db.patch(args.fileId, {
    //   shouldDelete: true,
    // });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const hasAcess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAcess) {
      return [];
    }

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.query;

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAcess.user?._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    return files;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("You must be logged in to create files.");
  }

  return await ctx.storage.generateUploadUrl();
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("No access to file.");
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    if (!favorites) {
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        orgId: access.file.orgId,
        userId: access.user._id,
      });
    } else {
      await ctx.db.delete(favorites._id);
    }
  },
});

export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const hasAcess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAcess) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAcess.user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favorites;
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}
