import type { ImageSourcePropType } from "react-native";
import type { JapanAirportCode } from "./japanAirportGuides";

export type AirportMapSheet = {
  id: string;
  label: string;
  image: ImageSourcePropType;
  sourceUrl: string;
  sourceNote: string;
};

// Floor plans published by the airport operators. Keep the source and its date
// visible beside each copy so travelers can check the current live floor guide.
export const officialAirportMaps: Readonly<Record<JapanAirportCode, readonly AirportMapSheet[]>> = {
  HND: [
    { id: "hnd-t3-3f", label: "T3 · 출국 3F", image: require("../../assets/airport-maps/hnd3.webp"), sourceUrl: "https://tokyo-haneda.com/en/floor/terminal3/3rd_floor.html", sourceNote: "하네다공항 층별 안내" },
    { id: "hnd-t3-2f", label: "T3 · 도착 2F", image: require("../../assets/airport-maps/hnd2.webp"), sourceUrl: "https://tokyo-haneda.com/en/floor/terminal3/2nd_floor.html", sourceNote: "하네다공항 층별 안내" },
    { id: "hnd-t2-3f", label: "T2 · 출국 3F", image: require("../../assets/airport-maps/hnd-t2-3f.webp"), sourceUrl: "https://tokyo-haneda.com/en/floor/terminal2/3rd_floor.html", sourceNote: "하네다공항 층별 안내" },
    { id: "hnd-t2-2f", label: "T2 · 도착 2F", image: require("../../assets/airport-maps/hnd-t2-2f.webp"), sourceUrl: "https://tokyo-haneda.com/en/floor/terminal2/2nd_floor.html", sourceNote: "하네다공항 층별 안내" },
  ],
  NRT: [
    { id: "nrt-t1-low", label: "T1 · 1~3F", image: require("../../assets/airport-maps/hi-nrt1-1.webp"), sourceUrl: "https://www.narita-airport.jp/en/company/media-center/publications-pamphlets/kannaimap/", sourceNote: "나리타공항 안내도 · 2025년 6월 발행" },
    { id: "nrt-t1-high", label: "T1 · 4~5F", image: require("../../assets/airport-maps/hi-nrt1-2.webp"), sourceUrl: "https://www.narita-airport.jp/en/company/media-center/publications-pamphlets/kannaimap/", sourceNote: "나리타공항 안내도 · 2025년 6월 발행" },
    { id: "nrt-t2-low", label: "T2 · B1~2F", image: require("../../assets/airport-maps/hi-nrt2-1.webp"), sourceUrl: "https://www.narita-airport.jp/en/company/media-center/publications-pamphlets/kannaimap/", sourceNote: "나리타공항 안내도 · 2025년 6월 발행" },
    { id: "nrt-t2-high", label: "T2 · 3~4F", image: require("../../assets/airport-maps/hi-nrt2-2.webp"), sourceUrl: "https://www.narita-airport.jp/en/company/media-center/publications-pamphlets/kannaimap/", sourceNote: "나리타공항 안내도 · 2025년 6월 발행" },
    { id: "nrt-t3", label: "T3 · 전체", image: require("../../assets/airport-maps/hi-nrt3-1.webp"), sourceUrl: "https://www.narita-airport.jp/en/company/media-center/publications-pamphlets/kannaimap/", sourceNote: "나리타공항 안내도 · 2025년 6월 발행" },
  ],
  // Kansai Airports discontinued its downloadable floor-guide PDF. Its live
  // digital map is linked in the guide; do not show an obsolete plan as current.
  KIX: [],
  CTS: [
    { id: "cts-int", label: "국제선 · 전체", image: require("../../assets/airport-maps/hi-cts-1.webp"), sourceUrl: "https://www.hokkaido-airports.com/en/new-chitose/floormap/", sourceNote: "신치토세공항 국제선 안내도 · 2026년 9월 17일 기준" },
  ],
  NGO: [
    { id: "ngo-t1-3f", label: "T1 · 출국 3F", image: require("../../assets/airport-maps/ngo1.webp"), sourceUrl: "https://www.centrair.jp/en/map/", sourceNote: "센트레아 공식 층별 지도" },
    { id: "ngo-t1-2f", label: "T1 · 도착 2F", image: require("../../assets/airport-maps/ngo2.webp"), sourceUrl: "https://www.centrair.jp/en/map/", sourceNote: "센트레아 공식 층별 지도" },
    { id: "ngo-t2-2f", label: "T2 · 출국 2F", image: require("../../assets/airport-maps/ngo3.webp"), sourceUrl: "https://www.centrair.jp/en/map/", sourceNote: "센트레아 공식 층별 지도" },
    { id: "ngo-t2-1f", label: "T2 · 도착 1F", image: require("../../assets/airport-maps/ngo4.webp"), sourceUrl: "https://www.centrair.jp/en/map/", sourceNote: "센트레아 공식 층별 지도" },
  ],
  FUK: [
    { id: "fuk-int", label: "국제선 · 전체", image: require("../../assets/airport-maps/hi-fuk-1.webp"), sourceUrl: "https://www.fukuoka-airport.jp/en/map/", sourceNote: "후쿠오카공항 국제선 터미널 지도" },
  ],
  OKA: [
    { id: "oka-1f", label: "도착 1F", image: require("../../assets/airport-maps/hi-oka-1.webp"), sourceUrl: "https://www.naha-airport.co.jp/en/spend/map/", sourceNote: "나하공항 층별 안내도 · 구판, 최신 시설은 원본 확인" },
    { id: "oka-2f", label: "출발 2F", image: require("../../assets/airport-maps/hi-oka-2.webp"), sourceUrl: "https://www.naha-airport.co.jp/en/spend/map/", sourceNote: "나하공항 층별 안내도 · 구판, 최신 시설은 원본 확인" },
    { id: "oka-3f", label: "체크인 3F", image: require("../../assets/airport-maps/hi-oka-3.webp"), sourceUrl: "https://www.naha-airport.co.jp/en/spend/map/", sourceNote: "나하공항 층별 안내도 · 구판, 최신 시설은 원본 확인" },
  ],
};

export function defaultAirportMap(code: JapanAirportCode, terminal: string, direction: "departure" | "arrival") {
  const t2 = /\bT2\b/i.test(terminal);
  const t3 = /\bT3\b/i.test(terminal);
  const id =
    code === "HND" ? `hnd-${t2 ? "t2" : "t3"}-${direction === "departure" ? "3f" : "2f"}` :
    code === "NRT" ? t3 ? "nrt-t3" : t2 ? `nrt-t2-${direction === "departure" ? "high" : "low"}` : "nrt-t1-low" :
    code === "NGO" ? `ngo-${t2 ? "t2" : "t1"}-${t2 ? direction === "departure" ? "2f" : "1f" : direction === "departure" ? "3f" : "2f"}` :
    code === "OKA" ? `oka-${direction === "departure" ? "3f" : "1f"}` : "";
  const sheets = officialAirportMaps[code];
  return sheets.find((sheet) => sheet.id === id) ?? sheets[0] ?? null;
}
