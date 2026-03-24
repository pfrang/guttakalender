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
            <Text>Dine grupper</Text>
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
            <Text>Dine samtaler</Text>
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
    padding: 16,
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContent: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
