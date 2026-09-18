import { supabase } from "@/src/lib/supabase";

export type AirportFlightDirection = "departure" | "arrival";

export type AirportFlightStatus = {
  direction: AirportFlightDirection;
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

type Query = {
  direction: AirportFlightDirection;
  flightId: string;
};

function textField(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalizeTime(value: unknown) {
  const digits = textField(value).replace(/\D/g, "");
  if (digits.length !== 4) return textField(value);
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function normalizeTerminal(value: unknown) {
  const terminal = textField(value).toUpperCase();
  if (terminal === "P01" || terminal === "T1" || terminal === "1") return "1";
  if (terminal === "P03" || terminal === "T2" || terminal === "2") return "2";
  if (terminal === "P02") return "탑승동";
  return terminal.replace(/^(TERMINAL|터미널)\s*/i, "") || "1";
}

export async function getIncheonFlightStatus({
  direction,
  flightId,
}: Query): Promise<AirportFlightStatus> {
  const normalizedFlightId = flightId.toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(normalizedFlightId)) {
    throw new Error("항공편 번호를 확인해 주세요.");
  }

  const { data, error } = await supabase.functions.invoke(
    "incheon-flight-status",
    {
      body: {
        direction,
        flightId: normalizedFlightId,
      },
    },
  );

  if (error) {
    throw new Error("실시간 운항정보를 불러오지 못했습니다.");
  }

  const flight =
    data && typeof data === "object" && "flight" in data
      ? (data.flight as Record<string, unknown>)
      : null;

  if (!flight) {
    throw new Error("일치하는 당일 항공편을 찾지 못했습니다.");
  }

  return {
    direction,
    flightId: textField(flight.flightId) || normalizedFlightId,
    airline: textField(flight.airline),
    scheduledTime: normalizeTime(flight.scheduledTime),
    estimatedTime: normalizeTime(flight.estimatedTime),
    airport: textField(flight.airport),
    airportCode: textField(flight.airportCode),
    gate: textField(flight.gate),
    checkinCounter: textField(flight.checkinCounter),
    carousel: textField(flight.carousel),
    exit: textField(flight.exit),
    remark: textField(flight.remark),
    terminal: normalizeTerminal(flight.terminal),
    refreshedAt: textField(flight.refreshedAt) || new Date().toISOString(),
  };
}
