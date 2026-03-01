import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGroupsForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("users"), [userId]))
      .collect();
  },
});

export const getGroupById = query({
  args: {
    id: v.id("groups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get("groups", args.id);
  },
});

export const addGroup = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("groups", {
      name: args.name,
      users: [userId],
    });
  },
});
