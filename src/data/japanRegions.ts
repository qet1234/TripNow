export type JapanCity = {
  id: string;
  label: string;
};

export type JapanRegion = {
  id: string;
  cityId: string;
  city: string;
  area: string;
  label: string;
  latitude: number;
  longitude: number;
};

type AreaSeed = {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
};

type CityRegionGroup = {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  areas: AreaSeed[];
};

const cityRegionGroups: CityRegionGroup[] = [
  {
    id: "tokyo",
    city: "도쿄",
    latitude: 35.6762,
    longitude: 139.6503,
    areas: [
      { id: "shibuya", name: "시부야구", latitude: 35.6595, longitude: 139.7005 },
      { id: "shinjuku", name: "신주쿠구", latitude: 35.6938, longitude: 139.7034 },
      { id: "chiyoda", name: "치요다구" },
      { id: "chuo", name: "주오구" },
      { id: "minato", name: "미나토구" },
      { id: "bunkyo", name: "분쿄구" },
      { id: "taito", name: "다이토구" },
      { id: "sumida", name: "스미다구" },
      { id: "koto", name: "고토구" },
      { id: "shinagawa", name: "시나가와구" },
      { id: "meguro", name: "메구로구" },
      { id: "ota", name: "오타구" },
      { id: "setagaya", name: "세타가야구" },
      { id: "nakano", name: "나카노구" },
      { id: "suginami", name: "스기나미구" },
      { id: "toshima", name: "도시마구" },
      { id: "kita", name: "기타구" },
      { id: "arakawa", name: "아라카와구" },
      { id: "itabashi", name: "이타바시구" },
      { id: "nerima", name: "네리마구" },
      { id: "adachi", name: "아다치구" },
      { id: "katsushika", name: "가쓰시카구" },
      { id: "edogawa", name: "에도가와구" },
    ],
  },
  {
    id: "osaka",
    city: "오사카",
    latitude: 34.6937,
    longitude: 135.5023,
    areas: [
      { id: "namba", name: "주오구(난바)", latitude: 34.6687, longitude: 135.5013 },
      { id: "kita", name: "기타구" },
      { id: "miyakojima", name: "미야코지마구" },
      { id: "fukushima", name: "후쿠시마구" },
      { id: "konohana", name: "고노하나구" },
      { id: "nishi", name: "니시구" },
      { id: "minato", name: "미나토구" },
      { id: "taisho", name: "다이쇼구" },
      { id: "tennoji", name: "덴노지구" },
      { id: "naniwa", name: "나니와구" },
      { id: "nishiyodogawa", name: "니시요도가와구" },
      { id: "higashiyodogawa", name: "히가시요도가와구" },
      { id: "higashinari", name: "히가시나리구" },
      { id: "ikuno", name: "이쿠노구" },
      { id: "asahi", name: "아사히구" },
      { id: "joto", name: "조토구" },
      { id: "abeno", name: "아베노구" },
      { id: "sumiyoshi", name: "스미요시구" },
      { id: "higashisumiyoshi", name: "히가시스미요시구" },
      { id: "nishinari", name: "니시나리구" },
      { id: "yodogawa", name: "요도가와구" },
      { id: "tsurumi", name: "쓰루미구" },
      { id: "suminoe", name: "스미노에구" },
      { id: "hirano", name: "히라노구" },
    ],
  },
  {
    id: "kyoto",
    city: "교토",
    latitude: 35.0116,
    longitude: 135.7681,
    areas: [
      { id: "gion", name: "히가시야마구(기온)", latitude: 35.0037, longitude: 135.7788 },
      { id: "nakagyo", name: "나카교구" },
      { id: "shimogyo", name: "시모교구" },
      { id: "kamigyo", name: "가미교구" },
      { id: "kita", name: "기타구" },
      { id: "sakyo", name: "사쿄구" },
      { id: "ukyo", name: "우쿄구" },
      { id: "minami", name: "미나미구" },
      { id: "fushimi", name: "후시미구" },
      { id: "yamashina", name: "야마시나구" },
      { id: "nishikyo", name: "니시쿄구" },
    ],
  },
  {
    id: "fukuoka",
    city: "후쿠오카",
    latitude: 33.5902,
    longitude: 130.4017,
    areas: [
      { id: "hakata", name: "하카타구", latitude: 33.5902, longitude: 130.4207 },
      { id: "chuo", name: "주오구" },
      { id: "higashi", name: "히가시구" },
      { id: "minami", name: "미나미구" },
      { id: "jonan", name: "조난구" },
      { id: "sawara", name: "사와라구" },
      { id: "nishi", name: "니시구" },
    ],
  },
  {
    id: "sapporo",
    city: "삿포로",
    latitude: 43.0618,
    longitude: 141.3545,
    areas: [
      { id: "center", name: "주오구", latitude: 43.0618, longitude: 141.3545 },
      { id: "kita", name: "기타구" },
      { id: "higashi", name: "히가시구" },
      { id: "shiroishi", name: "시로이시구" },
      { id: "toyohira", name: "도요히라구" },
      { id: "minami", name: "미나미구" },
      { id: "nishi", name: "니시구" },
      { id: "atsubetsu", name: "아쓰베쓰구" },
      { id: "teine", name: "데이네구" },
      { id: "kiyota", name: "기요타구" },
    ],
  },
  {
    id: "nagoya",
    city: "나고야",
    latitude: 35.1815,
    longitude: 136.9066,
    areas: [
      { id: "sakae", name: "나카구(사카에)", latitude: 35.1697, longitude: 136.9081 },
      { id: "chikusa", name: "지쿠사구" },
      { id: "higashi", name: "히가시구" },
      { id: "kita", name: "기타구" },
      { id: "nishi", name: "니시구" },
      { id: "nakamura", name: "나카무라구" },
      { id: "showa", name: "쇼와구" },
      { id: "mizuho", name: "미즈호구" },
      { id: "atsuta", name: "아쓰타구" },
      { id: "nakagawa", name: "나카가와구" },
      { id: "minato", name: "미나토구" },
      { id: "minami", name: "미나미구" },
      { id: "moriyama", name: "모리야마구" },
      { id: "midori", name: "미도리구" },
      { id: "meito", name: "메이토구" },
      { id: "tempaku", name: "덴파쿠구" },
    ],
  },
  {
    id: "okinawa",
    city: "오키나와",
    latitude: 26.2124,
    longitude: 127.6809,
    areas: [
      { id: "naha", name: "나하시", latitude: 26.2124, longitude: 127.6809 },
      { id: "okinawa-city", name: "오키나와시", latitude: 26.3344, longitude: 127.8056 },
      { id: "uruma", name: "우루마시", latitude: 26.379, longitude: 127.8575 },
      { id: "ginowan", name: "기노완시", latitude: 26.2815, longitude: 127.778 },
      { id: "urasoe", name: "우라소에시", latitude: 26.2458, longitude: 127.7228 },
      { id: "nago", name: "나고시", latitude: 26.5916, longitude: 127.9773 },
      { id: "itoman", name: "이토만시", latitude: 26.1236, longitude: 127.6659 },
      { id: "tomigusuku", name: "도미구스쿠시", latitude: 26.161, longitude: 127.6689 },
      { id: "nanjo", name: "난조시", latitude: 26.1445, longitude: 127.7669 },
      { id: "miyakojima", name: "미야코지마시", latitude: 24.8055, longitude: 125.2811 },
      { id: "ishigaki", name: "이시가키시", latitude: 24.3448, longitude: 124.1572 },
      { id: "onna", name: "온나손", latitude: 26.4973, longitude: 127.8536 },
      { id: "motobu", name: "모토부초", latitude: 26.6582, longitude: 127.8981 },
      { id: "yomitan", name: "요미탄손", latitude: 26.3962, longitude: 127.7442 },
      { id: "chatan", name: "차탄초", latitude: 26.3202, longitude: 127.7637 },
      { id: "zamami", name: "자마미손", latitude: 26.2288, longitude: 127.3032 },
      { id: "taketomi", name: "다케토미초", latitude: 24.3238, longitude: 124.0867 },
    ],
  },
];

export const japanCities: JapanCity[] = cityRegionGroups.map(({ id, city }) => ({
  id,
  label: city,
}));

export const japanRegions: JapanRegion[] = cityRegionGroups.flatMap(
  ({ id: cityId, city, latitude, longitude, areas }) =>
    areas.map((area) => ({
      id: `${cityId}-${area.id}`,
      cityId,
      city,
      area: area.name,
      label: `${city} · ${area.name}`,
      latitude: area.latitude ?? latitude,
      longitude: area.longitude ?? longitude,
    })),
);

export const defaultJapanRegion = japanRegions[0];

export function getJapanRegion(regionId: string) {
  return japanRegions.find((region) => region.id === regionId) ?? defaultJapanRegion;
}

export function getJapanRegionsByCity(cityId: string) {
  return japanRegions.filter((region) => region.cityId === cityId);
}

