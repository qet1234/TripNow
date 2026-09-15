import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type RegionIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type HomeRegionTheme = {
  id: "tokyo" | "osaka" | "kyoto" | "fukuoka";
  regionId: string;
  name: string;
  englishName: string;
  eyebrow: string;
  accent: string;
  accentDark: string;
  soft: string;
  softStrong: string;
  landmarkIcon: RegionIconName;
  heroImage: string;
  description: string;
  nextTitle: string;
  nextMeta: string;
  schedule: readonly [
    { time: string; title: string; detail: string },
    { time: string; title: string; detail: string },
  ];
};

export const homeRegions: HomeRegionTheme[] = [
  {
    id: "tokyo",
    regionId: "tokyo-shibuya",
    name: "도쿄",
    englishName: "TOKYO",
    eyebrow: "TOKYO · JAPAN · TRAVEL",
    accent: "#0B6A5A",
    accentDark: "#07483E",
    soft: "#EAF5F1",
    softStrong: "#D7ECE6",
    landmarkIcon: "eiffel-tower",
    heroImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=88",
    description: "일상이 여행이 되는 도시",
    nextTitle: "아사쿠사 산책",
    nextMeta: "11:00 · 센소지와 나카미세 거리",
    schedule: [
      { time: "11:00", title: "아사쿠사", detail: "센소지와 나카미세 거리" },
      { time: "14:00", title: "우에노 공원", detail: "우에노 공원 · 도쿄 국립박물관" },
    ],
  },
  {
    id: "osaka",
    regionId: "osaka-namba",
    name: "오사카",
    englishName: "OSAKA",
    eyebrow: "OSAKA · JAPAN · TRAVEL",
    accent: "#D33B16",
    accentDark: "#A3270B",
    soft: "#FFF0E8",
    softStrong: "#FFDDCE",
    landmarkIcon: "castle",
    heroImage: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1400&q=88",
    description: "맛으로 물드는 즐거운 도시",
    nextTitle: "도톤보리 미식 산책",
    nextMeta: "11:00 · 글리코상과 호젠지 요코초",
    schedule: [
      { time: "11:00", title: "도톤보리", detail: "글리코상 · 호젠지 요코초" },
      { time: "14:00", title: "오사카성", detail: "천수각 · 니시노마루 정원" },
    ],
  },
  {
    id: "kyoto",
    regionId: "kyoto-gion",
    name: "교토",
    englishName: "KYOTO",
    eyebrow: "KYOTO · JAPAN · TRAVEL",
    accent: "#7B2F83",
    accentDark: "#54205B",
    soft: "#F7EDF8",
    softStrong: "#EBD8EE",
    landmarkIcon: "temple-buddhist",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=88",
    description: "시간이 머무는 고즈넉한 도시",
    nextTitle: "기요미즈데라 산책",
    nextMeta: "11:00 · 산넨자카와 니넨자카",
    schedule: [
      { time: "11:00", title: "기요미즈데라", detail: "산넨자카 · 니넨자카" },
      { time: "14:00", title: "기온 거리", detail: "하나미코지 · 야사카 신사" },
    ],
  },
  {
    id: "fukuoka",
    regionId: "fukuoka-hakata",
    name: "후쿠오카",
    englishName: "FUKUOKA",
    eyebrow: "FUKUOKA · JAPAN · TRAVEL",
    accent: "#087C9D",
    accentDark: "#07566D",
    soft: "#EAF7FA",
    softStrong: "#D5EEF4",
    landmarkIcon: "waves",
    heroImage: "https://images.unsplash.com/photo-1670511915504-9f0f1df5a3de?auto=format&fit=crop&w=1400&q=88",
    description: "바다와 만나는 활기찬 도시",
    nextTitle: "오호리 공원 산책",
    nextMeta: "11:00 · 호수 산책로와 일본 정원",
    schedule: [
      { time: "11:00", title: "오호리 공원", detail: "호수 산책로 · 일본 정원" },
      { time: "14:00", title: "모모치 해변", detail: "후쿠오카 타워 · 해변 산책" },
    ],
  },
];

export const defaultHomeRegion = homeRegions[0];

export function getHomeRegion(regionId: string) {
  return homeRegions.find((region) => region.regionId === regionId) ?? defaultHomeRegion;
}
