import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ScheduleItem = {
  id: string;
  regionId: string;
  day: number;
  date: string;
  time: string;
  title: string;
  detail: string;
  placeQuery?: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleDraft = Pick<
  ScheduleItem,
  "regionId" | "day" | "date" | "time" | "title" | "detail" | "placeQuery"
>;

type ScheduleContextValue = {
  schedules: ScheduleItem[];
  hydrated: boolean;
  addSchedule: (draft: ScheduleDraft) => string;
  updateSchedule: (id: string, draft: ScheduleDraft) => void;
  removeSchedule: (id: string) => void;
  getScheduleById: (id: string) => ScheduleItem | undefined;
  getSchedulesByRegion: (regionId: string) => ScheduleItem[];
};

const STORAGE_KEY = "tripnow:schedules:v1";
const ScheduleContext = createContext<ScheduleContextValue | null>(null);

function sortSchedules(items: ScheduleItem[]) {
  return [...items].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function makeScheduleId() {
  return `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeDraft(draft: ScheduleDraft) {
  return {
    ...draft,
    day: Math.max(1, Math.min(4, Math.trunc(draft.day))),
    date: draft.date.trim(),
    time: draft.time.trim(),
    title: draft.title.trim(),
    detail: draft.detail.trim(),
    placeQuery: draft.placeQuery?.trim() ?? "",
  };
}

export function ScheduleProvider({ children }: PropsWithChildren) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setSchedules(sortSchedules(parsed as ScheduleItem[]));
          }
        }
      } catch {
        setSchedules([]);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  }, [hydrated, schedules]);

  const addSchedule = (draft: ScheduleDraft) => {
    const now = new Date().toISOString();
    const id = makeScheduleId();
    const item: ScheduleItem = {
      ...normalizeDraft(draft),
      id,
      createdAt: now,
      updatedAt: now,
    };

    setSchedules((current) => sortSchedules([...current, item]));
    return id;
  };

  const updateSchedule = (id: string, draft: ScheduleDraft) => {
    const now = new Date().toISOString();
    setSchedules((current) =>
      sortSchedules(
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...normalizeDraft(draft),
                updatedAt: now,
              }
            : item,
        ),
      ),
    );
  };

  const removeSchedule = (id: string) => {
    setSchedules((current) => current.filter((item) => item.id !== id));
  };

  const getScheduleById = (id: string) => schedules.find((item) => item.id === id);

  const getSchedulesByRegion = (regionId: string) =>
    sortSchedules(schedules.filter((item) => item.regionId === regionId));

  const value = useMemo(
    () => ({
      schedules,
      hydrated,
      addSchedule,
      updateSchedule,
      removeSchedule,
      getScheduleById,
      getSchedulesByRegion,
    }),
    [hydrated, schedules],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used inside ScheduleProvider.");
  }
  return context;
}
