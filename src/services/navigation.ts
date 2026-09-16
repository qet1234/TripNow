import { Linking } from "react-native";

export type GoogleMapsTravelMode = "driving" | "walking" | "bicycling" | "transit";

type DirectionsOptions = {
  origin?: string;
  travelMode?: GoogleMapsTravelMode;
};

export async function openGoogleMapsDirections(
  destination: string,
  options: DirectionsOptions = {},
) {
  const params = [
    "api=1",
    `destination=${encodeURIComponent(destination)}`,
  ];

  if (options.origin?.trim()) {
    params.push(`origin=${encodeURIComponent(options.origin.trim())}`);
  }
  if (options.travelMode) {
    params.push(`travelmode=${options.travelMode}`);
  }

  await Linking.openURL(`https://www.google.com/maps/dir/?${params.join("&")}`);
}

export async function openGoogleMapsSearch(query: string) {
  const url =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query);

  await Linking.openURL(url);
}
