import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2.111.0/cors";

type Direction = "departure" | "arrival";

type FlightPayload = {
  direction: Direction;
  flightId: string;
  airline: string;
  scheduledTime: string;
  estimatedTime: string;
  airport: string;
  airportCode: string;
  gate: string;
  checkinCounter: string;
  carousel: string;
  exit: string;
  remark: string;
  terminal: string;
  refreshedAt: string;
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expiresAt: number; flight: FlightPayload }>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clean(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalizeFlightId(value: unknown) {
  return clean(value).toUpperCase().replace(/\s+/g, "");
}

function itemList(payload: Record<string, unknown>) {
  const response =
    payload.response && typeof payload.response === "object"
      ? (payload.response as Record<string, unknown>)
      : payload;
  const body =
    response.body && typeof response.body === "object"
      ? (response.body as Record<string, unknown>)
      : response;
  const items =
    body.items && typeof body.items === "object"
      ? (body.items as Record<string, unknown>)
      : body;
  const rawItems = "item" in items ? items.item : items;

  if (Array.isArray(rawItems)) {
    return rawItems.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    );
  }
  if (rawItems && typeof rawItems === "object") {
    return [rawItems as Record<string, unknown>];
  }
  return [];
}

function pick(item: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = clean(item[key]);
    if (value) return value;
  }
  return "";
}

function upstreamResultCode(payload: Record<string, unknown>) {
  const response =
    payload.response && typeof payload.response === "object"
      ? (payload.response as Record<string, unknown>)
      : payload;
  const header =
    response.header && typeof response.header === "object"
      ? (response.header as Record<string, unknown>)
      : response;
  return pick(header, "resultCode", "resultcode");
}

function normalizeServiceKey(value: string) {
  try {
    return value.includes("%") ? decodeURIComponent(value) : value;
  } catch {
    return value;
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "POST 요청만 지원합니다." }, 405);
  }

  try {
    const body = await request.json();
    const direction: Direction =
      body?.direction === "arrival" ? "arrival" : "departure";
    const flightId = normalizeFlightId(body?.flightId);

    if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(flightId)) {
      return jsonResponse({ error: "항공편 번호 형식이 올바르지 않습니다." }, 400);
    }

    const cacheKey = `${direction}:${flightId}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return jsonResponse({ flight: cached.flight, cached: true });
    }

    const rawServiceKey = Deno.env.get("DATA_GO_KR_SERVICE_KEY")?.trim();
    if (!rawServiceKey) {
      return jsonResponse(
        { error: "인천공항 API 인증키가 아직 설정되지 않았습니다." },
        503,
      );
    }

    const operation =
      direction === "arrival"
        ? "getPassengerArrivalsOdp"
        : "getPassengerDeparturesOdp";
    const url = new URL(
      `https://apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/${operation}`,
    );
    url.searchParams.set("serviceKey", normalizeServiceKey(rawServiceKey));
    url.searchParams.set("from_time", "0000");
    url.searchParams.set("to_time", "2400");
    url.searchParams.set("flight_id", flightId);
    url.searchParams.set("lang", "K");
    url.searchParams.set("type", "json");

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    const raw = await upstream.text();

    if (!upstream.ok) {
      return jsonResponse({ error: "인천공항 정보 제공 서버가 응답하지 않습니다." }, 502);
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "인천공항 응답 형식을 확인할 수 없습니다." }, 502);
    }

    const resultCode = upstreamResultCode(payload);
    if (resultCode && resultCode !== "00") {
      return jsonResponse({ error: "인천공항 API 요청이 승인되지 않았습니다." }, 502);
    }

    const item = itemList(payload).find((candidate) => {
      const candidateFlight = normalizeFlightId(
        pick(candidate, "flightId", "flightid"),
      );
      const masterFlight = normalizeFlightId(
        pick(candidate, "masterflightid", "masterFlightId"),
      );
      return candidateFlight === flightId || masterFlight === flightId;
    });

    if (!item) {
      return jsonResponse({ error: "일치하는 당일 항공편을 찾지 못했습니다." }, 404);
    }

    const flight: FlightPayload = {
      direction,
      flightId: normalizeFlightId(pick(item, "flightId", "flightid")) || flightId,
      airline: pick(item, "airline", "airlineKorean"),
      scheduledTime: pick(item, "scheduleDateTime", "scheduledatetime"),
      estimatedTime: pick(item, "estimatedDateTime", "estimateddatetime"),
      airport: pick(item, "airport", "airportName"),
      airportCode: pick(item, "airportCode", "airportcode", "cityCode", "citycode"),
      gate: pick(item, "gatenumber", "gateNumber"),
      checkinCounter: pick(
        item,
        "chkinrange",
        "checkinCounter",
        "checkincounter",
        "counter",
      ),
      carousel: pick(item, "carousel", "carouselNumber"),
      exit: pick(item, "exitnumber", "exitNumber"),
      remark: pick(item, "remark", "status"),
      terminal: pick(item, "terminalId", "terminalid", "terno"),
      refreshedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      flight,
    });

    return jsonResponse({ flight, cached: false });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return jsonResponse({ error: "인천공항 정보 조회 시간이 초과되었습니다." }, 504);
    }
    return jsonResponse({ error: "실시간 운항정보를 처리하지 못했습니다." }, 500);
  }
});
