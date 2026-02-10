import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("password", {
        flow,
        name: name.trim(),
        password,
      });
    } catch {
      const errorMsg =
        flow === "signIn"
          ? "Feil brukernavn eller passord, eller kontoen finnes ikke."
          : "Konto kunne ikke opprettes.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Du ma logge inn for a se gattakalenderen
      </Text>

      <View style={styles.form}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Brukernavn"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Passord"
          secureTextEntry
          autoCorrect={false}
          editable={!isSubmitting}
          onSubmitEditing={handleSubmit}
        />

        <Button
          title={
            isSubmitting
              ? "Sender..."
              : flow === "signIn"
                ? "Logg inn"
                : "Mekk en konto"
          }
          onPress={handleSubmit}
          disabled={isSubmitting || name.trim().length === 0 || password.length === 0}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {flow === "signIn" ? "Har du ikke konto?" : "Har du konto?"}
          </Text>
          <Pressable
            onPress={() =>
              setFlow((current) => (current === "signIn" ? "signUp" : "signIn"))
            }
          >
            <Text style={styles.switchAction}>
              {flow === "signIn" ? "Registrer ny konto" : "Logg inn"}
            </Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}

export const SignIn = SignInForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 20,
  },
  introText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchText: {
    color: "#374151",
    fontSize: 14,
  },
  switchAction: {
    color: "#3730A3",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  errorText: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
});
