import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Text } from "@/lib/components/Text";
import { formatDateAndTime } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
  plans: Doc<"plans">[];
}
export function PlansList({ plans }: Props) {
  const joinPlan = useMutation(api.plans.addUserToPlan);
  const user = useQuery(api.users.getCurrentUser);
  const [pendingJoinPlanId, setPendingJoinPlanId] = useState<string | null>(
    null,
  );

  function isAttending(attendees: string[]) {
    return attendees.some((attendee) => attendee === user?._id);
  }

  const onJoin = async (planId: Id<"plans">) => {
    if (!user?._id) {
      return;
    }
    setPendingJoinPlanId(planId);
    try {
      await joinPlan({ id: planId, userId: user._id });
    } finally {
      setPendingJoinPlanId(null);
    }
  };

  return (
    <View style={styles.list}>
      {plans.map((plan: Doc<"plans">) => {
        const attending = isAttending(plan.attendees);

        return (
          <Pressable
            key={plan._id}
            onPress={() =>
              router.push({
                pathname: "/[planId]",
                params: { planId: plan._id },
              })
            }
            style={({ pressed }) => [pressed && styles.cardHeaderPressed]}
          >
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
              {user && attending && (
                <View style={styles.detailsHintRow}>
                  <Text style={styles.detailsHintText}>Du er meldt på </Text>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default PlansList;

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E6EAF0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
    paddingBottom: 10,
  },
  cardHeaderPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
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
  detailsHintRow: {
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsHintText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  joinButtonWrapper: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 14,
    alignItems: "flex-start",
  },
  joinButton: {
    backgroundColor: "#25292e",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  joinButtonPressed: {
    opacity: 0.9,
  },
  joinButtonText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#25292e",
    color: "#ffffff",
  },
});
