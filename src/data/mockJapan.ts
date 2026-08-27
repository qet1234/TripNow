import type { PlacePreview, TripSummary } from "@/src/types/travel";

export const mockTrip: TripSummary = {
  country: "JP",
  countryName: "일본",
  city: "도쿄",
  day: 2,
  localTime: "21:34",
  temperatureC: 27,
  weatherLabel: "맑음",
  jpy100ToKrw: 920,
};

export const mockPlaces: PlacePreview[] = [
  {
    id: "shibuya-sky",
    name: "시부야 스카이",
    category: "tourism",
    areaLabel: "도쿄 · 시부야",
    openNow: true,
    hoursLabel: "영업시간 API 연결 예정",
    mapQuery: "Shibuya Sky Tokyo",
  },
  {
    id: "meiji-jingu",
    name: "메이지 신궁",
    category: "tourism",
    areaLabel: "도쿄 · 시부야 인근",
    openNow: true,
    hoursLabel: "영업시간 API 연결 예정",
    mapQuery: "Meiji Jingu Tokyo",
  },
  {
    id: "ichiran-shibuya",
    name: "Ichiran Shibuya",
    category: "food",
    areaLabel: "도쿄 · 시부야",
    openNow: true,
    hoursLabel: "영업시간 API 연결 예정",
    mapQuery: "Ichiran Shibuya",
  },
];
