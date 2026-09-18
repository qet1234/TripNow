export type TravelCountry = "JP";

export type TripSummary = {
  country: TravelCountry;
  countryName: string;
  city: string;
  day: number;
  localTime: string;
  temperatureC: number;
  weatherLabel: string;
  jpy100ToKrw: number;
};

export type PlaceCategory =
  | "tourism"
  | "food"
  | "cafe"
  | "shopping"
  | "police"
  | "hospital";

export type PlacePreview = {
  id: string;
  name: string;
  category: PlaceCategory;
  cityId: string;
  regionId: string;
  areaLabel: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  openNow?: boolean;
  hoursLabel?: string;
  mapQuery: string;
  tags: string[];
};
