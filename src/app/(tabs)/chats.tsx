import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable timestamp:
 *   - Same day  → "14:32"
 *   - This week → "Mon"
 *   - Older     → "12.03"
 */
function formatTimestamp(ms: number): string {
  const now = new Date();
  const date = new Date(ms);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfWeek = startOfToday - now.getDay() * 86_400_000;

  if (ms >= startOfToday) {
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (ms >= startOfWeek) {
    return date.toLocaleDateString("no-NO", { weekday: "short" });
  }
  return date.toLocaleDateString("no-NO", { day: "2-digit", month: "2-digit" });
}

// ---------------------------------------------------------------------------
// ChatRow
// ---------------------------------------------------------------------------

type ChatRow = {
  group: { _id: string; _creationTime: number; name: string };
  latestMessage: {
    _id: string;
    _creationTime: number;
    message: string;
  } | null;
  senderName: string | null;
  isMine: boolean;
};

function ChatRow({ item, onPress }: { item: ChatRow; onPress: () => void }) {
  const preview = item.latestMessage
    ? item.isMine
      ? `Du: ${item.latestMessage.message}`
      : item.senderName
        ? `${item.senderName}: ${item.latestMessage.message}`
        : item.latestMessage.message
    : "Ingen meldinger enda";

  const timestamp = item.latestMessage
    ? formatTimestamp(item.latestMessage._creationTime)
    : null;

  // First letter(s) of group name as avatar placeholder.
  const initials = item.group.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.group.name}
          </Text>
          {timestamp ? (
            <Text style={styles.timestamp}>{timestamp}</Text>
          ) : null}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Chats() {
  const router = useRouter();
  const overview = useQuery(api.chat.getChatsOverview);

  if (overview === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Meldinger</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Meldinger</Text>
      </View>

      <FlatList
        data={overview}
        keyExtractor={(item) => item.group._id}
        renderItem={({ item }) => (
          <ChatRow
            item={item as ChatRow}
            onPress={() => router.push(`/chats/${item.group._id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          overview.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Du er ikke med i noen samtaler enda.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  listContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
  },
  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  rowPressed: {
    backgroundColor: "#F3F4F6",
  },
  // Avatar
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Row content
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  groupName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
    flexShrink: 0,
  },
  preview: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 16 + AVATAR_SIZE + 12, // align with text, skip avatar
  },
  // Empty / loading
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
