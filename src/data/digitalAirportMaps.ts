import type { JapanAirportCode } from "./japanAirportGuides";

export type DigitalAirportMap = {
  embedUrl: string;
  openUrl: string;
  provider: string;
  note: string;
  interactive: boolean;
};

export function getDigitalAirportMap(
  code: JapanAirportCode,
  terminal: string,
  direction: "departure" | "arrival",
): DigitalAirportMap {
  const normalizedTerminal = terminal.toUpperCase();
  const isT2 = /\bT2\b/.test(normalizedTerminal);

  switch (code) {
    case "HND":
      return {
        embedUrl: "https://platinumaps.jp/d/haneda?culture=en",
        openUrl: "https://platinumaps.jp/d/haneda?culture=en",
        provider: "HANEDA MAP",
        note: "하네다공항 공식 디지털 지도 · 시설 검색과 공항 내 경로 안내 지원",
        interactive: true,
      };
    case "NRT":
      return {
        embedUrl: "https://www.narita-airport.jp/en/map/",
        openUrl: "https://www.narita-airport.jp/en/map/",
        provider: "Narita Interactive Map",
        note: "나리타공항 공식 인터랙티브 지도 · 층별 시설과 경로 검색 지원",
        interactive: true,
      };
    case "KIX": {
      const area = isT2 ? "33" : "32";
      const floor = isT2 ? "1F" : direction === "departure" ? "4F" : "1F";
      const url = `https://platinumaps.jp/maps/kix-airport?area=${area}&floor=${floor}`;
      return {
        embedUrl: url,
        openUrl: url,
        provider: "KIX Digital Map",
        note: `간사이공항 공식 디지털 지도 · ${isT2 ? "T2" : "T1"} ${floor} 우선 표시`,
        interactive: true,
      };
    }
    case "CTS":
      return {
        embedUrl: "https://www.hokkaido-airports.com/en/new-chitose/floormap/international/",
        openUrl: "https://www.hokkaido-airports.com/en/new-chitose/floormap/international/",
        provider: "New Chitose Floor Map",
        note: "신치토세공항 공식 국제선 웹 층별 지도",
        interactive: false,
      };
    case "NGO":
      return {
        embedUrl: "https://platinumaps.jp/maps/centrair/?culture=en",
        openUrl: "https://platinumaps.jp/d/centrair/?culture=en",
        provider: "Centrair Digital Floor Map",
        note: "센트레아 공식 디지털 지도 · 시설 필터와 층 이동 지원",
        interactive: true,
      };
    case "FUK":
      return {
        embedUrl: "https://www.fukuoka-airport.jp/en/map/",
        openUrl: "https://www.fukuoka-airport.jp/en/map/",
        provider: "Fukuoka Terminal Map",
        note: "후쿠오카공항 공식 웹 터미널 지도 · 층과 시설 카테고리 전환 지원",
        interactive: true,
      };
    case "OKA":
      return {
        embedUrl: "https://www.naha-airport.co.jp/en/spend/map/",
        openUrl: "https://www.naha-airport.co.jp/en/spend/map/",
        provider: "Naha Floor Map",
        note: "나하공항 공식 웹 층별 지도 · 1F~4F 전환 지원",
        interactive: false,
      };
  }
}
