import { getJapanRegion } from "@/src/data/japanRegions";
import { supabase, supabaseConfigured } from "@/src/lib/supabase";

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
