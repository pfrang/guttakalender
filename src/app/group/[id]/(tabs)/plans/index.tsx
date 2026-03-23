import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddComponent } from "@/src/components/Add";
import { PlansList } from "@/src/components/PlansList";
import { useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Plans() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const plans = useQuery(
    api.plans.getPlans,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip",
  );
  const allUsers = useQuery(api.users.getUsers);
  const user = useQuery(api.users.getCurrentUser);
  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  const plansAfterToday = plans ?? [];

  const hasPlans = plansAfterToday.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{group?.name} kommende planer</Text>
        {plans === undefined || allUsers === undefined || user === undefined ? (
          <Text style={styles.message}>Laster planer...</Text>
        ) : !hasPlans ? (
          <Text style={styles.message}>Ingen planer lagt til enda</Text>
        ) : (
          <PlansList
            plans={plansAfterToday}
            groupId={groupId as Id<"groups">}
          />
        )}
      </ScrollView>
      <AddComponent path={`/group/${id}/AddPlan`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 96,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    color: "#374151",
    fontSize: 16,
  },
});
