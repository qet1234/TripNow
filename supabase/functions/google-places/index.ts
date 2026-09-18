import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

function isProjectClient(req: Request) {
  const apikey = req.headers.get("apikey")?.trim();
  const authorization = req.headers.get("authorization")?.trim();
  return Boolean(apikey || authorization?.startsWith("Bearer "));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "POST 요청만 지원합니다." }, 405);
  }
  if (!isProjectClient(req)) {
    return json({ error: "TripNow 클라이언트 인증 정보가 없습니다." }, 401);
  }

  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return json({ error: "Google Places 서버 키가 설정되지 않았습니다." }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "요청 본문 형식이 올바르지 않습니다." }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";

  try {
    if (action === "autocomplete") {
      const input = typeof body.input === "string" ? body.input.trim() : "";
      if (input.length < 2) return json({ data: { suggestions: [] } });

      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);
      const payload: Record<string, unknown> = {
        input,
        includedRegionCodes: ["jp"],
        languageCode: "ko",
      };

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        payload.locationBias = {
          circle: {
            center: { latitude, longitude },
            radius: 50000,
          },
        };
      }

      const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify(payload),
      });

      const upstream = await response.json();
      if (!response.ok) {
        console.error("Places autocomplete error", upstream);
        return json({ error: "Google Places 자동완성 요청에 실패했습니다." }, 502);
      }

      const suggestions = Array.isArray(upstream.suggestions)
        ? upstream.suggestions
            .map((item: any) => item?.placePrediction)
            .filter(Boolean)
            .slice(0, 6)
            .map((prediction: any) => ({
              placeId: prediction.placeId ?? "",
              text: prediction.text?.text ?? "",
              mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? "",
              secondaryText: prediction.structuredFormat?.secondaryText?.text ?? "",
            }))
            .filter((item: any) => item.placeId && item.text)
        : [];

      return json({ data: { suggestions } });
    }

    if (action === "details") {
      const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
      if (!placeId) return json({ error: "placeId가 필요합니다." }, 400);

      const fields = [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "googleMapsUri",
      ].join(",");
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ko`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": fields,
          },
        },
      );

      const upstream = await response.json();
      if (!response.ok) {
        console.error("Places details error", upstream);
        return json({ error: "Google Places 상세정보 요청에 실패했습니다." }, 502);
      }

      const latitude = Number(upstream.location?.latitude);
      const longitude = Number(upstream.location?.longitude);
      if (!upstream.id || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return json({ error: "장소 좌표를 확인할 수 없습니다." }, 502);
      }

      return json({
        data: {
          placeId: upstream.id,
          name: upstream.displayName?.text ?? "",
          address: upstream.formattedAddress ?? "",
          latitude,
          longitude,
          googleMapsUri: upstream.googleMapsUri ?? "",
        },
      });
    }


    if (action === "nearby") {
      const category = typeof body.category === "string" ? body.category.trim() : "";
      const allowedTypes: Record<string, string[]> = {
        food: ["restaurant"],
        cafe: ["cafe"],
        tourism: ["tourist_attraction"],
        shopping: ["shopping_mall", "department_store"],
      };
      const includedTypes = allowedTypes[category];
      if (!includedTypes) {
        return json({ error: "지원하지 않는 장소 카테고리입니다." }, 400);
      }

      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < 24 ||
        latitude > 46 ||
        longitude < 122 ||
        longitude > 146
      ) {
        return json({ error: "지원 지역의 좌표가 아닙니다." }, 400);
      }

      const cacheKey = `${category}:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
      const globalCache = globalThis as typeof globalThis & {
        __tripnowPlacesCache?: Map<string, { expiresAt: number; places: unknown[] }>;
      };
      const cache =
        globalCache.__tripnowPlacesCache ??
        (globalCache.__tripnowPlacesCache = new Map());
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return json({ data: { places: cached.places, cached: true } });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      let response: Response;
      try {
        response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.primaryType,places.types",
          },
          body: JSON.stringify({
            includedTypes,
            maxResultCount: 10,
            rankPreference: "POPULARITY",
            languageCode: "ko",
            regionCode: "JP",
            locationRestriction: {
              circle: {
                center: { latitude, longitude },
                radius: 3000,
              },
            },
          }),
        });
      } finally {
        clearTimeout(timeout);
      }

      const upstream = await response.json();
      if (!response.ok) {
        console.error("Places nearby error", response.status, upstream?.error?.status);
        return json({ error: "Google Places 주변 장소 요청에 실패했습니다." }, 502);
      }

      const places = Array.isArray(upstream.places)
        ? upstream.places
            .slice(0, 10)
            .map((place: any) => ({
              placeId: typeof place?.id === "string" ? place.id : "",
              name: place?.displayName?.text ?? "",
              address: place?.formattedAddress ?? "",
              latitude: Number(place?.location?.latitude),
              longitude: Number(place?.location?.longitude),
              googleMapsUri: place?.googleMapsUri ?? "",
              primaryType: place?.primaryType ?? "",
              types: Array.isArray(place?.types) ? place.types.slice(0, 6) : [],
            }))
            .filter(
              (place: any) =>
                place.placeId &&
                place.name &&
                Number.isFinite(place.latitude) &&
                Number.isFinite(place.longitude),
            )
        : [];

      cache.set(cacheKey, {
        expiresAt: Date.now() + 5 * 60 * 1000,
        places,
      });

      return json({ data: { places, cached: false } });
    }

    return json({ error: "지원하지 않는 action입니다." }, 400);
  } catch (error) {
    console.error("google-places function error", error);
    return json({ error: "장소 서비스 처리 중 오류가 발생했습니다." }, 500);
  }
});
