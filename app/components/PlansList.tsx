import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Text } from "@/lib/components/Text";
import { formatDateAndTime } from "@/lib/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
  plans: Doc<"plans">[];
}
export function PlansList({ plans }: Props) {
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
            onPress={() =>
              router.push({
                pathname: "/[planId]",
                params: { planId: plan._id },
              })
            }
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.card, attending && styles.cardAttending]}>
              <View style={styles.accentBar} />
              <View style={styles.cardInner}>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color="#0F172A" />
                  <Text style={styles.location} numberOfLines={2}>
                    {plan.location}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.dateChip}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#5B6B7A"
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
                        size={14}
                        color="#0D9488"
                      />
                      <Text style={styles.attendingText}>Du er meldt på</Text>
                    </View>
                  ) : (
                    <Text style={styles.tapHint}>Trykk for detaljer</Text>
                  )}
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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
    gap: 16,
  },
  cardWrapper: {
    borderRadius: 18,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  card: {
    flexDirection: "row",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF1",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardAttending: {
    borderColor: "#CCFBF1",
    backgroundColor: "#F0FDFA",
  },
  accentBar: {
    width: 4,
    backgroundColor: "#25292e",
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardInner: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 14,
    gap: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  attendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
  },
  tapHint: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
  },
});
