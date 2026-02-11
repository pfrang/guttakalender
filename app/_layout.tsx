import { SignInForm } from "@/lib/components/SignInForm";
import { Text } from "@/lib/components/Text";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { Slot } from "expo-router";
import { View } from "react-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Guttakalender
          </Text>
        </View>
        <Unauthenticated>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <SignInForm />
          </View>
        </Unauthenticated>
        <Authenticated>
          <Slot />
        </Authenticated>
      </View>
    </ConvexAuthProvider>
  );
}
