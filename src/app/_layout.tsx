import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { HeaderBackButton } from "@react-navigation/elements";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import * as Notifications from "expo-notifications";
import { router, Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { UI } from "../components/ui";

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === "string") {
        router.push(url as any);
      }
    }

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

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

function RootLayoutInner() {
  useNotificationObserver();
  const { isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const segments = useSegments() as string[];
  const isOnPlanScreen = segments.includes("[planId]");
  const router = useRouter();

  return (
    <>
      <StatusBar style="dark" />
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
            headerTintColor: UI.colors.primary,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Dine grupper" }} />
          <Stack.Screen name="settings" options={{ title: "Instillinger" }} />
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
              title: isOnPlanScreen ? "Plan" : "",
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={tokenStorage}>
      <RootLayoutInner />
    </ConvexAuthProvider>
  );
}
