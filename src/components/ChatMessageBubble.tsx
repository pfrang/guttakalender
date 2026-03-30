import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatDateAndTime } from "@/lib/utils/date";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const THUMB_EMOJI = "👍";
const DOUBLE_TAP_DELAY_MS = 280;
const REACTION_OPTIONS = ["👍", "❤️", "😂", "😮", "🔥"] as const;

type ChatMessageBubbleProps = {
  message: Doc<"chat">;
  userName: string;
  isCurrentUser: boolean;
  currentUserId?: string;
};

export function ChatMessageBubble({
  message,
  userName,
  isCurrentUser,
  currentUserId,
}: ChatMessageBubbleProps) {
  const addReaction = useMutation(api.chat.addReaction);
  const removeReaction = useMutation(api.chat.removeReaction);
  const lastTapTimestampRef = useRef(0);
  const [isUpdatingReaction, setIsUpdatingReaction] = useState(false);
  const [isReactionPickerVisible, setIsReactionPickerVisible] = useState(false);

  const reactionCounts = new Map<string, number>();
  for (const reaction of message.reactions ?? []) {
    reactionCounts.set(
      reaction.emoji,
      (reactionCounts.get(reaction.emoji) ?? 0) + 1,
    );
  }

  const sortedReactionEntries = [...reactionCounts.entries()].sort(
    ([a], [b]) => {
      const aIndex = REACTION_OPTIONS.indexOf(
        a as (typeof REACTION_OPTIONS)[number],
      );
      const bIndex = REACTION_OPTIONS.indexOf(
        b as (typeof REACTION_OPTIONS)[number],
      );

      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }
      if (aIndex === -1) {
        return 1;
      }
      if (bIndex === -1) {
        return -1;
      }
      return aIndex - bIndex;
    },
  );

  const hasCurrentUserReaction = (emoji: string) =>
    currentUserId
      ? (message.reactions ?? []).some(
          (reaction) =>
            reaction.userId === currentUserId && reaction.emoji === emoji,
        )
      : false;

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId || isUpdatingReaction) {
      return;
    }

    setIsUpdatingReaction(true);
    try {
      if (hasCurrentUserReaction(emoji)) {
        await removeReaction({
          chatId: message._id,
          emoji,
        });
      } else {
        await addReaction({
          chatId: message._id,
          emoji,
        });
      }
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  const handleBubblePress = () => {
    if (isReactionPickerVisible) {
      setIsReactionPickerVisible(false);
      return;
    }

    const now = Date.now();
    if (now - lastTapTimestampRef.current <= DOUBLE_TAP_DELAY_MS) {
      void toggleReaction(THUMB_EMOJI);
    }
    lastTapTimestampRef.current = now;
  };

  const handleBubbleLongPress = () => {
    if (!currentUserId || isUpdatingReaction) {
      return;
    }
    setIsReactionPickerVisible(true);
  };

  const selectReaction = async (emoji: string) => {
    setIsReactionPickerVisible(false);
    await toggleReaction(emoji);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isReactionPickerVisible) {
          setIsReactionPickerVisible(false);
        }
      }}
      disabled={!isReactionPickerVisible}
    >
      <View
        style={[
          styles.messageRow,
          isCurrentUser ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View style={styles.messageContent}>
          {isReactionPickerVisible ? (
            <View
              style={[
                styles.pickerContainer,
                isCurrentUser
                  ? styles.pickerCurrentUserMessage
                  : styles.pickerOtherUserMessage,
              ]}
            >
              <View style={styles.pickerRow}>
                {REACTION_OPTIONS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    style={({ pressed }) => [
                      styles.pickerItem,
                      pressed && styles.pickerItemPressed,
                    ]}
                    onPress={() => {
                      void selectReaction(emoji);
                    }}
                  >
                    <Text style={styles.pickerEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={handleBubblePress}
            onLongPress={handleBubbleLongPress}
            delayLongPress={300}
            style={({ pressed }) => [
              styles.bubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
              pressed && styles.bubblePressed,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isCurrentUser && styles.currentUserMessageText,
              ]}
            >
              {message.message}
            </Text>
            <Text
              style={[
                styles.messageMeta,
                isCurrentUser && styles.currentUserMessageMeta,
              ]}
            >
              {userName} -{" "}
              {formatDateAndTime(
                new Date(message._creationTime),
                "no",
                "short",
                true,
              )}
            </Text>
          </Pressable>

          {sortedReactionEntries.length > 0 ? (
            <View
              style={[
                styles.reactionsRow,
                isCurrentUser ? styles.reactionRight : styles.reactionLeft,
              ]}
            >
              {sortedReactionEntries.map(([emoji, count]) => {
                const reactedByCurrentUser = hasCurrentUserReaction(emoji);

                return (
                  <Pressable
                    key={emoji}
                    style={[
                      styles.reactionChip,
                      reactedByCurrentUser && styles.reactionChipActive,
                    ]}
                    onPress={() => {
                      reactedByCurrentUser && void toggleReaction(emoji);
                    }}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    <Text
                      style={[
                        styles.reactionCount,
                        reactedByCurrentUser && styles.reactionCountActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    width: "100%",
    flexDirection: "row",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  messageContent: {
    maxWidth: "82%",
    position: "relative",
  },
  bubble: {
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  bubblePressed: {
    opacity: 0.85,
  },
  otherUserBubble: {
    backgroundColor: "#D4D0C8",
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
  currentUserBubble: {
    backgroundColor: "#000080",
    borderTopColor: "#4040C0",
    borderLeftColor: "#4040C0",
    borderBottomColor: "#000040",
    borderRightColor: "#000040",
  },
  messageText: {
    color: "#000000",
    fontSize: 13,
    lineHeight: 18,
  },
  currentUserMessageText: {
    color: "#FFFFFF",
  },
  messageMeta: {
    marginTop: 4,
    fontSize: 10,
    color: "#808080",
  },
  currentUserMessageMeta: {
    color: "#A0A0D0",
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#D4D0C8",
  },
  reactionChipActive: {
    backgroundColor: "#000080",
    borderTopColor: "#4040C0",
    borderLeftColor: "#4040C0",
    borderBottomColor: "#000040",
    borderRightColor: "#000040",
  },
  reactionsRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  reactionLeft: {
    marginLeft: 2,
  },
  reactionRight: {
    alignSelf: "flex-end",
    marginRight: 2,
  },
  reactionEmoji: {
    fontSize: 11,
  },
  reactionCount: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "700",
  },
  reactionCountActive: {
    color: "#FFFFFF",
  },
  pickerContainer: {
    position: "absolute",
    top: -36,
    zIndex: 10,
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
    backgroundColor: "#D4D0C8",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  pickerCurrentUserMessage: {
    right: 80,
  },
  pickerOtherUserMessage: {
    left: 80,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 2,
  },
  pickerItem: {
    minWidth: 28,
    minHeight: 24,
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
    backgroundColor: "#D4D0C8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pickerItemPressed: {
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  pickerEmoji: {
    fontSize: 16,
  },
});
