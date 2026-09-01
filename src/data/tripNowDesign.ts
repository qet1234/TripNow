export type DestinationCard = {
  id: string;
  name: string;
  subtitle: string;
  regionId: string;
  image: string;
};

export const destinationCards: DestinationCard[] = [
  {
    id: "tokyo",
    name: "도쿄",
    subtitle: "도쿄 타워와 골목 여행",
    regionId: "tokyo-shibuya",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "osaka",
    name: "오사카",
    subtitle: "맛과 활기가 가득한 도시",
    regionId: "osaka-namba",
    image: "https://images.unsplash.com/photo-1629569320448-a5504a24d384?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "fukuoka",
    name: "후쿠오카",
    subtitle: "가볍게 떠나는 미식 여행",
    regionId: "fukuoka-hakata",
    image: "https://images.unsplash.com/photo-1670511915504-9f0f1df5a3de?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "sapporo",
    name: "삿포로",
    subtitle: "계절마다 새로운 북쪽 도시",
    regionId: "sapporo-center",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85",
  },
];

export const supportedRealtimeLines = [
  { code: "A", name: "아사쿠사선", operator: "도에이", color: "#E85298" },
  { code: "I", name: "미타선", operator: "도에이", color: "#0079C2" },
  { code: "S", name: "신주쿠선", operator: "도에이", color: "#6CBB5A" },
  { code: "E", name: "오에도선", operator: "도에이", color: "#B6007A" },
  { code: "B", name: "블루라인", operator: "요코하마", color: "#0068B7" },
  { code: "G", name: "그린라인", operator: "요코하마", color: "#40A829" },
] as const;

export const sampleItinerary = [
  { time: "09:00", title: "아사쿠사", duration: "25분", image: destinationCards[0].image },
  { time: "11:00", title: "도쿄 스카이트리", duration: "20분", image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=85" },
  { time: "14:00", title: "우에노", duration: "", image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=85" },
] as const;
