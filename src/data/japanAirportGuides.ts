export type JapanAirportCode =
  | "NRT"
  | "HND"
  | "KIX"
  | "CTS"
  | "NGO"
  | "FUK"
  | "OKA";

export type JapanAirportGuide = {
  code: JapanAirportCode;
  city: string;
  name: string;
  mapUrl: string;
  flightUrl: string;
  arrivalFlow: readonly string[];
  departureFlow: readonly string[];
  terminalByAirline?: Readonly<Record<string, string>>;
  internationalTerminal?: string;
};

export type AirlineGuide = {
  code: string;
  name: string;
};

const commonArrivalFlow = ["도착 게이트", "입국심사", "수하물", "세관", "도착 로비"] as const;
const commonDepartureFlow = ["터미널 입구", "항공사 체크인", "보안검사", "출국심사", "탑승구"] as const;

export const japanAirportGuides: Readonly<Record<JapanAirportCode, JapanAirportGuide>> = {
  NRT: {
    code: "NRT",
    city: "도쿄",
    name: "나리타 국제공항",
    mapUrl: "https://www.narita-airport.jp/en/map/",
    flightUrl: "https://www.narita-airport.jp/en/flight/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    terminalByAirline: {
      KE: "T1 북쪽 윙",
      LJ: "T1 북쪽 윙",
      OZ: "T1 남쪽 윙",
      BX: "T1 남쪽 윙",
      JL: "T2",
      TW: "T2",
      NH: "T1 남쪽 윙",
      "7C": "T3",
    },
  },
  HND: {
    code: "HND",
    city: "도쿄",
    name: "하네다공항",
    mapUrl: "https://tokyo-haneda.com/en/floor/",
    flightUrl: "https://tokyo-haneda.com/en/flight/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
  },
  KIX: {
    code: "KIX",
    city: "오사카",
    name: "간사이 국제공항",
    mapUrl: "https://www.kansai-airport.or.jp/en/map/",
    flightUrl: "https://www.kansai-airport.or.jp/en/flight/search",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    terminalByAirline: {
      "7C": "T2",
      MM: "T2",
      "9C": "T2",
      KE: "T1",
      OZ: "T1",
      JL: "T1",
      NH: "T1",
      TW: "T1",
      LJ: "T1",
      BX: "T1",
      ZE: "T1",
    },
  },
  CTS: {
    code: "CTS",
    city: "삿포로",
    name: "신치토세공항",
    mapUrl: "https://www.hokkaido-airports.com/en/new-chitose/floormap/",
    flightUrl: "https://www.hokkaido-airports.com/en/new-chitose/airport/fis/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    internationalTerminal: "국제선 터미널",
  },
  NGO: {
    code: "NGO",
    city: "나고야",
    name: "주부 센트레아 국제공항",
    mapUrl: "https://www.centrair.jp/en/map/",
    flightUrl: "https://www.centrair.jp/en/flight/search/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    terminalByAirline: {
      "7C": "T2",
    },
  },
  FUK: {
    code: "FUK",
    city: "후쿠오카",
    name: "후쿠오카공항",
    mapUrl: "https://www.fukuoka-airport.jp/en/map/",
    flightUrl: "https://www.fukuoka-airport.jp/en/flight/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    internationalTerminal: "국제선 터미널",
  },
  OKA: {
    code: "OKA",
    city: "오키나와",
    name: "나하공항",
    mapUrl: "https://www.naha-airport.co.jp/en/facility/",
    flightUrl: "https://www.naha-airport.co.jp/en/flight/today/",
    arrivalFlow: commonArrivalFlow,
    departureFlow: commonDepartureFlow,
    internationalTerminal: "국제선 구역",
  },
};

const airlineByPrefix: Readonly<Record<string, AirlineGuide>> = {
  KE: { code: "KE", name: "대한항공" },
  OZ: { code: "OZ", name: "아시아나항공" },
  "7C": { code: "7C", name: "제주항공" },
  TW: { code: "TW", name: "티웨이·트리니티항공" },
  LJ: { code: "LJ", name: "진에어" },
  BX: { code: "BX", name: "에어부산" },
  ZE: { code: "ZE", name: "이스타항공" },
  RF: { code: "RF", name: "에어로케이" },
  JL: { code: "JL", name: "일본항공" },
  NH: { code: "NH", name: "전일본공수" },
  MM: { code: "MM", name: "피치항공" },
  GK: { code: "GK", name: "젯스타 재팬" },
  IJ: { code: "IJ", name: "스프링 재팬" },
  "9C": { code: "9C", name: "춘추항공" },
};

const airportCodeByUniqueCity: Readonly<Record<string, JapanAirportCode>> = {
  오사카: "KIX",
  삿포로: "CTS",
  나고야: "NGO",
  후쿠오카: "FUK",
  오키나와: "OKA",
};

export function normalizeAirportCode(value: string) {
  const code = value.trim().toUpperCase();
  return code in japanAirportGuides ? (code as JapanAirportCode) : null;
}

export function resolveJapanAirport(code: string, city: string) {
  const explicit = normalizeAirportCode(code);
  if (explicit) return japanAirportGuides[explicit];

  const compactCity = city.replace(/\s+/g, "").trim();
  const inferredCode = airportCodeByUniqueCity[compactCity];
  return inferredCode ? japanAirportGuides[inferredCode] : null;
}

export function resolveAirline(flightId: string) {
  const normalized = flightId.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = Object.keys(airlineByPrefix)
    .sort((left, right) => right.length - left.length)
    .find((code) => normalized.startsWith(code));
  return prefix ? airlineByPrefix[prefix] : null;
}

function normalizeManualTerminal(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "";
  if (/^[1-3]$/.test(normalized)) return `T${normalized}`;
  return normalized.replace(/^TERMINAL\s*/i, "T");
}

export function resolveTerminal(
  guide: JapanAirportGuide,
  flightId: string,
  manualTerminal: string,
) {
  const manual = normalizeManualTerminal(manualTerminal);
  if (manual) {
    return { value: manual, source: "항공권 입력값" as const };
  }

  const airline = resolveAirline(flightId);
  const byAirline = airline ? guide.terminalByAirline?.[airline.code] : undefined;
  if (byAirline) {
    return { value: byAirline, source: "항공사별 기본 터미널" as const };
  }

  if (guide.internationalTerminal) {
    return { value: guide.internationalTerminal, source: "국제선 기본 동선" as const };
  }

  return { value: "공식 운항정보에서 확인", source: "터미널 미확정" as const };
}
