import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

/**
 * Returns all conversations the current user is part of, each with its
 * latest message. Sorted by most-recent activity (newest first).
 *
 * Data flow:
 *   groupMembers(by_userId) → groups → chat(by_groupId, desc).first()
 *
 * All lookups are index-backed — no full-table scans.
 */
export const getChatsOverview = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (memberships.length === 0) return [];

    const rows = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        // One indexed read per group — order desc, take the first doc.
        const latestMessage = await ctx.db
          .query("chat")
          .withIndex("by_groupId", (q) => q.eq("groupId", membership.groupId))
          .order("desc")
          .first();

        // Resolve the sender's name so the UI doesn't need a second query.
        const sender = latestMessage
          ? await ctx.db.get(latestMessage.userId)
          : null;

        return {
          group,
          latestMessage: latestMessage ?? null,
          senderName: (sender as { name?: string } | null)?.name ?? null,
          isMine: latestMessage?.userId === userId,
        };
      }),
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => {
        // Groups with no messages fall to the bottom.
        const aTime =
          a.latestMessage?._creationTime ?? a.group._creationTime;
        const bTime =
          b.latestMessage?._creationTime ?? b.group._creationTime;
        return bTime - aTime;
      });
  },
});

export const getChatsByGroupId = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();
  },
});

export const addChat = mutation({
  args: {
    message: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("chat", {
      message: args.message,
      userId: userId,
      groupId: args.groupId,
    });

    const sender = await ctx.db.get(userId);
    const senderName = (sender as { name?: string } | null)?.name?.trim() || "Ukjent";

    await ctx.scheduler.runAfter(0, internal.push.sendChatNotifications, {
      senderUserId: userId,
      senderName,
      message: args.message,
      groupId: args.groupId,
    });
  },
});

export const addReaction = mutation({
  args: {
    chatId: v.id("chat"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const chat = await ctx.db.get("chat", args.chatId);
    if (!chat) {
      throw new Error("Chat message not found");
    }

    const existingReactions = chat.reactions || [];

    // Check if user already reacted with this emoji
    const hasReacted = existingReactions.some(
      (r) => r.userId === userId && r.emoji === args.emoji,
    );

    if (hasReacted) {
      return;
    }

    // Add the reaction if user does not already have this exact reaction.
    await ctx.db.patch("chat", args.chatId, {
      reactions: [...existingReactions, { emoji: args.emoji, userId }],
    });
  },
});

export const removeReaction = mutation({
  args: {
    chatId: v.id("chat"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const chat = await ctx.db.get("chat", args.chatId);
    if (!chat) {
      throw new Error("Chat message not found");
    }

    const existingReactions = chat.reactions || [];
    const updatedReactions = existingReactions.filter(
      (r) => !(r.userId === userId && r.emoji === args.emoji),
    );

    await ctx.db.patch("chat", args.chatId, { reactions: updatedReactions });
  },
});
