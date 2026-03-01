import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateAndTime } from "@/lib/utils/date";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function GroupDetails() {
  const { groupId } = useLocalSearchParams<{ groupId?: string | string[] }>();
  const user = useQuery(api.users.getCurrentUser);
  const group = useQuery(api.groups.getGroupById, {
    id: groupId as Id<"groups">,
  });

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
    flex: 1,
    padding: 16,
  },
});
