import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
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

    const allGroups = await ctx.db.query("groups").collect();
    return allGroups.filter((group) => group.users?.includes(userId));
  },
});

export const getGroupById = query({
  args: {
    id: v.id("groups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getGroupsForCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("groups")
      .withIndex("by_users", (q) => q.eq("users", [userId]))
      .collect();
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

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      users: [userId],
    });

    await ctx.scheduler.runAfter(0, internal.users.internalAddGroupToUser, {
      userId,
      groupId,
    });

    return groupId;
  },
});

export const joinGroup = mutation({
  args: {
    groupId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const group = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("_id"), args.groupId))
      .first();

    if (!group) {
      return 404;
    }

    const currentUsers = group.users ?? [];

    if (currentUsers.includes(userId)) {
      return 409;
    }

    const groupId = await ctx.db.patch(args.groupId as Id<"groups">, {
      users: [...currentUsers, userId],
    });

    await ctx.scheduler.runAfter(0, internal.users.internalAddGroupToUser, {
      userId,
      groupId: args.groupId as Id<"groups">,
    });

    return groupId;
  },
});
