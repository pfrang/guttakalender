import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { SignOutButton } from "@/lib/components/SignOut";
import { FontTest } from "@/src/components/Fonts";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const user = useQuery(api.users.getCurrentUser);
  const headerHeight = useHeaderHeight();
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
    <View style={[styles.container, { paddingTop: headerHeight + 12 }]}>
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
      <FontTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    gap: 10,
    backgroundColor: "#C0C0C0",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "#000080",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorText: {
    color: "#CC0000",
    fontSize: 11,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  form: {
    gap: 8,
    backgroundColor: "#D4D0C8",
    padding: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
});
