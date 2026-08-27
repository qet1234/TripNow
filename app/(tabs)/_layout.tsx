import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/src/theme";

const icon = (symbol: string) =>
  function TabIcon({ color }: { color: string }) {
    return <Text style={{ color, fontSize: 18 }}>{symbol}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "지금", tabBarIcon: icon("◉") }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: "찾기", tabBarIcon: icon("⌕") }}
      />
      <Tabs.Screen
        name="move"
        options={{ title: "이동", tabBarIcon: icon("➜") }}
      />
      <Tabs.Screen
        name="safety"
        options={{ title: "안심", tabBarIcon: icon("♢") }}
      />
      <Tabs.Screen
        name="travel"
        options={{ title: "여행", tabBarIcon: icon("✈") }}
      />
    </Tabs>
  );
}
