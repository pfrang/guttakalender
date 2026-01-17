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
