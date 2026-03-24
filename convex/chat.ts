import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const getChatsByConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

export const addChat = mutation({
  args: {
    message: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("chat", {
      message: args.message,
      userId,
      conversationId: args.conversationId,
    });

    const sender = await ctx.db.get(userId);
    const senderName =
      (sender as { name?: string } | null)?.name?.trim() || "Ukjent";

    await ctx.scheduler.runAfter(0, internal.push.sendChatNotifications, {
      senderUserId: userId,
      senderName,
      message: args.message,
      conversationId: args.conversationId,
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

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat message not found");
    }

    const existingReactions = chat.reactions || [];

    const hasReacted = existingReactions.some(
      (r) => r.userId === userId && r.emoji === args.emoji,
    );

    if (hasReacted) {
      return;
    }

    await ctx.db.patch(args.chatId, {
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

    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat message not found");
    }

    const existingReactions = chat.reactions || [];
    const updatedReactions = existingReactions.filter(
      (r) => !(r.userId === userId && r.emoji === args.emoji),
    );

    await ctx.db.patch(args.chatId, { reactions: updatedReactions });
  },
});
