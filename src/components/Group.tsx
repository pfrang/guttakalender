import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { StyleSheet, Text, View } from "react-native";

export function Group({ groupId }: { groupId: Id<"groups"> }) {
  const groupData = useQuery(api.groups.getGroupById, { id: groupId });

  return (
    <View style={styles.container}>
      <Text>{groupData?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
});
