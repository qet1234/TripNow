import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { checkJapanPresenceLocally, type JapanPresenceResult } from "@/src/services/location";

export type TravelMode = "preview" | "local";

type TravelModeContextValue = {
  mode: TravelMode;
  selectedRegionId: string;
  setSelectedRegionId: (regionId: string) => void;
  setMode: (mode: TravelMode) => void;
  confirmJapanPresence: () => Promise<JapanPresenceResult>;
};

const MODE_KEY = "tripnow:travel-mode";
const REGION_KEY = "tripnow:selected-region";
const DEFAULT_REGION_ID = "tokyo-shibuya";

const TravelModeContext = createContext<TravelModeContextValue | null>(null);

export function TravelModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<TravelMode>("preview");
  const [selectedRegionId, setRegionState] = useState(DEFAULT_REGION_ID);

  useEffect(() => {
    void (async () => {
      const [savedMode, savedRegion] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(REGION_KEY),
      ]);

      if (savedMode === "preview" || savedMode === "local") {
        setModeState(savedMode);
      }
      if (savedRegion) {
        setRegionState(savedRegion);
      }
    })();
  }, []);

  const setMode = (nextMode: TravelMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(MODE_KEY, nextMode);
  };

  const setSelectedRegionId = (regionId: string) => {
    setRegionState(regionId);
    void AsyncStorage.setItem(REGION_KEY, regionId);
  };

  const confirmJapanPresence = async () => {
    const result = await checkJapanPresenceLocally();

    if (result === "japan") {
      setMode("local");
    } else if (result === "outside-japan") {
      setMode("preview");
    }

    return result;
  };

  const value = useMemo(
    () => ({
      mode,
      selectedRegionId,
      setSelectedRegionId,
      setMode,
      confirmJapanPresence,
    }),
    [mode, selectedRegionId],
  );

  return (
    <TravelModeContext.Provider value={value}>
      {children}
    </TravelModeContext.Provider>
  );
}

export function useTravelMode() {
  const context = useContext(TravelModeContext);

  if (!context) {
    throw new Error("useTravelMode must be used inside TravelModeProvider.");
  }

  return context;
}
