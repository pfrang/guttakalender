import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@react-navigation/elements";
import { Authenticated, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function GroupLayout() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const groupId = typeof params.id === "string" ? params.id : params.id?.[0];

  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  const headerTitle = group?.name ?? "";

  useEffect(() => {
    navigation.setOptions({
      headerTitle: headerTitle,
    });
  }, [navigation, headerTitle]);

  return (
    <Authenticated>
      <Stack
        screenOptions={{
          headerShown: false,
          headerTransparent: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AddPlan"
          options={{
            headerShown: true,
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
