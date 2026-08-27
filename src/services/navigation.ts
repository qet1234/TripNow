import { Linking } from "react-native";

export async function openGoogleMapsDirections(destination: string) {
  const url =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destination);

  await Linking.openURL(url);
}
