import { supabase, supabaseConfigured } from "@/src/lib/supabase";

export type AirportCongestionPhase = "departure" | "arrival";

export type AirportCongestionItem = {
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

export type AirportCongestion = {
  phase: AirportCongestionPhase;
  terminal: "1" | "2";
  availability: "live" | "unsupported";
  items: AirportCongestionItem[];
  sourceNotice: string;
  refreshedAt: string;
};

type Query = {
  phase: AirportCongestionPhase;
  terminal: string;
  airportCode?: string;
  flightId?: string;
};

function textField(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function numberField(value: unknown) {
  const number = Number(textField(value).replace(/,/g, ""));
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export async function getIncheonAirportCongestion({
  phase,
  terminal,
  airportCode,
  flightId,
}: Query): Promise<AirportCongestion> {
  if (!supabaseConfigured) {
    throw new Error("공항 API 키 등록 후 실시간 혼잡도를 조회할 수 있습니다.");
  }
  const normalizedTerminal: "1" | "2" = terminal === "2" ? "2" : "1";
  const normalizedAirportCode = airportCode?.trim().toUpperCase() || "";
  const normalizedFlightId = flightId?.trim().toUpperCase().replace(/\s+/g, "") || "";

  const { data, error } = await supabase.functions.invoke(
    "incheon-airport-congestion",
    {
      body: {
        phase,
        terminal: normalizedTerminal,
        airportCode: /^[A-Z]{3}$/.test(normalizedAirportCode)
          ? normalizedAirportCode
          : undefined,
        flightId: /^[A-Z0-9]{2,3}\d{1,4}$/.test(normalizedFlightId)
          ? normalizedFlightId
          : undefined,
      },
    },
  );

  if (error || !data || typeof data !== "object") {
    throw new Error("공항 혼잡도를 불러오지 못했습니다.");
  }

  const payload = data as Record<string, unknown>;
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  return {
    phase,
    terminal: normalizedTerminal,
    availability: payload.availability === "unsupported" ? "unsupported" : "live",
    items: rawItems
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
      .map((item, index) => ({
        id: textField(item.id) || `${phase}-${index}`,
        label: textField(item.label),
        zone: textField(item.zone),
        waitingPeople: numberField(item.waitingPeople),
        korean: numberField(item.korean),
        foreigner: numberField(item.foreigner),
        flightId: textField(item.flightId),
        gate: textField(item.gate),
        observedAt: textField(item.observedAt),
      })),
    sourceNotice: textField(payload.sourceNotice),
    refreshedAt: textField(payload.refreshedAt) || new Date().toISOString(),
  };
}
