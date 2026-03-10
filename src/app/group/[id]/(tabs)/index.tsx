import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateAndTime } from "@/lib/utils/date";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function GroupDetails() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const headerHeight = useHeaderHeight();
  const groupId = Array.isArray(id) ? id[0] : id;
  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );
  const users = useQuery(api.users.getUsers);

  const groupUsers = users?.filter((user) => group?.users?.includes(user._id));
  const groupUserNames = groupUsers?.map((user) => user.name).join(", ");

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 12 }]}>
      <Text>
        Opprettet{" "}
        {formatDateAndTime(new Date(group?._creationTime ?? 0), "no", "medium")}
      </Text>
      <Text>{group?.name}</Text>
      <Text>{group?._id}</Text>
      <Text>Medlemmer:</Text>
      <Text>{groupUserNames}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    gap: 8,
  },
});
