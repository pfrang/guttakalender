import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Authenticated, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";

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

export default function GroupLayout() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const navigation = useNavigation();

  const group = useQuery(
    api.groups.getGroupById,
    groupId ? { id: groupId as Id<"groups"> } : "skip",
  );

  useEffect(() => {
    navigation.setOptions({
      title: group?.name ?? "",
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
          }}
        />
        <Stack.Screen
          name="AddPlan"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
            presentation: "formSheet",
            sheetAllowedDetents: [0.9],
            sheetInitialDetentIndex: 0,
          }}
        />
        {/* <Stack.Screen
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
          /> */}
        {/* <Stack.Screen
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
          /> */}
        {/* <Stack.Screen
            name="group/[id]"
            options={{
              title: "Gruppe [id]",
              headerStyle: {
                backgroundColor: "#25292e",
              },
              headerTintColor: "#ffffff",
              contentStyle: { backgroundColor: "#ffffff" },
            }}
          /> */}
      </Stack>
    </Authenticated>
  );
}
