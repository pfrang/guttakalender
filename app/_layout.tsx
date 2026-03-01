import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

function getTabsTitle(
  route: Parameters<typeof getFocusedRouteNameFromRoute>[0],
) {
  const focusedRoute = getFocusedRouteNameFromRoute(route) ?? "index";

  switch (focusedRoute) {
    case "plans":
      return "Planer";
    case "settings":
      return "Instillinger";
    case "index":
    default:
      return "Guttachat";
  }
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }

    const configureNotifications = async () => {
      const Notifications = await import("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    void configureNotifications();
  }, []);

  return (
    <ConvexAuthProvider client={convex} storage={tokenStorage}>
      <Unauthenticated>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#ffffff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
          behavior="padding"
        >
          <SignInForm />
        </KeyboardAvoidingView>
      </Unauthenticated>
      <Authenticated>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={({ route }) => ({
                headerBackVisible: true,
                headerTintColor: "#fff",
                title: getTabsTitle(route),
                headerStyle: {
                  backgroundColor: "#25292e",
                },
              })}
            />
            <Stack.Screen
              name="AddGroup"
              options={{
                animation: "slide_from_bottom",
                presentation: "formSheet",
                sheetAllowedDetents: [0.9],
                sheetInitialDetentIndex: 0,
                title: "Legg til gruppe",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerTintColor: "#ffffff",
                headerBackVisible: false,
                contentStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Stack.Screen
              name="AddPlan"
              options={{
                presentation: "card",
                title: "Legg til plan",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerTintColor: "#ffffff",
                // animation: "slide_from_bottom",
                headerBackVisible: false,
                contentStyle: { backgroundColor: "#25292e" },
              }}
            />
            <Stack.Screen
              name="plan/[id]"
              options={{
                animation: "slide_from_bottom",
                presentation: "formSheet",
                sheetAllowedDetents: [0.9],
                sheetInitialDetentIndex: 0,
                title: "Plan",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerTintColor: "#ffffff",
                contentStyle: { backgroundColor: "#25292e" },
              }}
            />
            <Stack.Screen
              name="[groupId]"
              options={{
                animation: "slide_from_right",
                presentation: "card",
                title: "Gruppe",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerTintColor: "#ffffff",
                contentStyle: { backgroundColor: "#ffffff" },
              }}
            />
          </Stack>
        </SafeAreaView>
      </Authenticated>
    </ConvexAuthProvider>
  );
}
