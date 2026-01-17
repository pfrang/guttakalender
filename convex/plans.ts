import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getPlans = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("plans").collect();
    },
});

export const addPlan = mutation({
    args: {
        date: v.string(),
        location: v.string(),
        plan: v.string(),
        userId: v.string(),
        attendees: v.array(v.string()),
    },

    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.insert("plans", {
            date: args.date,
            plan: args.plan,
            userId: args.userId,
            attendees: args.attendees,
            location: args.location,
        });
    },
});

export const deletePlan = mutation({
    args: {
        planId: v.id("plans"),
    },

    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Optional: Check if the user is the owner of the plan before deleting
        const plan = await ctx.db.get("plans", args.planId);
        if (!plan) {
            throw new Error("Plan not found");
        }

        // Optional: Only allow the creator to delete
        if (plan.userId !== userId) {
            throw new Error("You can only delete your own plans");
        }

        await ctx.db.delete("plans", args.planId);
    },
});

export const addUserToPlan = mutation({
    args: {
        id: v.id("plans"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const plan = await ctx.db.get("plans", args.id);

        if (!plan) {
            throw new Error("Task not found");
        }

        return await ctx.db.patch("plans", args.id, {
            attendees: [...plan.attendees, args.userId],
        });
    },
});

export const removeUserFromPlan = mutation({
    args: {
        id: v.id("plans"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const plan = await ctx.db.get("plans", args.id);

        if (!plan) {
            throw new Error("Task not found");
        }

        const updatedAttendees = plan.attendees.filter((attendee) => attendee !== args.userId);

        return await ctx.db.patch("plans", args.id, {
            attendees: updatedAttendees,
        });
    },
});
