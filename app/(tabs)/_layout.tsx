import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { colors } from "@/src/theme";
import { getHomeRegion } from "@/src/data/homeRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const tabIcon = (activeName: IconName, inactiveName: IconName, accent: string, activeColor: string, activeSoft: string) =>
  function TabIcon({ focused }: { focused: boolean; color: ColorValue; size: number }) {
    return (
      <View style={[styles.iconWrap, focused && { backgroundColor: activeSoft }]}>
        <MaterialCommunityIcons
          name={focused ? activeName : inactiveName}
          size={focused ? 25 : 24}
          color={focused ? activeColor : accent}
        />
      </View>
    );
  };

export default function TabsLayout() {
  const { selectedRegionId } = useTravelMode();
  const regionTheme = getHomeRegion(selectedRegionId);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: regionTheme.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 70,
          width: "100%",
          maxWidth: 560,
          alignSelf: "center",
          paddingBottom: 9,
          paddingTop: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈", tabBarIcon: tabIcon("home-variant", "home-variant-outline", "#69717D", regionTheme.accent, regionTheme.soft) }} />
      <Tabs.Screen name="explore" options={{ title: "탐색", tabBarIcon: tabIcon("compass", "compass-outline", "#2F6FED", regionTheme.accent, regionTheme.soft) }} />
      <Tabs.Screen name="schedule" options={{ title: "일정", tabBarIcon: tabIcon("calendar-check", "calendar-check-outline", "#8B3FD6", regionTheme.accent, regionTheme.soft) }} />
      <Tabs.Screen name="move" options={{ title: "교통", tabBarIcon: tabIcon("train", "train", "#0A9C9C", regionTheme.accent, regionTheme.soft) }} />
      <Tabs.Screen name="profile" options={{ title: "마이", tabBarIcon: tabIcon("account-circle", "account-circle-outline", "#8A8178", regionTheme.accent, regionTheme.soft) }} />
      <Tabs.Screen name="safety" options={{ href: null }} />
      <Tabs.Screen name="travel" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
