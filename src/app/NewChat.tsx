import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AVATAR_SIZE = 46;

function userInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function NewChat() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const users = useQuery(api.users.getUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const getOrCreateDM = useMutation(api.conversations.getOrCreateDM);

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const otherUsers = users?.filter((u) => u._id !== currentUser?._id) ?? [];

  const handleSelect = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const conversationId = await getOrCreateDM({
        otherUserId: userId as Id<"users">,
      });
      router.dismiss();
      router.push({
        pathname: "/chats/[id]",
        params: { id: conversationId },
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  if (users === undefined || currentUser === undefined) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + 12 }]}>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 12 }]}>
      <FlatList
        data={otherUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const name = item.name ?? item.email ?? "Ukjent";
          const isLoading = loadingUserId === item._id;

          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() => void handleSelect(item._id)}
              disabled={loadingUserId !== null}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitials(name)}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.name}>{name}</Text>
                {item.email ? (
                  <Text style={styles.email} numberOfLines={1}>
                    {item.email}
                  </Text>
                ) : null}
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#D1D5DB"
                />
              )}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          otherUsers.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Ingen andre brukere å chatte med enda.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
  },
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
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 16 + AVATAR_SIZE + 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
