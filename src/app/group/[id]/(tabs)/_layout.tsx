import { CalendarIcon } from "@/lib/icons/Calendar";
import { ChatBubbleIcon } from "@/lib/icons/ChatBubble";
import { isMobile } from "@/lib/utils/isMobile";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/build/native-tabs";

export default function TabLayout() {
  return isMobile() ? <MobileLayout /> : <DesktopLayout />;
}

function MobileLayout() {
  return (
    <NativeTabs backgroundColor={"#25292e"}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Hjem</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"house"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"message"} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plans">
        <NativeTabs.Trigger.Label>Planer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"calendar"} />
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Instillinger</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"gearshape"} />
      </NativeTabs.Trigger> */}
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
