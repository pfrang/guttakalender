import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

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
        const hasReacted = existingReactions.some((r) => r.userId === userId && r.emoji === args.emoji);

        if (hasReacted) {
            // Remove the reaction (toggle off)
            const updatedReactions = existingReactions.filter((r) => !(r.userId === userId && r.emoji === args.emoji));
            await ctx.db.patch("chat", args.chatId, { reactions: updatedReactions });
        } else {
            // Add the reaction
            await ctx.db.patch("chat", args.chatId, {
                reactions: [...existingReactions, { emoji: args.emoji, userId }],
            });
        }
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
        const updatedReactions = existingReactions.filter((r) => !(r.userId === userId && r.emoji === args.emoji));

        await ctx.db.patch("chat", args.chatId, { reactions: updatedReactions });
    },
});
