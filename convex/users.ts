import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
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

export const addUserToGroup = mutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as Id<"users">, {
      groups: [
        ...((await ctx.db.get(args.userId as Id<"users">))?.groups || []),
        args.groupId,
      ],
    });
  },
});

export const internalAddGroupToUser = internalMutation({
  args: {
    userId: v.id("users"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const currentGroups = user?.groups ?? [];
    if (currentGroups.includes(args.groupId)) return;
    await ctx.db.patch(args.userId, {
      groups: [...currentGroups, args.groupId],
    });
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

export const getPushTokensForGroup = internalQuery({
  args: {
    groupId: v.id("groups"),
    senderUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    const memberIds = (group?.users ?? []).filter(
      (id) => id !== args.senderUserId,
    );
    if (memberIds.length === 0) return [];

    const tokens = await Promise.all(
      memberIds.map((userId) =>
        ctx.db
          .query("pushTokens")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect(),
      ),
    );
    return tokens.flat();
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
