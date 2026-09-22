import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme";
import { getHomeRegion } from "@/src/data/homeRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { useResponsiveLayout } from "@/src/hooks/useResponsiveLayout";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const tabIcon = (
  activeName: IconName,
  inactiveName: IconName,
  accent: string,
  activeColor: string,
  activeSoft: string,
  iconSize: number,
  iconWrapSize: number,
) =>
  function TabIcon({ focused }: { focused: boolean; color: ColorValue; size: number }) {
    return (
      <View
        style={[
          styles.iconWrap,
          { borderRadius: iconWrapSize / 2, height: iconWrapSize, width: iconWrapSize },
          focused && { backgroundColor: activeSoft },
        ]}
      >
        <MaterialCommunityIcons
          name={focused ? activeName : inactiveName}
          size={focused ? iconSize + 1 : iconSize}
          color={focused ? activeColor : accent}
        />
      </View>
    );
  };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { selectedRegionId } = useTravelMode();
  const { contentMaxWidth, isCompactWidth, isLargeScreen } = useResponsiveLayout();
  const regionTheme = getHomeRegion(selectedRegionId);
  const bottomPadding = Math.max(insets.bottom, isCompactWidth ? 6 : 9);
  const iconSize = isCompactWidth ? 22 : isLargeScreen ? 27 : 24;
  const iconWrapSize = isCompactWidth ? 32 : isLargeScreen ? 38 : 34;
  const tabContentHeight = isCompactWidth ? 58 : isLargeScreen ? 66 : 61;
  const makeTabIcon = (activeName: IconName, inactiveName: IconName, inactiveColor: string) =>
    tabIcon(
      activeName,
      inactiveName,
      inactiveColor,
      regionTheme.accent,
      regionTheme.soft,
      iconSize,
      iconWrapSize,
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: regionTheme.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: tabContentHeight + bottomPadding,
          width: "100%",
          maxWidth: contentMaxWidth,
          alignSelf: "center",
          paddingBottom: bottomPadding,
          paddingTop: isCompactWidth ? 6 : 8,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarItemStyle: { minWidth: 56 },
        tabBarLabelStyle: {
          fontSize: isCompactWidth ? 10 : isLargeScreen ? 12 : 11,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈", tabBarIcon: makeTabIcon("home-variant", "home-variant-outline", "#69717D") }} />
      <Tabs.Screen name="explore" options={{ title: "탐색", tabBarIcon: makeTabIcon("compass", "compass-outline", "#2F6FED") }} />
      <Tabs.Screen name="schedule" options={{ title: "일정", tabBarIcon: makeTabIcon("calendar-check", "calendar-check-outline", "#8B3FD6") }} />
      <Tabs.Screen name="move" options={{ title: "공항 안내", tabBarIcon: makeTabIcon("airplane", "airplane", "#0A9C9C") }} />
      <Tabs.Screen name="profile" options={{ title: "마이", tabBarIcon: makeTabIcon("account-circle", "account-circle-outline", "#8A8178") }} />
      <Tabs.Screen name="safety" options={{ href: null }} />
      <Tabs.Screen name="travel" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
