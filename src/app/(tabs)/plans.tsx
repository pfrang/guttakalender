import { api } from "@/convex/_generated/api";
import { PlansListId } from "@/src/components/PlansListId";
import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Plans() {
  const plans = useQuery(api.plans.getPlansForCurrentUser);

  const plansAfterToday = plans ?? [];

  const isLoading = plans === undefined;

  if (plansAfterToday.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Ingen planer lagt til enda</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <PlansListId plans={plansAfterToday} />
      </ScrollView>
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
