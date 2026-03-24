import { api } from "@/convex/_generated/api";
import PlansList from "@/src/components/PlansList";
import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Plans() {
  const plans = useQuery(api.plans.getPlansForCurrentUser);

  const plansAfterToday = plans ?? [];

  const isLoading = plans === undefined;
  const hasPlans = plansAfterToday.length > 0;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {hasPlans ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Dine kommende planer
          </Text>
          <PlansList plans={plansAfterToday} fromRoot />
        </ScrollView>
      ) : (
        <Text>Ingen planer lagt til enda</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    gap: 12,
    paddingBottom: 96,
  },
});
