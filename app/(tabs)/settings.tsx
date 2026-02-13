import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { SignOutButton } from "@/lib/components/SignOut";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const user = useQuery(api.users.getCurrentUser);
  const [editMode, setEditMode] = useState(false);
  const changeUserName = useMutation(api.users.mutateUser);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof user?.name === "string") {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setIsSaving(true);
    try {
      await changeUserName({ name: trimmed });
      setEditMode(false);
    } catch (error) {
      setError("Feil ved endring av brukernavn");
    } finally {
      setIsSaving(false);
    }
  };

  const isNameTheSame = name.trim() === user?.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.form}>
        {editMode ? (
          <>
            <Text style={styles.label}>Endre Brukernavn</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Brukernavn"
              autoCorrect={false}
              editable={!isSaving}
              onSubmitEditing={handleSubmit}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                title="Avbryt"
                onPress={() => setEditMode(false)}
                disabled={isSaving}
              />
              <Button
                title={isSaving ? "Lagrer..." : "Lagre"}
                onPress={handleSubmit}
                disabled={isSaving || name.trim().length === 0 || isNameTheSame}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Brukernavn</Text>
            <Text>{name}</Text>
            <Button
              disabled={isSaving}
              title="Endre"
              onPress={() => setEditMode(true)}
            />
          </>
        )}
      </View>
      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  form: {
    gap: 12,
  },
});
