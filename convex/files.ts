import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { getUser } from "./users";

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier);

  const hasAcess =
    !user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  return hasAcess;
}

export const createFiles = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("You must be logged in to create files.");
    }

    const hasAcess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (hasAcess) {
      throw new ConvexError("You do not have acess to this org.");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const hasAcess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );


    if (!hasAcess) {
      return [];
    }

    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
