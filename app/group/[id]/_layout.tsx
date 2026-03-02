import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Authenticated } from "convex/react";
import { Stack } from "expo-router";

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
  return (
    <Authenticated>
      <Stack screenOptions={{ contentStyle: { flex: 1 } }}>
        <Stack.Screen
          name="(tabs)"
          options={({ route }) => ({
            headerShown: false,
            headerTintColor: "#fff",
            title: getTabsTitle(route),
            headerStyle: {
              backgroundColor: "#25292e",
            },
            contentStyle: { flex: 1 },
          })}
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
