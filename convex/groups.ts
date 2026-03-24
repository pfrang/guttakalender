import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getGroupsForCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const groups = await Promise.all(
      memberships.map((m) => ctx.db.get(m.groupId)),
    );

    return groups.filter((g): g is NonNullable<typeof g> => g !== null);
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

// Returns the full user docs for all members of a group.
// Use this instead of fetching all users and filtering client-side.
export const getGroupMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const users = await Promise.all(
      memberships.map((m) => ctx.db.get(m.userId)),
    );

    return users.filter((u): u is NonNullable<typeof u> => u !== null);
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
    });

    await ctx.db.insert("groupMembers", { groupId, userId });

    // Create the conversation for this group so the chat tab works immediately.
    await ctx.db.insert("conversations", { type: "group", groupId });

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

    const group = await ctx.db.get(args.groupId as Id<"groups">);
    if (!group) {
      return 404;
    }

    // Membership check via index — O(1), no array scan.
    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_groupId_userId", (q) =>
        q.eq("groupId", args.groupId as Id<"groups">).eq("userId", userId),
      )
      .unique();

    if (existing) {
      return 409;
    }

    await ctx.db.insert("groupMembers", {
      groupId: args.groupId as Id<"groups">,
      userId,
    });

    return null;
  },
});
