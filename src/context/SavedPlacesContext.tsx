import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PlacePreview } from "@/src/types/travel";

type SavedPlacesContextValue = {
  savedPlaces: PlacePreview[];
  hydrated: boolean;
  isSaved: (placeId: string) => boolean;
  toggleSaved: (place: PlacePreview) => void;
};

const STORAGE_KEY = "tripnow:saved-places:v1";
const SavedPlacesContext = createContext<SavedPlacesContextValue | null>(null);

export function SavedPlacesProvider({ children }: PropsWithChildren) {
  const [savedPlaces, setSavedPlaces] = useState<PlacePreview[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (Array.isArray(parsed)) setSavedPlaces(parsed as PlacePreview[]);
      } catch {
        setSavedPlaces([]);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlaces));
  }, [hydrated, savedPlaces]);

  const value = useMemo<SavedPlacesContextValue>(
    () => ({
      savedPlaces,
      hydrated,
      isSaved: (placeId) => savedPlaces.some((place) => place.id === placeId),
      toggleSaved: (place) => {
        setSavedPlaces((current) =>
          current.some((item) => item.id === place.id)
            ? current.filter((item) => item.id !== place.id)
            : [place, ...current],
        );
      },
    }),
    [hydrated, savedPlaces],
  );

  return <SavedPlacesContext.Provider value={value}>{children}</SavedPlacesContext.Provider>;
}

export function useSavedPlaces() {
  const context = useContext(SavedPlacesContext);
  if (!context) throw new Error("useSavedPlaces must be used inside SavedPlacesProvider.");
  return context;
}
