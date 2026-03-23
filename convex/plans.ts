import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getPlans = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();
  },
});

// Fetches all plans the current user is attending.
// Strategy: groupMembers (indexed) → plans by groupId (indexed) → filter by attendees.
// This replaces the previous broken by_attendees index approach.
export const getPlansForCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const plansByGroup = await Promise.all(
      memberships.map((m) =>
        ctx.db
          .query("plans")
          .withIndex("by_groupId", (q) => q.eq("groupId", m.groupId))
          .collect(),
      ),
    );

    return plansByGroup
      .flat()
      .filter((plan) => plan.attendees.includes(userId));
  },
});

export const addPlan = mutation({
  args: {
    date: v.string(),
    location: v.string(),
    plan: v.string(),
    groupId: v.id("groups"),
    attendees: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("plans", {
      date: args.date,
      plan: args.plan,
      creator: userId,
      groupId: args.groupId,
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

    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.creator !== userId) {
      throw new Error("You can only delete your own plans");
    }

    await ctx.db.delete(args.planId);
  },
});

export const addUserToPlan = mutation({
  args: {
    id: v.id("plans"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const plan = await ctx.db.get(args.id);

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Idempotent — skip if already attending
    if (plan.attendees.includes(args.userId)) {
      return;
    }

    await ctx.db.patch(args.id, {
      attendees: [...plan.attendees, args.userId],
    });
  },
});

export const removeUserFromPlan = mutation({
  args: {
    id: v.id("plans"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const plan = await ctx.db.get(args.id);

    if (!plan) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(args.id, {
      attendees: plan.attendees.filter((id) => id !== args.userId),
    });
  },
});
