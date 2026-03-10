import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { Text } from "@/lib/components/Text";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function AddGroup() {
  const [groupName, setGroupName] = useState("");
  const addGroup = useMutation(api.groups.addGroup);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!groupName) {
      setError("Gruppenavnet er påkrevd");
      return;
    }

    setError(null);
    try {
      await addGroup({ name: groupName });
    } catch (error) {
      setError("Kunne ikke legge til gruppe");
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Input label="Gruppenavn" value={groupName} onChangeText={setGroupName} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Legg til gruppe" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
