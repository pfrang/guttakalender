import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function JoinGroup() {
  const [groupCode, setGroupCode] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const joinGroup = useMutation(api.groups.joinGroup);

  const handleJoin = async () => {
    const trimmed = groupCode.trim();
    if (!trimmed) {
      setError("Skriv inn gruppekoden");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await joinGroup({ groupId: trimmed });
      if (response === 404) {
        setError("Gruppe ikke funnet");
        return;
      } else if (response === 409) {
        setError("Du er allerede med i gruppen");
        return;
      }
      setGroupCode("");
      router.dismissAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kunne ikke bli med i gruppen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Gruppekode"
        value={groupCode}
        onChangeText={(text) => {
          setGroupCode(text);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title="Bli med i gruppe"
        onPress={() => void handleJoin()}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  error: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
});
