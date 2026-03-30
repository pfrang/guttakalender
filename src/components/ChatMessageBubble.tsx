import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { formatDateAndTime } from "@/lib/utils/date";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
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

type PickerAnchor = {
  top: number;
  left?: number;
  right?: number;
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
  const [pickerAnchor, setPickerAnchor] = useState<PickerAnchor | null>(null);
  const bubbleRef = useRef<View>(null);

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
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    },
  );

  const hasCurrentUserReaction = (emoji: string) =>
    currentUserId
      ? (message.reactions ?? []).some(
          (r) => r.userId === currentUserId && r.emoji === emoji,
        )
      : false;

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId || isUpdatingReaction) return;
    setIsUpdatingReaction(true);
    try {
      if (hasCurrentUserReaction(emoji)) {
        await removeReaction({ chatId: message._id, emoji });
      } else {
        await addReaction({ chatId: message._id, emoji });
      }
    } finally {
      setIsUpdatingReaction(false);
    }
  };

  const handleBubblePress = () => {
    const now = Date.now();
    if (now - lastTapTimestampRef.current <= DOUBLE_TAP_DELAY_MS) {
      void toggleReaction(THUMB_EMOJI);
    }
    lastTapTimestampRef.current = now;
  };

  const handleBubbleLongPress = () => {
    if (!currentUserId || isUpdatingReaction) return;
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get("window").width;
      setPickerAnchor({
        top: y + height - 48,
        ...(isCurrentUser ? { right: screenWidth - x - width } : { left: x }),
      });
    });
  };

  const closePicker = () => setPickerAnchor(null);

  return (
    <View
      style={[
        styles.messageRow,
        isCurrentUser ? styles.messageRowRight : styles.messageRowLeft,
      ]}
    >
      <View style={styles.messageContent}>
        <Pressable
          ref={bubbleRef}
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
            selectable
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
                    if (reactedByCurrentUser) void toggleReaction(emoji);
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

      <Modal
        transparent
        visible={pickerAnchor !== null}
        animationType="none"
        onRequestClose={closePicker}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closePicker}>
          {pickerAnchor && (
            <Pressable
              style={[styles.picker, pickerAnchor]}
              onPress={(e) => e.stopPropagation()}
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
                      void toggleReaction(emoji);
                      closePicker();
                    }}
                  >
                    <Text style={styles.pickerEmoji}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubblePressed: {
    opacity: 0.92,
  },
  otherUserBubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  currentUserBubble: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  messageText: {
    color: "#1F2937",
    fontSize: 14,
    lineHeight: 20,
  },
  currentUserMessageText: {
    color: "#FFFFFF",
  },
  messageMeta: {
    marginTop: 6,
    fontSize: 11,
    color: "#6B7280",
  },
  currentUserMessageMeta: {
    color: "#D1D5DB",
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#FFFFFF",
  },
  reactionChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  reactionsRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  reactionLeft: {
    marginLeft: 4,
  },
  reactionRight: {
    alignSelf: "flex-end",
    marginRight: 4,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  reactionCountActive: {
    color: "#FFFFFF",
  },
  picker: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 4,
  },
  pickerItem: {
    minWidth: 24,
    minHeight: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pickerItemPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  pickerEmoji: {
    fontSize: 18,
  },
});
