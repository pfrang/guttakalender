import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { StyleSheet, Text, View } from "react-native";

export function Group({ groupId }: { groupId: Id<"groups"> }) {
  const groupData = useQuery(api.groups.getGroupById, { id: groupId });

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#000000" }}>{groupData?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 0,
    backgroundColor: "#D4D0C8",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
});
