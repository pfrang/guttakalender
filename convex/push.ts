import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

type ExpoPushMessage = {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data?: Record<string, string>;
};

function chunkMessages<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const sendChatNotifications = internalAction({
  args: {
    senderUserId: v.id("users"),
    message: v.string(),
    senderName: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.runQuery(
      internal.conversations.getConversationForPush,
      { conversationId: args.conversationId },
    );
    if (!conv) return;

    let tokens: { token: string }[] = [];
    let title = "Ny melding";
    let body = args.message;
    let notificationUrl = `/chats/${args.conversationId}`;

    if (conv.type === "group" && conv.groupId) {
      tokens = await ctx.runQuery(internal.users.getPushTokensForGroup, {
        groupId: conv.groupId,
        senderUserId: args.senderUserId,
      });
      const group = await ctx.runQuery(api.groups.getGroupById, {
        id: conv.groupId,
      });
      title = group?.name ? `Ny melding i ${group.name}` : "Ny melding";
      body = `${args.senderName}: ${args.message}`;
      notificationUrl = `/group/${conv.groupId}/chat`;
    } else if (conv.type === "dm" && conv.participantIds) {
      const otherUserId = conv.participantIds.find(
        (id) => id !== args.senderUserId,
      );
      if (!otherUserId) return;
      tokens = await ctx.runQuery(internal.users.getPushTokensForUser, {
        userId: otherUserId,
      });
      title = `Ny melding fra ${args.senderName}`;
    } else {
      return;
    }

    const uniqueTokens = Array.from(new Set(tokens.map((t) => t.token)));
    if (uniqueTokens.length === 0) return;

    const payload: ExpoPushMessage[] = uniqueTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { url: notificationUrl },
    }));

    const chunks = chunkMessages(payload, 100);
    for (const chunk of chunks) {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      const responseData = Array.isArray(result?.data) ? result.data : [];

      for (let index = 0; index < responseData.length; index += 1) {
        const item = responseData[index];
        const token = chunk[index]?.to;

        if (
          token &&
          item?.status === "error" &&
          item?.details?.error === "DeviceNotRegistered"
        ) {
          await ctx.runMutation(internal.users.removePushToken, { token });
        }
      }
    }
  },
});
