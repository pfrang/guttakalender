import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SignOutButton } from "@/lib/components/SignOut";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AddComponent } from "../components/Add";
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
      <SignOutButton />
      <FlatList
        data={groups ?? []}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/group/[id]",
                params: { id: item._id as Id<"groups"> },
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
      <AddComponent path="/AddGroup" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
});
