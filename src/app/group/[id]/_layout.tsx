import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function GroupLayout() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const groupId = typeof params.id === "string" ? params.id : params.id?.[0];

  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: group?.name ?? "",
    });
  }, [navigation, group?.name]);

  return (
    <Authenticated>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="plans/[planId]"
          options={{
            headerShown: false,
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
            headerBackButtonDisplayMode: "minimal",
            animation: "slide_from_bottom",
            presentation: "modal",
          }}
        />
      </Stack>
    </Authenticated>
  );
}
