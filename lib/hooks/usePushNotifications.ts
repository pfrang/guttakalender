import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Constants from "expo-constants";
import { useEffect } from "react";
import { Platform } from "react-native";

export function usePushNotifications() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const savePushToken = useMutation(api.users.savePushToken);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") return;
    if (!currentUser?._id) return;

    const register = async () => {
      try {
        const Notifications = await import("expo-notifications");

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FFD33D",
          });
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const permission = await Notifications.requestPermissionsAsync();
          finalStatus = permission.status;
        }

        if (finalStatus !== "granted") return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId) return;

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        await savePushToken({
          token: tokenResult.data,
          platform: Platform.OS as "ios" | "android",
        });
      } catch {
        // Token registration can fail on unsupported devices/simulators.
      }
    };

    void register();
  }, [currentUser?._id, savePushToken]);
}
