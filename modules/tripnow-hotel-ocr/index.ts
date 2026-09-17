import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

export type HotelOcrNativeResult = {
  text: string;
  lineCount: number;
};

type TripNowHotelOcrNativeModule = {
  recognizeImage(uri: string): Promise<HotelOcrNativeResult>;
};

const nativeModule = requireOptionalNativeModule<TripNowHotelOcrNativeModule>(
  "TripNowHotelOcr",
);

export function isHotelOcrAvailable() {
  return Platform.OS === "android" && nativeModule != null;
}

export async function recognizeHotelImage(uri: string) {
  if (!nativeModule) {
    throw new Error("호텔 OCR는 Android 설치 앱에서만 사용할 수 있습니다.");
  }

  return nativeModule.recognizeImage(uri);
}
