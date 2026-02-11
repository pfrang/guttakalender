import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { formatDateAndTime } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Plans() {
  const plans = useQuery(api.plans.getPlans);
  const allUsers = useQuery(api.users.getUsers);
  const user = useQuery(api.users.getCurrentUser);
  const joinPlan = useMutation(api.plans.addUserToPlan);
  const deletePlan = useMutation(api.plans.deletePlan);
  const removeUserFromPlan = useMutation(api.plans.removeUserFromPlan);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [pendingActionPlanId, setPendingActionPlanId] = useState<string | null>(
    null,
  );

  //   const plansAfterToday = useMemo(() => {
  //     return (plans ?? []).filter(
  //       (plan: any) => new Date(endOfDay(plan.date)) >= new Date(),
  //     );
  //   }, [plans]);

  const plansAfterToday = plans ?? [];

  function getUserFromId(userId?: string) {
    return allUsers?.find((item) => item._id === userId);
  }

  function isUserPlan(planUser?: string) {
    return planUser === user?._id;
  }

  function isAttending(attendees: string[]) {
    return attendees.some((attendee) => attendee === user?._id);
  }

  const hasPlans = plansAfterToday.length > 0;

  const onJoin = async (planId: Id<"plans">) => {
    if (!user?._id) {
      return;
    }
    setPendingActionPlanId(planId);
    try {
      await joinPlan({ id: planId, userId: user._id });
    } finally {
      setPendingActionPlanId(null);
    }
  };

  const onLeave = async (planId: Id<"plans">) => {
    if (!user?._id) {
      return;
    }
    setPendingActionPlanId(planId);
    try {
      await removeUserFromPlan({ id: planId, userId: user._id });
    } finally {
      setPendingActionPlanId(null);
    }
  };

  const onDelete = async (planId: Id<"plans">) => {
    setPendingActionPlanId(planId);
    try {
      await deletePlan({ planId });
    } finally {
      setPendingActionPlanId(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>Guttas kommende planer</Text>
        <Link href="/modal" style={{ color: "#111827" }}>
          <Button title="Legg til plan" />
        </Link>
      </View>
      {plans === undefined || allUsers === undefined || user === undefined ? (
        <Text style={styles.message}>Laster planer...</Text>
      ) : !hasPlans ? (
        <Text style={styles.message}>Ingen planer lagt til enda</Text>
      ) : (
        <View style={styles.list}>
          {plansAfterToday.map((plan: any) => {
            const expanded = expandedPlanId === plan._id;
            const attending = isAttending(plan.attendees);
            const isOwner = isUserPlan(plan.userId);
            const busy = pendingActionPlanId === plan._id;

            return (
              <View key={plan._id} style={styles.card}>
                <Pressable
                  onPress={() =>
                    setExpandedPlanId((current) =>
                      current === plan._id ? null : plan._id,
                    )
                  }
                  style={({ pressed }) => [
                    styles.cardHeader,
                    pressed && styles.cardHeaderPressed,
                  ]}
                >
                  <View style={styles.row}>
                    <Ionicons name="time-outline" size={18} color="#111827" />
                    <Text style={styles.infoText}>
                      {formatDateAndTime(plan.date, "no", "medium", true)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#111827"
                    />
                    <Text style={styles.infoText}>{plan.location}</Text>
                  </View>
                </Pressable>

                {expanded ? (
                  <View style={styles.expanded}>
                    <View style={styles.ownerRow}>
                      <Ionicons
                        name="ribbon-outline"
                        size={18}
                        color="#111827"
                      />
                      <Text style={styles.ownerText}>
                        {getUserFromId(plan.userId)?.name ?? "Ukjent"}
                      </Text>
                    </View>

                    <Text style={styles.planText}>{plan.plan}</Text>

                    <View style={styles.attendeesHeader}>
                      <Text style={styles.sectionTitle}>Pameldte</Text>
                      {isOwner ? (
                        <Button
                          title={busy ? "Sletter..." : "Slett plan"}
                          variant="secondary"
                          onPress={() => void onDelete(plan._id)}
                          disabled={busy}
                        />
                      ) : null}
                    </View>

                    <View style={styles.attendeesList}>
                      {plan.attendees.map((attendeeId: string) => (
                        <View key={attendeeId} style={styles.attendeeRow}>
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color="#374151"
                          />
                          <Text style={styles.attendeeText}>
                            {getUserFromId(attendeeId)?.name ?? "Ukjent bruker"}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.actions}>
                      <Button
                        title={busy ? "Sender..." : "Keen?"}
                        onPress={() => void onJoin(plan._id)}
                        disabled={busy || attending}
                      />
                      <Button
                        title={busy ? "Sender..." : "Ukeen?"}
                        variant="secondary"
                        onPress={() => void onLeave(plan._id)}
                        disabled={busy || !attending}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  message: {
    color: "#374151",
    fontSize: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  cardHeaderPressed: {
    opacity: 0.9,
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
  expanded: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
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
