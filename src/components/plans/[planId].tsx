import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Text } from "@/lib/components/Text";
import { formatDateAndTime } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function PlanDetailsModal() {
  const { planId } = useLocalSearchParams<{
    planId?: string | string[];
  }>();
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;

  const plans = useQuery(
    api.plans.getPlans,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip",
  );
  const allUsers = useQuery(api.users.getUsers);
  const user = useQuery(api.users.getCurrentUser);
  const joinPlan = useMutation(api.plans.addUserToPlan);
  const removeUserFromPlan = useMutation(api.plans.removeUserFromPlan);
  const deletePlan = useMutation(api.plans.deletePlan);
  const [isMutating, setIsMutating] = useState(false);

  const plan = plans?.find((item) => item._id === planId);

  function getUserFromId(userId?: string) {
    return allUsers?.find((item) => item._id === userId);
  }

  function isUserPlan(creator?: string) {
    return creator === user?._id;
  }

  function isAttending(attendees: string[]) {
    return attendees.some((attendee) => attendee === user?._id);
  }

  const onJoin = async () => {
    if (!user?._id || !plan) {
      return;
    }
    setIsMutating(true);
    try {
      await joinPlan({ id: plan._id as Id<"plans">, userId: user._id });
    } finally {
      setIsMutating(false);
    }
  };

  const onLeave = async () => {
    if (!user?._id || !plan) {
      return;
    }
    setIsMutating(true);
    try {
      await removeUserFromPlan({
        id: plan._id as Id<"plans">,
        userId: user._id,
      });
    } finally {
      setIsMutating(false);
    }
  };

  const onDelete = async () => {
    if (!plan) {
      return;
    }
    setIsMutating(true);
    try {
      await deletePlan({ planId: plan._id as Id<"plans"> });
      router.back();
    } finally {
      setIsMutating(false);
    }
  };

  if (!planId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Ugyldig plan-id: {planId}.</Text>
      </View>
    );
  }

  if (plans === undefined || allUsers === undefined || user === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Laster plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Planen finnes ikke lenger.</Text>
      </View>
    );
  }

  const attending = isAttending(plan.attendees);
  const isOwner = isUserPlan(plan.creator);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={18} color="#111827" />
          <Text style={styles.infoText}>
            {formatDateAndTime(plan.date, "no", "medium", true)}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color="#111827" />
          <Text style={styles.infoText}>{plan.location}</Text>
        </View>

        <View style={styles.ownerRow}>
          <Ionicons name="ribbon-outline" size={18} color="#111827" />
          <Text style={styles.ownerText}>
            {getUserFromId(plan.creator)?.name ?? "Ukjent"}
          </Text>
        </View>

        <Text style={styles.planText}>{plan.plan}</Text>

        <View style={styles.attendeesHeader}>
          <Text style={styles.sectionTitle}>Pameldte</Text>
          {isOwner ? (
            <Button
              title={isMutating ? "Sletter..." : "Slett plan"}
              variant="secondary"
              onPress={() => void onDelete()}
              disabled={isMutating}
            />
          ) : null}
        </View>

        <View style={styles.attendeesList}>
          {plan.attendees.map((attendeeId: string) => (
            <View key={attendeeId} style={styles.attendeeRow}>
              <Ionicons name="person-outline" size={16} color="#374151" />
              <Text style={styles.attendeeText}>
                {getUserFromId(attendeeId)?.name ?? "Ukjent bruker"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title={isMutating ? "Sender..." : "Keen?"}
            onPress={() => void onJoin()}
            disabled={isMutating || attending}
          />
          <Button
            title={isMutating ? "Sender..." : "Ukeen?"}
            variant="secondary"
            onPress={() => void onLeave()}
            disabled={isMutating || !attending}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  message: {
    color: "#374151",
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#111827",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ownerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  planText: {
    color: "#1F2937",
    fontSize: 15,
    lineHeight: 22,
  },
  attendeesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  attendeesList: {
    gap: 6,
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attendeeText: {
    color: "#374151",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
