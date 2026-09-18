import { Platform } from "react-native";
import { File as ExpoFile } from "expo-file-system";
import {
  isHotelOcrAvailable,
  recognizeHotelImage,
} from "@/modules/tripnow-hotel-ocr";
import type { AirportFlightPlan } from "@/src/context/AirportContext";

type FlightFields = Pick<
  AirportFlightPlan,
  | "outboundDate"
  | "outboundTime"
  | "outboundFlight"
  | "outboundTerminal"
  | "outboundDestination"
  | "returnDate"
  | "returnTime"
  | "returnFlight"
  | "returnTerminal"
  | "returnOrigin"
>;

export type FlightOcrDraft = Partial<FlightFields>;

const MAX_FIELD_LENGTH = 80;

const WEB_TESSERACT_URL =
  "https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/tesseract.min.js";

type WebTesseractWorker = {
  recognize(image: Blob | string): Promise<{ data: { text: string } }>;
  terminate(): Promise<unknown>;
};

type WebTesseract = {
  createWorker(languages: string | string[]): Promise<WebTesseractWorker>;
};

function getWebTesseract() {
  return (
    globalThis as typeof globalThis & {
      Tesseract?: WebTesseract;
    }
  ).Tesseract;
}

function loadWebTesseract() {
  const existing = getWebTesseract();
  if (existing) return Promise.resolve(existing);

  return new Promise<WebTesseract>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("웹 브라우저에서만 항공권 사진 OCR을 사용할 수 있습니다."));
      return;
    }

    const alreadyLoading = document.querySelector<HTMLScriptElement>(
      'script[data-tripnow-tesseract="true"]',
    );

    const finish = () => {
      const loaded = getWebTesseract();
      if (loaded) resolve(loaded);
      else reject(new Error("웹 OCR 모듈을 불러오지 못했습니다. 네트워크 상태를 확인해 주세요."));
    };

    if (alreadyLoading) {
      alreadyLoading.addEventListener("load", finish, { once: true });
      alreadyLoading.addEventListener(
        "error",
        () => reject(new Error("웹 OCR 모듈을 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = WEB_TESSERACT_URL;
    script.async = true;
    script.dataset.tripnowTesseract = "true";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("웹 OCR 모듈을 불러오지 못했습니다.")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

function pickWebImage(): Promise<globalThis.File | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      resolve(null);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    let settled = false;
    const finish = (file: globalThis.File | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("focus", handleFocus);
      input.remove();
      resolve(file);
    };

    const handleFocus = () => {
      window.setTimeout(() => {
        finish(input.files?.[0] ?? null);
      }, 500);
    };

    input.addEventListener(
      "change",
      () => finish(input.files?.[0] ?? null),
      { once: true },
    );
    window.addEventListener("focus", handleFocus, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}

async function scanWebBoardingPass(): Promise<FlightOcrDraft | null> {
  const image = await pickWebImage();
  if (!image) return null;

  if (!image.type.startsWith("image/")) {
    throw new Error("항공권 사진 파일을 선택해 주세요.");
  }
  if (image.size > 15 * 1024 * 1024) {
    throw new Error("항공권 사진은 15MB 이하 파일을 사용해 주세요.");
  }

  const tesseract = await loadWebTesseract();
  let worker: WebTesseractWorker | null = null;
  let rawText = "";

  try {
    worker = await tesseract.createWorker(["eng", "kor", "jpn"]);
    const result = await worker.recognize(image);
    rawText = result.data.text;
    return parseFlightText(rawText);
  } finally {
    rawText = "";
    await worker?.terminate().catch(() => undefined);
  }
}


const airportAliases: ReadonlyArray<{
  code: string;
  city: string;
  pattern: RegExp;
}> = [
  { code: "ICN", city: "인천", pattern: /\bICN\b|인천(?:국제)?공항|仁川国際空港/i },
  { code: "NRT", city: "도쿄", pattern: /\bNRT\b|나리타(?:공항)?|成田空港/i },
  { code: "HND", city: "도쿄", pattern: /\bHND\b|하네다(?:공항)?|羽田空港/i },
  { code: "KIX", city: "오사카", pattern: /\bKIX\b|간사이(?:국제)?공항|関西空港/i },
  { code: "ITM", city: "오사카", pattern: /\bITM\b|이타미(?:공항)?|伊丹空港/i },
  { code: "FUK", city: "후쿠오카", pattern: /\bFUK\b|후쿠오카(?:공항)?|福岡空港/i },
  { code: "NGO", city: "나고야", pattern: /\bNGO\b|주부(?:국제)?공항|中部国際空港/i },
  { code: "CTS", city: "삿포로", pattern: /\bCTS\b|신치토세(?:공항)?|新千歳空港/i },
  { code: "GMP", city: "서울", pattern: /\bGMP\b|김포공항|金浦空港/i },
];

const monthNames: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_FIELD_LENGTH);
}

function toIsoDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function parseFlightDate(text: string) {
  const iso = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) {
    return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const korean = text.match(
    /(20\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?/,
  );
  if (korean) {
    return toIsoDate(Number(korean[1]), Number(korean[2]), Number(korean[3]));
  }

  const dayFirst = text.match(
    /\b(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(20\d{2})?\b/i,
  );
  if (dayFirst) {
    const year = dayFirst[3] ? Number(dayFirst[3]) : new Date().getFullYear();
    return toIsoDate(
      year,
      monthNames[dayFirst[2].toUpperCase()],
      Number(dayFirst[1]),
    );
  }

  const monthFirst = text.match(
    /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(\d{1,2})(?:,\s*)?(20\d{2})?\b/i,
  );
  if (!monthFirst) return "";

  const year = monthFirst[3]
    ? Number(monthFirst[3])
    : new Date().getFullYear();
  return toIsoDate(
    year,
    monthNames[monthFirst[1].toUpperCase()],
    Number(monthFirst[2]),
  );
}

function findAirportCodes(text: string) {
  const explicit = (text.toUpperCase().match(/\b[A-Z]{3}\b/g) ?? [])
    .filter((code) => airportAliases.some((airport) => airport.code === code))
    .map((code) => ({ code, index: text.toUpperCase().indexOf(code) }));
  const aliases = airportAliases
    .map((airport) => {
      const match = airport.pattern.exec(text);
      return match?.index == null ? null : { code: airport.code, index: match.index };
    })
    .filter((item): item is { code: string; index: number } => item !== null);

  return [
    ...new Set(
      [...explicit, ...aliases]
        .sort((left, right) => left.index - right.index)
        .map((item) => item.code),
    ),
  ];
}

function airportCity(code: string) {
  return airportAliases.find((airport) => airport.code === code)?.city ?? "";
}

function findLabeledAirport(lines: string[], label: RegExp) {
  for (const line of lines) {
    const match = label.exec(line);
    if (!match) continue;

    const afterLabel = line.slice((match.index ?? 0) + match[0].length);
    const afterCode = findAirportCodes(afterLabel)[0];
    if (afterCode) return afterCode;

    const beforeLabel = findAirportCodes(line.slice(0, match.index ?? 0));
    if (beforeLabel.length > 0) return beforeLabel[beforeLabel.length - 1];
  }

  return "";
}

function parseFlightNumber(text: string) {
  const candidates =
    text.toUpperCase().match(/\b[A-Z0-9]{2}\s?\d{2,4}\b/g) ?? [];
  return (
    candidates
      .map((value) => value.replace(/\s+/g, ""))
      .filter((value) => /[A-Z]/.test(value.slice(0, 2)))
      .find((value) => !airportAliases.some((airport) => value === airport.code)) ?? ""
  );
}

function parseTime(text: string) {
  const match = text.match(/\b(?:[01]?\d|2[0-3])[:.]\d{2}\b/);
  return match ? match[0].replace(".", ":") : "";
}

function parseTerminal(text: string) {
  const match = text.match(
    /(?:terminal|터미널|ターミナル)\s*(?:no\.?|#|:)?\s*([1-4])|\bT(?:erminal)?\s*([1-4])\b/i,
  );
  return match?.[1] ?? match?.[2] ?? "";
}

function compactDraft(value: FlightOcrDraft): FlightOcrDraft {
  return Object.fromEntries(
    Object.entries(value).filter(([, field]) => Boolean(field)),
  ) as FlightOcrDraft;
}

function parseFlightText(text: string): FlightOcrDraft {
  const normalizedText = text.replace(/\r/g, "\n");
  const lines = normalizedText
    .split(/\n/)
    .map(normalize)
    .filter(Boolean);

  const orderedAirports = findAirportCodes(normalizedText);
  const origin =
    findLabeledAirport(lines, /(?:from|출발|출발지|departure|dep|origin|出発)/i) ||
    orderedAirports[0] ||
    "";
  const destination =
    findLabeledAirport(lines, /(?:to|도착|도착지|arrival|arr|destination|到着)/i) ||
    orderedAirports.find((code) => code !== origin) ||
    "";

  const date = parseFlightDate(normalizedText);
  const time = parseTime(normalizedText);
  const flight = parseFlightNumber(normalizedText);
  const terminal = parseTerminal(normalizedText);
  const isOutbound =
    origin === "ICN" ||
    (/출국|depart|出発/i.test(normalizedText) && destination !== "ICN");
  const isReturn =
    destination === "ICN" ||
    (/입국|arrival|到着/i.test(normalizedText) && origin !== "ICN");

  if (!date && !flight && !origin && !destination) {
    throw new Error("항공권에서 항공편 정보를 찾지 못했습니다. 사진을 다시 선택해 주세요.");
  }

  if (isOutbound && !isReturn) {
    return compactDraft({
      outboundDate: date,
      outboundTime: time,
      outboundFlight: flight,
      outboundTerminal: terminal,
      outboundDestination: airportCity(destination) || destination,
    });
  }

  if (isReturn && !isOutbound) {
    return compactDraft({
      returnDate: date,
      returnTime: time,
      returnFlight: flight,
      returnTerminal: terminal,
      returnOrigin: airportCity(origin) || origin,
    });
  }

  throw new Error(
    "출국·귀국 방향을 확인하지 못했습니다. 출발 공항과 도착 공항을 직접 확인해 주세요.",
  );
}

export function canUseFlightOcr() {
  if (Platform.OS === "web") {
    return typeof document !== "undefined";
  }
  return Platform.OS === "android" && isHotelOcrAvailable();
}

export async function scanFlightBoardingPass(): Promise<FlightOcrDraft | null> {
  if (Platform.OS === "web") {
    return scanWebBoardingPass();
  }

  if (!canUseFlightOcr()) {
    throw new Error("항공권 OCR은 Android 설치 앱 또는 웹에서 사용할 수 있습니다.");
  }

  const selection = await ExpoFile.pickFileAsync({
    mimeTypes: ["image/*"],
    multipleFiles: false,
  });

  if (selection.canceled || !selection.result) return null;

  let rawText = "";
  try {
    const result = await recognizeHotelImage(selection.result.uri);
    rawText = result.text;
    return parseFlightText(rawText);
  } finally {
    // 원본 OCR 전문은 저장하거나 로그로 남기지 않습니다.
    rawText = "";
  }
}
