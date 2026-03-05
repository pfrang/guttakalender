import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Authenticated, useQuery } from "convex/react";
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GroupLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const groupId = typeof params.id === "string" ? params.id : params.id?.[0];

  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  return (
    <Authenticated>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            title: group?.name ?? "",
            headerLeft: () => (
              <Pressable
                onPress={() => router.dismissAll()}
                hitSlop={10}
                style={({ pressed }) => ({
                  paddingLeft: Platform.OS === "ios" ? 8 : 16,
                  paddingRight: 12,
                  paddingVertical: 10,
                  marginLeft:
                    Platform.OS === "ios" ? Math.max(insets.left - 8, 0) : 0,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={28} color="#25292e" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="plans/[planId]"
          options={{
            headerShown: true,
            title: "Plan",
            headerTintColor: "#25292e",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          name="AddPlan"
          options={{
            title: "Legg til plan",
            headerTintColor: "#25292e",
            animation: "slide_from_bottom",
            presentation: "modal",
          }}
        />
      </Stack>
    </Authenticated>
  );
}
