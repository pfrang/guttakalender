import { CalendarIcon } from "@/lib/icons/Calendar";
import { ChatBubbleIcon } from "@/lib/icons/ChatBubble";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";

export default function TabLayout() {
  return <MobileLayout />;
}

function MobileLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Oversikt</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"list.bullet"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"message"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"person"} />
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
          title: "Hjem",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
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
    </Tabs>
  );
}
