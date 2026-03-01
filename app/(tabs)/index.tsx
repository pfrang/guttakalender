import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Group } from "../components/Group";

export default function Index() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const groups = useQuery(api.groups.getGroupsForUser, {
    userId: user?._id as Id<"users">,
  });

  return (
    <View style={styles.container}>
      <Text>Dine grupper</Text>
      <Button
        title="Legg til gruppe"
        onPress={() => router.push("/AddGroup")}
      />
      <FlatList
        data={groups ?? []}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/[groupId]",
                params: { groupId: item._id },
              })
            }
          >
            <Group group={item} />
          </Pressable>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          gap: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },

  groupItem: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF1",
  },
});
