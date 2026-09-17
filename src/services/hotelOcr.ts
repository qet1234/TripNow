import { Platform } from "react-native";
import { File } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import {
  isHotelOcrAvailable,
  recognizeHotelImage,
} from "@/modules/tripnow-hotel-ocr";

const HOTEL_STORAGE_KEY = "tripnow.hotel.confirmed.v1";
const MAX_FIELD_LENGTH = 160;

export type HotelDraft = {
  hotelName: string;
  address: string;
  checkIn: string;
  checkOut: string;
};

export type StoredHotel = HotelDraft & {
  updatedAt: string;
};

const emptyDraft: HotelDraft = {
  hotelName: "",
  address: "",
  checkIn: "",
  checkOut: "",
};

const sensitiveLabel =
  /(?:투숙객|예약자|성명|고객명|guest\s*name|customer|예약\s*번호|booking\s*(?:id|no|number)|confirmation\s*(?:id|no|number)|email|e-mail|메일|전화|phone|tel)/i;

const hotelKeyword =
  /(?:호텔|hotel|ホテル|旅館|ryokan|resort|리조트|inn|hostel|호스텔)/i;

const normalizeLine = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, MAX_FIELD_LENGTH);

const valueAfterLabel = (line: string, label: RegExp) =>
  normalizeLine(line.replace(label, "").replace(/^\s*[:：\-]\s*/, ""));

function findLabeledLine(lines: string[], label: RegExp) {
  const index = lines.findIndex((line) => label.test(line));
  if (index < 0) return "";

  const sameLine = valueAfterLabel(lines[index], label);
  if (sameLine && !sensitiveLabel.test(sameLine)) return sameLine;

  const nextLine = lines[index + 1] ?? "";
  return sensitiveLabel.test(nextLine) ? "" : normalizeLine(nextLine);
}

function parseHotelText(text: string): HotelDraft {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const labeledHotel = findLabeledLine(
    lines,
    /(?:호텔\s*명|숙소\s*명|hotel\s*name|property\s*name|施設名|宿泊施設)\s*/i,
  );
  const hotelName =
    labeledHotel ||
    lines.find(
      (line) =>
        hotelKeyword.test(line) &&
        !sensitiveLabel.test(line) &&
        !/(?:예약|booking|confirmation|check\s*-?\s*(?:in|out))/i.test(line),
    ) ||
    "";

  const labeledAddress = findLabeledLine(
    lines,
    /(?:주소|address|住所|所在地)\s*/i,
  );
  const address =
    labeledAddress ||
    lines.find(
      (line) =>
        !sensitiveLabel.test(line) &&
        (/(?:〒?\s*\d{3}-?\d{4})/.test(line) ||
          /(?:東京都|北海道|大阪府|京都府|.{2,4}県)/.test(line)),
    ) ||
    "";

  return {
    hotelName: normalizeLine(hotelName),
    address: normalizeLine(address),
    checkIn: findLabeledLine(lines, /(?:체크\s*인|check\s*-?\s*in|チェックイン)\s*/i),
    checkOut: findLabeledLine(lines, /(?:체크\s*아웃|check\s*-?\s*out|チェックアウト)\s*/i),
  };
}

function sanitizeDraft(value: HotelDraft): HotelDraft {
  return {
    hotelName: normalizeLine(value.hotelName),
    address: normalizeLine(value.address),
    checkIn: normalizeLine(value.checkIn),
    checkOut: normalizeLine(value.checkOut),
  };
}

export function canUseHotelOcr() {
  return Platform.OS === "android" && isHotelOcrAvailable();
}

export async function scanHotelConfirmation(): Promise<HotelDraft | null> {
  if (!canUseHotelOcr()) {
    throw new Error("호텔 OCR는 Android 설치 앱에서만 사용할 수 있습니다.");
  }

  const selection = await File.pickFileAsync({
    mimeTypes: ["image/*"],
    multipleFiles: false,
  });

  if (selection.canceled || !selection.result) return null;

  let rawText = "";
  try {
    const result = await recognizeHotelImage(selection.result.uri);
    rawText = result.text;
    return parseHotelText(rawText);
  } finally {
    // OCR 전문은 저장하거나 로그로 남기지 않고 파싱 직후 참조를 제거합니다.
    rawText = "";
  }
}

export async function loadStoredHotel(): Promise<StoredHotel | null> {
  if (Platform.OS !== "android") return null;

  const stored = await SecureStore.getItemAsync(HOTEL_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<StoredHotel>;
    if (!parsed.hotelName && !parsed.address) return null;

    return {
      ...emptyDraft,
      ...sanitizeDraft({
        hotelName: parsed.hotelName ?? "",
        address: parsed.address ?? "",
        checkIn: parsed.checkIn ?? "",
        checkOut: parsed.checkOut ?? "",
      }),
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    await SecureStore.deleteItemAsync(HOTEL_STORAGE_KEY);
    return null;
  }
}

export async function saveStoredHotel(value: HotelDraft): Promise<StoredHotel> {
  if (Platform.OS !== "android") {
    throw new Error("호텔 정보 보안 저장은 Android 설치 앱에서만 지원합니다.");
  }

  const stored: StoredHotel = {
    ...sanitizeDraft(value),
    updatedAt: new Date().toISOString(),
  };

  await SecureStore.setItemAsync(HOTEL_STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export async function deleteStoredHotel() {
  if (Platform.OS !== "android") return;
  await SecureStore.deleteItemAsync(HOTEL_STORAGE_KEY);
}

export { emptyDraft };
