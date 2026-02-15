import { CalendarIcon } from "@/lib/icons/Calendar";
import { ChatBubbleIcon } from "@/lib/icons/ChatBubble";
import { SettingsIcon } from "@/lib/icons/Settings";
import { isMobile } from "@/lib/utils/isMobile";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return isMobile() ? <MobileLayout /> : <DesktopLayout />;
}

function MobileLayout() {
  return (
    <NativeTabs backgroundColor={"#f0f"}>
      <NativeTabs.Trigger name="index">
        <Label>Chat</Label>
        <Icon sf={"message"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plans">
        <Label>Planer</Label>
        <Icon sf={"calendar"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Instillinger</Label>
        <Icon sf={"gearshape"} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function DesktopLayout() {
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
