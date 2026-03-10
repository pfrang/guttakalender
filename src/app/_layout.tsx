import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { HeaderBackButton } from "@react-navigation/elements";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { UI } from "../components/ui";

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

  const segments = useSegments() as string[];
  const isOnPlanScreen = segments.includes("[planId]");
  const router = useRouter();

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
            backgroundColor: UI.colors.background,
          }}
          behavior="padding"
        >
          <SignInForm />
        </KeyboardAvoidingView>
      </Unauthenticated>
      <Authenticated>
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: "minimal",
            headerTransparent: true,
            // headerBlurEffect: "prominent", // iOS only
            headerTintColor: UI.colors.primary,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Dine grupper",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Instillinger",
            }}
          />
          <Stack.Screen
            name="AddGroup"
            options={{
              title: "Legg til gruppe",
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="JoinGroup"
            options={{
              title: "Bli med i gruppe",
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="group/[id]"
            options={{
              headerShown: true,
              title: isOnPlanScreen ? "Plan" : "",
              headerTransparent: true,
              headerTintColor: UI.colors.primary,
              headerLeft: isOnPlanScreen
                ? (props) => (
                    <HeaderBackButton
                      {...props}
                      label=""
                      onPress={() => router.back()}
                    />
                  )
                : undefined,
            }}
          />
        </Stack>
      </Authenticated>
    </ConvexAuthProvider>
  );
}
