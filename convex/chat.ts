import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const getChats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chat").collect();
  },
});

export const addChat = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("chat", {
      message: args.message,
      userId: userId,
    });

    const sender = await ctx.db.get(userId);
    const senderName = sender?.name?.trim() || "Ukjent";

    await ctx.scheduler.runAfter(0, internal.push.sendChatNotifications, {
      senderUserId: userId,
      senderName,
      message: args.message,
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
