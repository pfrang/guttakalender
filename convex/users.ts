import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.get("users", userId);
  },
});

export const mutateUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch("users", userId, {
      name: args.name,
    });
  },
});

export const savePushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!existing) {
      await ctx.db.insert("pushTokens", {
        userId,
        token: args.token,
        platform: args.platform,
        updatedAt: Date.now(),
      });
      return;
    }

    await ctx.db.patch(existing._id, {
      userId,
      platform: args.platform,
      updatedAt: Date.now(),
    });
  },
});

export const getPushTokensExcludingUser = internalQuery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db.query("pushTokens").collect();
    return tokens.filter((item) => item.userId !== args.userId);
  },
});

export const removePushToken = internalMutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!existing) {
      return;
    }

    await ctx.db.delete(existing._id);
  },
});
