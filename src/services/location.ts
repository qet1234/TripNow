import * as Location from "expo-location";

export type JapanPresenceResult =
  | "japan"
  | "outside-japan"
  | "permission-denied"
  | "unavailable";

type GeoBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

// Coarse Japan-only land-area boxes used only inside the device.
// They intentionally avoid returning or persisting the coordinates.
const JAPAN_GEO_BOXES: GeoBox[] = [
  // Hokkaido
  { minLat: 41.2, maxLat: 45.7, minLng: 139.3, maxLng: 145.9 },
  // Honshu / Shikoku
  { minLat: 32.7, maxLat: 41.6, minLng: 130.5, maxLng: 142.2 },
  // Kyushu
  { minLat: 30.8, maxLat: 34.2, minLng: 129.5, maxLng: 132.3 },
  // Okinawa / Ryukyu
  { minLat: 24.0, maxLat: 30.9, minLng: 122.8, maxLng: 131.5 },
  // Ogasawara
  { minLat: 20.0, maxLat: 28.0, minLng: 136.0, maxLng: 154.0 },
];

function isInsideJapan(latitude: number, longitude: number) {
  return JAPAN_GEO_BOXES.some(
    (box) =>
      latitude >= box.minLat &&
      latitude <= box.maxLat &&
      longitude >= box.minLng &&
      longitude <= box.maxLng,
  );
}

/**
 * Requests foreground location only when the user asks to confirm arrival.
 *
 * Privacy contract:
 * - coordinates never leave this function
 * - coordinates are not persisted
 * - coordinates are not logged
 * - no Supabase/API request is made here
 * - only a coarse Japan / outside-Japan result is returned
 */
export async function checkJapanPresenceLocally(): Promise<JapanPresenceResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      return "permission-denied";
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    return isInsideJapan(
      location.coords.latitude,
      location.coords.longitude,
    )
      ? "japan"
      : "outside-japan";
  } catch {
    return "unavailable";
  }
}
