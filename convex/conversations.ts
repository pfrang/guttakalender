import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internalQuery, mutation, query } from "./_generated/server";

/**
 * Returns all conversations for the current user — both group chats and DMs —
 * each with the latest message. Sorted newest-first.
 *
 * Group chats:  groupMembers(by_userId) → conversations(by_groupId)
 * DM chats:     conversationMembers(by_userId) → conversations
 */
export const getConversationsForUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // ── Group conversations ──────────────────────────────────────────────────
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const groupRows = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get("groups", membership.groupId);
        if (!group) return null;

        const conversation = await ctx.db
          .query("conversations")
          .withIndex("by_groupId", (q) => q.eq("groupId", membership.groupId))
          .unique();
        if (!conversation) return null;

        const latestMessage = await ctx.db
          .query("chat")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .order("desc")
          .first();

        const sender = latestMessage
          ? await ctx.db.get("users", latestMessage.userId)
          : null;

        return {
          id: conversation._id,
          type: "group" as const,
          groupId: group._id,
          name: group.name,
          latestMessage: latestMessage ?? null,
          senderName: (sender as { name?: string } | null)?.name ?? null,
          isMine: latestMessage?.userId === userId,
          sortTime: latestMessage?._creationTime ?? group._creationTime,
        };
      }),
    );

    // ── DM conversations ─────────────────────────────────────────────────────
    const dmMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const dmRows = await Promise.all(
      dmMemberships.map(async (membership) => {
        const conversation = await ctx.db.get(
          "conversations",
          membership.conversationId,
        );
        if (!conversation || conversation.type !== "dm") return null;

        const otherUserId = conversation.participantIds?.find(
          (id) => id !== userId,
        );
        const otherUser = otherUserId
          ? await ctx.db.get("users", otherUserId)
          : null;

        const latestMessage = await ctx.db
          .query("chat")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .order("desc")
          .first();

        const sender = latestMessage
          ? await ctx.db.get(latestMessage.userId)
          : null;

        return {
          id: conversation._id,
          type: "dm" as const,
          name: (otherUser as { name?: string } | null)?.name ?? "Ukjent",
          groupId: null,
          latestMessage: latestMessage ?? null,
          senderName: (sender as { name?: string } | null)?.name ?? null,
          isMine: latestMessage?.userId === userId,
          sortTime: latestMessage?._creationTime ?? conversation._creationTime,
        };
      }),
    );

    return [...groupRows, ...dmRows]
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.sortTime - a.sortTime);
  },
});

/**
 * Returns the conversation for a given group. Used by the group chat tab
 * to resolve a groupId → conversationId.
 */
export const getConversationByGroupId = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .unique();
  },
});

/** Returns a human-readable title for the chat header. */
export const getConversationTitle = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const conv = await ctx.db.get("conversations", args.conversationId);
    if (!conv) return null;

    if (conv.type === "group" && conv.groupId) {
      const group = await ctx.db.get("groups", conv.groupId);
      return group?.name ?? "Gruppe";
    }

    if (conv.type === "dm") {
      const otherId = conv.participantIds?.find((id) => id !== userId);
      if (!otherId) return "Melding";
      const other = await ctx.db.get("users", otherId);
      return (other as { name?: string } | null)?.name ?? "Ukjent";
    }

    return null;
  },
});

/** Internal query used by push.ts to resolve conversation recipients. */
export const getConversationForPush = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get("conversations", args.conversationId);
  },
});

/**
 * Finds an existing DM conversation between the current user and otherUserId,
 * or creates one if none exists. Returns the conversationId.
 */
export const getOrCreateDM = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    if (userId === args.otherUserId) throw new Error("Cannot DM yourself");

    // Lexicographically sorted key guarantees uniqueness regardless of who initiates.
    const dmKey = [userId, args.otherUserId].sort().join("_");

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_dmKey", (q) => q.eq("dmKey", dmKey))
      .unique();

    if (existing) return existing._id;

    const conversationId = await ctx.db.insert("conversations", {
      type: "dm",
      dmKey,
      participantIds: [userId, args.otherUserId],
    });

    await ctx.db.insert("conversationMembers", { conversationId, userId });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
    });

    return conversationId;
  },
});
