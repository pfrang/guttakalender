import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

type ConversationRow = {
  id: string;
  type: "group" | "dm";
  name: string;
  groupId: string | null;
  latestMessage: {
    _id: string;
    _creationTime: number;
    message: string;
  } | null;
  senderName: string | null;
  isMine: boolean;
};

function ChatRow({
  item,
  onPress,
}: {
  item: ConversationRow;
  onPress: () => void;
}) {
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

  const isDm = item.type === "dm";

  const initials = item.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const avatarColor = isDm ? "#4F46E5" : "#6B7280";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.convName} numberOfLines={1}>
              {item.name}
            </Text>
            <Ionicons
              name={isDm ? "person" : "people-sharp"}
              size={10}
              color="#808080"
              style={{ marginLeft: 4 }}
            />
          </View>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Android add-sheet
// ---------------------------------------------------------------------------

function AndroidAddSheet({
  visible,
  onClose,
  onGroup,
  onDM,
}: {
  visible: boolean;
  onClose: () => void;
  onGroup: () => void;
  onDM: () => void;
}) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={sheet.backdrop} onPress={onClose}>
        <View style={sheet.panel}>
          <View style={sheet.handle} />
          <Pressable style={sheet.option} onPress={onGroup}>
            <Ionicons name="people-outline" size={16} color="#000000" />
            <Text style={sheet.optionText}>Ny gruppe</Text>
          </Pressable>
          <View style={sheet.divider} />
          <Pressable style={sheet.option} onPress={onDM}>
            <Ionicons name="chatbubble-outline" size={16} color="#000000" />
            <Text style={sheet.optionText}>Ny melding</Text>
          </Pressable>
          <Pressable style={sheet.cancelBtn} onPress={onClose}>
            <Text style={sheet.cancelText}>Avbryt</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function Chats() {
  const router = useRouter();
  const conversations = useQuery(api.conversations.getConversationsForUser);
  const [showAndroidSheet, setShowAndroidSheet] = useState(false);

  const handleAddPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Avbryt", "Ny gruppe", "Ny melding"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) router.push("/AddGroup");
          if (idx === 2) router.push("/NewChat");
        },
      );
    } else {
      setShowAndroidSheet(true);
    }
  };

  if (conversations === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Meldinger</Text>
          <AddButton onPress={handleAddPress} />
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
        <AddButton onPress={handleAddPress} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRow
            item={item as ConversationRow}
            onPress={() => {
              if (item.type === "dm") {
                router.push({
                  pathname: "/chats/[id]",
                  params: { id: item.id },
                });
              } else {
                router.push({
                  pathname: "/group/[id]/chat",
                  params: { id: item.groupId },
                });
              }
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          conversations.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Du er ikke med i noen samtaler enda.
            </Text>
          </View>
        }
      />

      {Platform.OS === "android" && (
        <AndroidAddSheet
          visible={showAndroidSheet}
          onClose={() => setShowAndroidSheet(false)}
          onGroup={() => {
            setShowAndroidSheet(false);
            router.push("/AddGroup");
          }}
          onDM={() => {
            setShowAndroidSheet(false);
            router.push("/NewChat");
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Add button — liquid-glass style circle
// ---------------------------------------------------------------------------

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
      hitSlop={8}
    >
      <Ionicons name="add" size={16} color="#000000" />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C0C0C0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: "#000080",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 22,
    height: 22,
    borderRadius: 0,
    backgroundColor: "#D4D0C8",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
  addBtnPressed: {
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  listContent: {
    paddingTop: 2,
  },
  emptyContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    backgroundColor: "#C0C0C0",
    borderBottomWidth: 1,
    borderBottomColor: "#808080",
  },
  rowPressed: {
    backgroundColor: "#000080",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#000080",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  convName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 11,
    color: "#808080",
    flexShrink: 0,
    fontWeight: "400",
  },
  preview: {
    fontSize: 12,
    color: "#404040",
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#808080",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 13,
    color: "#808080",
    textAlign: "center",
    lineHeight: 20,
  },
});

const sheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: "#D4D0C8",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingBottom: 36,
    paddingTop: 0,
    paddingHorizontal: 0,
    borderTopWidth: 2,
    borderTopColor: "#FFFFFF",
  },
  handle: {
    width: "100%",
    height: 24,
    backgroundColor: "#000080",
    alignSelf: "center",
    marginBottom: 12,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#808080",
    marginHorizontal: 16,
  },
  cancelBtn: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#D4D0C8",
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
    alignSelf: "flex-start",
  },
  cancelText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "700",
  },
});
