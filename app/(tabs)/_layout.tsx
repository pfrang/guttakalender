import { CalendarIcon } from "@/lib/icons/Calendar";
import { ChatBubbleIcon } from "@/lib/icons/ChatBubble";
import { SettingsIcon } from "@/lib/icons/Settings";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#ffffff" },
        tabBarActiveTintColor: "#ffd33d",
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: "#25292e",
          height: "auto",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Guttachat",
          tabBarIcon: ({ color, focused }) => <ChatBubbleIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Planer",
          tabBarIcon: ({ color, focused }) => <CalendarIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Instillinger",
          tabBarIcon: ({ color, focused }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
