import { api } from "@/convex/_generated/api";
import { PlusIcon } from "@/lib/icons/Plus";
import { useQuery } from "convex/react";
import { Link } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PlansList } from "../components/PlansList";

export default function Plans() {
  const plans = useQuery(api.plans.getPlans);
  const allUsers = useQuery(api.users.getUsers);
  const user = useQuery(api.users.getCurrentUser);

  //   const plansAfterToday = useMemo(() => {
  //     return (plans ?? []).filter(
  //       (plan: any) => new Date(endOfDay(plan.date)) >= new Date(),
  //     );
  //   }, [plans]);

  const plansAfterToday = plans ?? [];

  const hasPlans = plansAfterToday.length > 0;
  const nativeTabBarHeight = Platform.select({
    ios: 49,
    android: 56,
    default: 0,
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Guttas kommende planer</Text>
        {plans === undefined || allUsers === undefined || user === undefined ? (
          <Text style={styles.message}>Laster planer...</Text>
        ) : !hasPlans ? (
          <Text style={styles.message}>Ingen planer lagt til enda</Text>
        ) : (
          <PlansList plans={plansAfterToday} />
        )}
      </ScrollView>
      <View
        style={[
          styles.fabContainer,
          { paddingBottom: nativeTabBarHeight + 20 },
        ]}
      >
        <Link href="/modal" asChild>
          <Pressable style={styles.fabButton}>
            <PlusIcon color="#ffffff" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
    paddingBottom: 96,
  },
  fabContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
  },
  fabButton: {
    backgroundColor: "grey",
    padding: 12,
    borderRadius: 28,
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
