import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Datepicker } from "@/lib/components/Datepicker";
import { Input } from "@/lib/components/Input";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Modal() {
  const user = useQuery(api.users.getCurrentUser);
  const addPlan = useMutation(api.plans.addPlan);

  const [location, setLocation] = useState("");
  const [plan, setPlan] = useState("");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?._id) {
      setError("Du ma vere logget inn for a legge til plan.");
      return;
    }

    const trimmedLocation = location.trim();
    const trimmedPlan = plan.trim();
    if (!trimmedLocation || !trimmedPlan) {
      setError("Fyll ut bade sted og plan.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await addPlan({
        location: trimmedLocation,
        date: date.toISOString(),
        plan: trimmedPlan,
        userId: user._id,
        attendees: [user._id],
      });

      setLocation("");
      setPlan("");
      setDate(new Date());
      router.back();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Kunne ikke lagre plan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Hvor skjer det?"
        placeholder="Hvor"
        value={location}
        onChangeText={setLocation}
        editable={!isSubmitting}
      />

      <Input
        label="Hva skjer?"
        placeholder="Plan"
        value={plan}
        onChangeText={setPlan}
        editable={!isSubmitting}
        multiline
        style={styles.textArea}
      />

      <Datepicker
        label="Nar skjer det?"
        value={date}
        onChange={setDate}
        disabled={isSubmitting}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button
          title={isSubmitting ? "Lagrer..." : "Add Plan"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
        <Button
          title="Avbryt"
          variant="secondary"
          onPress={() => router.back()}
          disabled={isSubmitting}
        />
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
    gap: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
});
