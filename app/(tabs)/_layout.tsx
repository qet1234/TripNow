import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { colors } from "@/src/theme";

const icon = (symbol: string) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ color, fontSize: 19 }}>{symbol}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 70,
          paddingBottom: 9,
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈", tabBarIcon: icon("⌂") }} />
      <Tabs.Screen name="explore" options={{ title: "탐색", tabBarIcon: icon("⌕") }} />
      <Tabs.Screen name="schedule" options={{ title: "일정", tabBarIcon: icon("▣") }} />
      <Tabs.Screen name="move" options={{ title: "교통", tabBarIcon: icon("▤") }} />
      <Tabs.Screen name="profile" options={{ title: "마이", tabBarIcon: icon("♙") }} />
      <Tabs.Screen name="safety" options={{ href: null }} />
      <Tabs.Screen name="travel" options={{ href: null }} />
    </Tabs>
  );
}
