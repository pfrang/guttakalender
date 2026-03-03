import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SignInForm } from "@/lib/components/SignInForm";
import { ConvexAuthProvider, type TokenStorage } from "@convex-dev/auth/react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Stack, useGlobalSearchParams } from "expo-router";
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

  function getGroupTitle(
    route: Parameters<typeof getFocusedRouteNameFromRoute>[0],
  ) {
    const focusedRoute = getFocusedRouteNameFromRoute(route) ?? "index";
    return focusedRoute;
  }

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
              name="index"
              options={{
                title: "Dine grupper",
                headerShown: true,
                headerTintColor: "#ffffff",
                headerTitleAlign: "center",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
              }}
            />
            <GroupRoute />
          </Stack>
        </SafeAreaView>
      </Authenticated>
    </ConvexAuthProvider>
  );
}

function GroupRoute() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;

  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  return (
    <Stack.Screen
      name="group/[id]"
      options={{
        title: group?.name ?? "",
        headerShown: true,
        headerTintColor: "#ffffff",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#25292e",
        },
      }}
    />
  );
}
