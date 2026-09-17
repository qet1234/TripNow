import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AirportFlightPlan = {
  outboundDate: string;
  outboundTime: string;
  outboundFlight: string;
  outboundTerminal: string;
  outboundDestination: string;
  returnDate: string;
  returnTime: string;
  returnFlight: string;
  returnTerminal: string;
  returnOrigin: string;
};

export type AirportPhase = "departure" | "arrival" | "none";

type AirportContextValue = {
  plan: AirportFlightPlan;
  phase: AirportPhase;
  hydrated: boolean;
  savePlan: (plan: AirportFlightPlan) => Promise<void>;
  clearPlan: () => Promise<void>;
};

export const emptyAirportFlightPlan: AirportFlightPlan = {
  outboundDate: "",
  outboundTime: "",
  outboundFlight: "",
  outboundTerminal: "",
  outboundDestination: "",
  returnDate: "",
  returnTime: "",
  returnFlight: "",
  returnTerminal: "",
  returnOrigin: "",
};

const STORAGE_KEY = "tripnow:airport-flight-plan:v1";
const AirportContext = createContext<AirportContextValue | null>(null);

function normalizePlan(plan: AirportFlightPlan): AirportFlightPlan {
  return Object.fromEntries(
    Object.entries(plan).map(([key, value]) => [key, String(value ?? "").trim()]),
  ) as AirportFlightPlan;
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function todayIsoDate(now: Date) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getAirportPhase(
  plan: AirportFlightPlan,
  now = new Date(),
): AirportPhase {
  const today = todayIsoDate(now);
  if (isValidIsoDate(plan.outboundDate) && plan.outboundDate === today) {
    return "departure";
  }
  if (isValidIsoDate(plan.returnDate) && plan.returnDate === today) {
    return "arrival";
  }
  return "none";
}

export function AirportProvider({ children }: PropsWithChildren) {
  const [plan, setPlan] = useState<AirportFlightPlan>(emptyAirportFlightPlan);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AirportFlightPlan>;
          setPlan(normalizePlan({ ...emptyAirportFlightPlan, ...parsed }));
        }
      } catch {
        setPlan(emptyAirportFlightPlan);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const savePlan = async (nextPlan: AirportFlightPlan) => {
    const normalized = normalizePlan(nextPlan);
    setPlan(normalized);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  };

  const clearPlan = async () => {
    setPlan(emptyAirportFlightPlan);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const phase = getAirportPhase(plan);

  const value = useMemo(
    () => ({ plan, phase, hydrated, savePlan, clearPlan }),
    [plan, phase, hydrated],
  );

  return <AirportContext.Provider value={value}>{children}</AirportContext.Provider>;
}

export function useAirportJourney() {
  const context = useContext(AirportContext);
  if (!context) {
    throw new Error("useAirportJourney must be used inside AirportProvider.");
  }
  return context;
}
