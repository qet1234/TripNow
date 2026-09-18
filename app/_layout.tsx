import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { ScheduleProvider } from "@/src/context/ScheduleContext";
import { AirportProvider } from "@/src/context/AirportContext";
import { TravelModeProvider } from "@/src/context/TravelModeContext";
import { SavedPlacesProvider } from "@/src/context/SavedPlacesContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TravelModeProvider>
      <SavedPlacesProvider>
        <ScheduleProvider>
          <AirportProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="airport" options={{ presentation: "card" }} />
              <Stack.Screen name="hotel" options={{ presentation: "card" }} />
              <Stack.Screen name="schedule-edit" options={{ presentation: "modal" }} />
            </Stack>
          </AirportProvider>
        </ScheduleProvider>
      </SavedPlacesProvider>
    </TravelModeProvider>
  );
}
