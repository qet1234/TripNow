export type JapanRegion = {
  id: string;
  city: string;
  area: string;
  label: string;
  latitude: number;
  longitude: number;
};

export const japanRegions: JapanRegion[] = [
  {
    id: "tokyo-shibuya",
    city: "도쿄",
    area: "시부야",
    label: "도쿄 · 시부야",
    latitude: 35.6595,
    longitude: 139.7005,
  },
  {
    id: "tokyo-shinjuku",
    city: "도쿄",
    area: "신주쿠",
    label: "도쿄 · 신주쿠",
    latitude: 35.6938,
    longitude: 139.7034,
  },
  {
    id: "osaka-namba",
    city: "오사카",
    area: "난바",
    label: "오사카 · 난바",
    latitude: 34.6687,
    longitude: 135.5013,
  },
  {
    id: "fukuoka-hakata",
    city: "후쿠오카",
    area: "하카타",
    label: "후쿠오카 · 하카타",
    latitude: 33.5902,
    longitude: 130.4207,
  },
  {
    id: "sapporo-center",
    city: "삿포로",
    area: "중심부",
    label: "삿포로 · 중심부",
    latitude: 43.0618,
    longitude: 141.3545,
  },
  {
    id: "nagoya-sakae",
    city: "나고야",
    area: "사카에",
    label: "나고야 · 사카에",
    latitude: 35.1697,
    longitude: 136.9081,
  },
  {
    id: "okinawa-naha",
    city: "오키나와",
    area: "나하",
    label: "오키나와 · 나하",
    latitude: 26.2124,
    longitude: 127.6809,
  },
];

export const defaultJapanRegion = japanRegions[0];

export function getJapanRegion(regionId: string) {
  return japanRegions.find((region) => region.id === regionId) ?? defaultJapanRegion;
}
