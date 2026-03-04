import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

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
      <StatusBar style="auto" />
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
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Dine grupper",
              headerShown: true,
              headerTintColor: "#25292e",
            }}
          />
          <Stack.Screen
            name="AddGroup"
            options={{
              title: "Legg til gruppe",
              headerTintColor: "#25292e",
              animation: "slide_from_bottom",
              presentation: "formSheet",
              sheetAllowedDetents: [0.9],
              sheetInitialDetentIndex: 0,
            }}
          />
          <Stack.Screen
            name="group/[id]"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </Authenticated>
    </ConvexAuthProvider>
  );
}
