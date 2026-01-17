import { DataModel } from "../../convex/_generated/dataModel";

interface Chats {
    name: string;
    timestamp: number;
    message: string;
}

export function sortChatsByUser(
    messages: DataModel["chat"]["document"][],
    users: DataModel["users"]["document"][]
): Chats[] {
    const sortedMessages: Chats[] = messages
        .map((msg) => {
            const user = users.find((user) => user._id === msg.userId);
            return {
                name: user?.name || "Unknown",
                message: msg.message,
                timestamp: msg._creationTime,
            };
        })
        .sort((a, b) => a.timestamp - b.timestamp);

    return sortedMessages;
}
