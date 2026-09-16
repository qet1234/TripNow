import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { ScheduleProvider } from "@/src/context/ScheduleContext";
import { TravelModeProvider } from "@/src/context/TravelModeContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TravelModeProvider>
      <ScheduleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="schedule-edit" options={{ presentation: "modal" }} />
        </Stack>
      </ScheduleProvider>
    </TravelModeProvider>
  );
}
