import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2.111.0/cors";

type Phase = "departure" | "arrival";
type CongestionItem = {
  id: string;
  label: string;
  zone: string;
  waitingPeople: number;
  korean: number;
  foreigner: number;
  flightId: string;
  gate: string;
  observedAt: string;
};

type CongestionPayload = {
  phase: Phase;
  terminal: "1" | "2";
  availability: "live" | "unsupported";
  items: CongestionItem[];
  sourceNotice: string;
  refreshedAt: string;
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expiresAt: number; value: CongestionPayload }>();

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

function numberValue(value: unknown) {
  const number = Number(clean(value).replace(/,/g, ""));
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function pick(item: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = clean(item[key]);
    if (value) return value;
  }
  return "";
}

function normalizeServiceKey(value: string) {
  try {
    return value.includes("%") ? decodeURIComponent(value) : value;
  } catch {
    return value;
  }
}

function itemList(payload: Record<string, unknown>) {
  const response = payload.response && typeof payload.response === "object"
    ? payload.response as Record<string, unknown>
    : payload;
  const body = response.body && typeof response.body === "object"
    ? response.body as Record<string, unknown>
    : response;
  const items = body.items && typeof body.items === "object"
    ? body.items as Record<string, unknown>
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

function resultCode(payload: Record<string, unknown>) {
  const response = payload.response && typeof payload.response === "object"
    ? payload.response as Record<string, unknown>
    : payload;
  const header = response.header && typeof response.header === "object"
    ? response.header as Record<string, unknown>
    : response;
  return pick(header, "resultCode", "resultcode");
}

function arrivalItems(rows: Record<string, unknown>[], requestedFlightId: string) {
  const normalizedFlightId = requestedFlightId.toUpperCase().replace(/\s+/g, "");
  const matchingRows = normalizedFlightId
    ? rows.filter((row) => pick(row, "flightid", "flightId").toUpperCase().replace(/\s+/g, "") === normalizedFlightId)
    : rows;
  const sourceRows = matchingRows.length > 0 ? matchingRows : rows;
  const groups = new Map<string, CongestionItem>();

  for (const [index, row] of sourceRows.entries()) {
    const entryGate = pick(row, "entrygate", "entryGate") || "확인 중";
    const korean = numberValue(row.korean);
    const foreigner = numberValue(row.foreigner);
    const current = groups.get(entryGate);
    if (current) {
      current.korean += korean;
      current.foreigner += foreigner;
      current.waitingPeople += korean + foreigner;
      continue;
    }
    groups.set(entryGate, {
      id: `arrival-${entryGate}-${index}`,
      label: `입국장 ${entryGate}`,
      zone: pick(row, "airport"),
      waitingPeople: korean + foreigner,
      korean,
      foreigner,
      flightId: pick(row, "flightid", "flightId"),
      gate: pick(row, "gatenumber", "gateNumber"),
      observedAt: pick(row, "estimatedtime", "estimatedTime"),
    });
  }
  return [...groups.values()].slice(0, 6);
}

function departureItems(rows: Record<string, unknown>[]) {
  return rows.slice(0, 6).map((row, index) => {
    const hall = pick(row, "gateId", "gateid", "departureHall", "departurehall", "hallNo", "hallno", "gateNo", "gateno", "gate");
    const waitTime = numberValue(pick(row, "waitTime", "waittime"));
    const operatingTime = pick(row, "operatingTime", "operatingtime");
    return {
      id: `departure-${hall || index}`,
      label: hall ? `출국장 ${hall}` : `출국장 ${index + 1}`,
      zone: [waitTime > 0 ? `예상 대기 ${waitTime}분` : "", operatingTime ? `운영 ${operatingTime}` : ""]
        .filter(Boolean)
        .join(" · "),
      waitingPeople: numberValue(pick(row, "waitLength", "waitlength", "waitCount", "waitcount", "waitingCount", "waitingcount", "passengerCount", "passengercount")),
      korean: 0,
      foreigner: 0,
      flightId: "",
      gate: "",
      observedAt: pick(row, "occurtime", "occurTime", "occurredAt", "occurredat", "recordedAt", "recordedat", "createdAt", "createdat"),
    };
  });
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
    const phase: Phase = body?.phase === "arrival" ? "arrival" : "departure";
    const terminal: "1" | "2" = body?.terminal === "2" ? "2" : "1";
    const airportCode = clean(body?.airportCode).toUpperCase();
    const flightId = clean(body?.flightId).toUpperCase().replace(/\s+/g, "");

    if (airportCode && !/^[A-Z]{3}$/.test(airportCode)) {
      return jsonResponse({ error: "공항 코드 형식이 올바르지 않습니다." }, 400);
    }
    if (flightId && !/^[A-Z0-9]{2,3}\d{1,4}$/.test(flightId)) {
      return jsonResponse({ error: "항공편 번호 형식이 올바르지 않습니다." }, 400);
    }

    if (phase === "departure" && terminal === "2") {
      return jsonResponse({
        phase,
        terminal,
        availability: "unsupported",
        items: [],
        sourceNotice: "공식 출국장 혼잡도 API는 현재 제1여객터미널만 제공합니다.",
        refreshedAt: new Date().toISOString(),
      } satisfies CongestionPayload);
    }

    const cacheKey = `${phase}:${terminal}:${airportCode}:${flightId}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return jsonResponse({ ...cached.value, cached: true });
    }

    const secretName = phase === "arrival"
      ? "DATA_GO_KR_ARRIVAL_CONGESTION_SERVICE_KEY"
      : "DATA_GO_KR_DEPARTURE_CONGESTION_SERVICE_KEY";
    const rawServiceKey = Deno.env.get(secretName)?.trim();
    if (!rawServiceKey) {
      return jsonResponse({
        error: phase === "arrival"
          ? "입국장 현황 API 인증키가 아직 설정되지 않았습니다."
          : "출국장 혼잡도 API 인증키가 아직 설정되지 않았습니다.",
      }, 503);
    }

    const url = phase === "arrival"
      ? new URL("https://apis.data.go.kr/B551177/StatusOfArrivals/getArrivalsCongestion")
      : new URL(Deno.env.get("DATA_GO_KR_DEPARTURE_CONGESTION_URL")?.trim() || "https://apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion");
    url.searchParams.set("serviceKey", normalizeServiceKey(rawServiceKey));

    if (phase === "arrival") {
      url.searchParams.set("numOfRows", "100");
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("terno", `T${terminal}`);
      if (airportCode) url.searchParams.set("airport", airportCode);
      url.searchParams.set("type", "json");
    } else {
      url.searchParams.set("numOfRows", "10");
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("terminalId", "P01");
      url.searchParams.set("type", "json");
    }

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    const raw = await upstream.text();
    if (!upstream.ok) {
      return jsonResponse({ error: "인천공항 혼잡도 제공 서버가 응답하지 않습니다." }, 502);
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "인천공항 혼잡도 응답 형식을 확인할 수 없습니다." }, 502);
    }

    const upstreamCode = resultCode(payload);
    if (upstreamCode && upstreamCode !== "00") {
      return jsonResponse({ error: "인천공항 혼잡도 API 요청이 승인되지 않았습니다." }, 502);
    }

    const rows = itemList(payload);
    const value: CongestionPayload = {
      phase,
      terminal,
      availability: "live",
      items: phase === "arrival" ? arrivalItems(rows, flightId) : departureItems(rows),
      sourceNotice: phase === "departure"
        ? "제1여객터미널 출국장 대기 인원"
        : "현재 시각 전후 2시간 입국장 대기 인원",
      refreshedAt: new Date().toISOString(),
    };
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value });
    return jsonResponse({ ...value, cached: false });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return jsonResponse({ error: "인천공항 혼잡도 조회 시간이 초과되었습니다." }, 504);
    }
    return jsonResponse({ error: "공항 혼잡도를 처리하지 못했습니다." }, 500);
  }
});
