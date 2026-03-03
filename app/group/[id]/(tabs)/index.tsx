import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateAndTime } from "@/lib/utils/date";
import { useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function GroupDetails() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const user = useQuery(api.users.getCurrentUser);
  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  return (
    <View style={styles.container}>
      <Text>
        Opprettet{" "}
        {formatDateAndTime(new Date(group?._creationTime ?? 0), "no", "medium")}
      </Text>
      <Text>{group?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
