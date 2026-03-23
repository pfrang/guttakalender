import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  groups: defineTable({
    name: v.string(),
    // members are tracked in the groupMembers join table
  }),

  // Join table: replaces the bidirectional users[] on groups + groups[] on users.
  // Enables O(1) indexed lookups in both directions with no array drift.
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
  })
    .index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"])
    .index("by_groupId_userId", ["groupId", "userId"]),

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // groups[] removed — groupMembers join table is the source of truth
  }).index("by_name", ["name"]),

  plans: defineTable({
    location: v.string(),
    date: v.string(),
    creator: v.id("users"),
    groupId: v.id("groups"),
    plan: v.string(),
    // attendees is kept as an array: plans are always fetched by groupId,
    // so array scans are bounded and cheap. getPlansForCurrentUser goes
    // through groupMembers → plans instead of using the broken by_attendees index.
    attendees: v.array(v.id("users")),
  })
    .index("by_date", ["date"])
    .index("by_groupId", ["groupId"]),

  chat: defineTable({
    message: v.string(),
    userId: v.id("users"),
    groupId: v.id("groups"),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.string(),
        }),
      ),
    ),
  }).index("by_groupId", ["groupId"]),

  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),
});
