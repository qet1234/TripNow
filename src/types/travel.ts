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
  distanceMeters: number;
  walkingMinutes: number;
  openNow?: boolean;
  hoursLabel?: string;
};
