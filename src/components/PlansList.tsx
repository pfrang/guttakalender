import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Text } from "@/lib/components/Text";
import { formatDateAndTime } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
  plans: Doc<"plans">[];
  fromRoot?: boolean;
}
export function PlansList({ plans, fromRoot }: Props) {
  const user = useQuery(api.users.getCurrentUser);

  function isAttending(attendees: string[]) {
    return attendees.some((attendee) => attendee === user?._id);
  }

  return (
    <View style={styles.list}>
      {plans.map((plan: Doc<"plans">) => {
        const attending = isAttending(plan.attendees);

        return (
          <Pressable
            key={plan._id}
            onPress={() => {
              if (fromRoot) {
                router.push({
                  pathname: "/plans/[id]",
                  params: {
                    id: plan._id as Id<"plans">,
                  },
                });
              } else {
                router.push({
                  pathname: "/group/[id]/plans/[planId]",
                  params: {
                    id: plan.groupId as Id<"groups">,
                    planId: plan._id as Id<"plans">,
                  },
                });
              }
            }}
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.card, attending && styles.cardAttending]}>
              <View style={styles.accentBar} />
              <View style={styles.cardInner}>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#000080" />
                  <Text style={styles.location} numberOfLines={2}>
                    {plan.location}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.dateChip}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#000080"
                    />
                    <Text style={styles.dateText}>
                      {formatDateAndTime(plan.date, "no", "medium", true)}
                    </Text>
                  </View>
                </View>
                <View style={styles.footer}>
                  {user && attending ? (
                    <View style={styles.attendingBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color="#006600"
                      />
                      <Text style={styles.attendingText}>Du er meldt på</Text>
                    </View>
                  ) : (
                    <Text style={styles.tapHint}>Trykk for detaljer</Text>
                  )}
                  <Ionicons name="chevron-forward" size={12} color="#808080" />
                </View>
              </View>
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
    gap: 8,
  },
  cardWrapper: {
    borderRadius: 0,
  },
  cardPressed: {
    opacity: 0.9,
  },
  card: {
    flexDirection: "row",
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
    overflow: "hidden",
  },
  cardAttending: {
    backgroundColor: "#C8D8C8",
  },
  accentBar: {
    width: 4,
    backgroundColor: "#000080",
  },
  cardInner: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 10,
    gap: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#C0C0C0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#808080",
  },
  attendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#006600",
  },
  tapHint: {
    fontSize: 11,
    fontWeight: "400",
    color: "#808080",
  },
});
