import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const webStorage: TokenStorage = {
  getItem: (key) =>
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
  setItem: (key, value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};

const nativeStorage: TokenStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const tokenStorage = Platform.OS === "web" ? webStorage : nativeStorage;

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={tokenStorage}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Unauthenticated>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SignInForm />
            </View>
          </Unauthenticated>
          <Authenticated>
            <Stack
              screenOptions={{
                headerShown: true,
                title: "Guttakalender",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerTitleStyle: {
                  color: "#fff",
                },
                headerTintColor: "#fff",
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  contentStyle: { backgroundColor: "#ffffff" },
                  headerShown: true,
                  title: "Planer",
                }}
              />
            </Stack>
          </Authenticated>
        </SafeAreaView>
      </SafeAreaProvider>
    </ConvexAuthProvider>
  );
}
