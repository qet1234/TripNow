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
    id: "sensoji",
    name: "센소지",
    category: "tourism",
    distanceMeters: 550,
    walkingMinutes: 8,
    openNow: true,
    hoursLabel: "06:00 - 17:00",
  },
  {
    id: "shibuya-sky",
    name: "시부야 스카이",
    category: "tourism",
    distanceMeters: 850,
    walkingMinutes: 12,
    openNow: true,
    hoursLabel: "10:00 - 22:30",
  },
  {
    id: "ichiran-shibuya",
    name: "Ichiran Shibuya",
    category: "food",
    distanceMeters: 350,
    walkingMinutes: 5,
    openNow: true,
    hoursLabel: "24시간 영업",
  },
];
