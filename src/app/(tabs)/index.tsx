import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useQuery } from "convex/react";
import { Link, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AddComponent } from "../../components/Add";
import { Group } from "../../components/Group";

export default function Index() {
  const router = useRouter();
  const groups = useQuery(api.groups.getGroupsForCurrentUser);
  usePushNotifications();

  return (
    <View style={styles.container}>
      <FlatList
        data={groups ?? []}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.buttonRow}>
              <Link href="/JoinGroup" asChild>
                <Button title="Bli med i gruppe" />
              </Link>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF", backgroundColor: "#000080", paddingHorizontal: 8, paddingVertical: 4 }}>Dine grupper</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/group/[id]",
                params: { id: item._id },
              })
            }
          >
            <Group groupId={item._id} />
          </Pressable>
        )}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        contentContainerStyle={styles.listContent}
      />

      <FlatList
        data={groups ?? []}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF", backgroundColor: "#000080", paddingHorizontal: 8, paddingVertical: 4 }}>Dine samtaler</Text>
          </View>
        }
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/group/[id]/chat",
                params: { id: item._id },
              })
            }
          >
            <Group groupId={item._id} />
          </Pressable>
        )}
      />
      <AddComponent path="/AddGroup" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#C0C0C0",
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContent: {},
});
