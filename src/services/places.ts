import { getJapanRegion } from "@/src/data/japanRegions";
import { supabase, supabaseConfigured } from "@/src/lib/supabase";
import type { PlaceCategory, PlacePreview } from "@/src/types/travel";

export type PlaceSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUri?: string;
};

type FunctionResponse<T> = {
  data?: T;
  error?: string;
};

export async function autocompleteJapanPlaces(input: string, regionId: string) {
  const query = input.trim();
  if (query.length < 2) return [] as PlaceSuggestion[];
  if (!supabaseConfigured) {
    throw new Error("실시간 장소 검색은 API 키 등록 후 사용할 수 있습니다. 탐색의 추천 장소를 이용해 주세요.");
  }

  const region = getJapanRegion(regionId);
  const { data, error } = await supabase.functions.invoke<FunctionResponse<{ suggestions: PlaceSuggestion[] }>>(
    "google-places",
    {
      body: {
        action: "autocomplete",
        input: query,
        latitude: region.latitude,
        longitude: region.longitude,
      },
    },
  );

  if (error) {
    throw new Error(error.message || "장소 자동완성 요청에 실패했습니다.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data?.suggestions ?? [];
}

export async function fetchJapanPlaceDetails(placeId: string) {
  if (!supabaseConfigured) {
    throw new Error("실시간 장소 상세정보는 API 키 등록 후 사용할 수 있습니다. 탐색의 추천 장소를 이용해 주세요.");
  }
  const { data, error } = await supabase.functions.invoke<FunctionResponse<PlaceDetails>>(
    "google-places",
    {
      body: {
        action: "details",
        placeId,
      },
    },
  );

  if (error) {
    throw new Error(error.message || "장소 상세정보 요청에 실패했습니다.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.data) {
    throw new Error("장소 상세정보를 찾지 못했습니다.");
  }

  return data.data;
}


type NearbyPlace = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
};

function typeLabel(value: string) {
  return value.replaceAll("_", " ").trim();
}

export async function fetchNearbyJapanPlaces(
  regionId: string,
  category: PlaceCategory,
): Promise<PlacePreview[]> {
  if (!supabaseConfigured) return [];

  const region = getJapanRegion(regionId);
  const { data, error } = await supabase.functions.invoke<
    FunctionResponse<{ places: NearbyPlace[]; cached?: boolean }>
  >("google-places", {
    body: {
      action: "nearby",
      category,
      latitude: region.latitude,
      longitude: region.longitude,
    },
  });

  if (error) {
    throw new Error(error.message || "주변 장소 요청에 실패했습니다.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  const seen = new Set<string>();

  return (data?.data?.places ?? [])
    .filter((place) => {
      if (!place.placeId || !place.name || seen.has(place.placeId)) return false;
      if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return false;
      if (
        Math.abs(place.latitude - region.latitude) > 0.08 ||
        Math.abs(place.longitude - region.longitude) > 0.1
      ) {
        return false;
      }
      seen.add(place.placeId);
      return true;
    })
    .map((place) => ({
      id: place.placeId,
      name: place.name,
      category,
      cityId: region.cityId,
      regionId: region.id,
      areaLabel: region.label,
      address: place.address,
      description: "Google Places에서 불러온 장소입니다.",
      latitude: place.latitude,
      longitude: place.longitude,
      hoursLabel: "영업시간은 Google Maps에서 확인",
      mapQuery: [place.name, place.address].filter(Boolean).join(" "),
      tags: [place.primaryType ?? "", ...(place.types ?? [])]
        .filter(Boolean)
        .map(typeLabel)
        .filter((value, index, values) => values.indexOf(value) === index)
        .slice(0, 3),
    }));
}
