import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { TravelModeProvider } from "@/src/context/TravelModeContext";

export default function RootLayout() {
  return (
    <TravelModeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TravelModeProvider>
  );
}
