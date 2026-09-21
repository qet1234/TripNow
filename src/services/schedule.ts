import type { ScheduleItem } from "@/src/context/ScheduleContext";

export type HomeScheduleKind = "today" | "upcoming" | "saved" | "empty";

export type HomeScheduleSelection = {
  kind: HomeScheduleKind;
  day: number;
  date: string;
  schedules: ScheduleItem[];
  nextSchedule?: ScheduleItem;
};

export function getLocalIsoDate(now = new Date()) {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidScheduleDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function scheduleTimestamp(item: ScheduleItem) {
  if (!isValidScheduleDate(item.date)) return Number.POSITIVE_INFINITY;
  const time = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(item.time);
  if (!time) return Number.POSITIVE_INFINITY;

  const [year, month, day] = item.date.split("-").map(Number);
  return new Date(year, month - 1, day, Number(time[1]), Number(time[2])).getTime();
}

function sortByDateTime(items: ScheduleItem[]) {
  return [...items].sort((a, b) => {
    const timestampDifference = scheduleTimestamp(a) - scheduleTimestamp(b);
    if (timestampDifference !== 0) return timestampDifference;
    if (a.day !== b.day) return a.day - b.day;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function selectHomeSchedules(
  schedules: ScheduleItem[],
  now = new Date(),
): HomeScheduleSelection {
  if (schedules.length === 0) {
    return { kind: "empty", day: 1, date: "", schedules: [] };
  }

  const sorted = sortByDateTime(schedules);
  const today = getLocalIsoDate(now);
  const todaySchedules = sorted.filter((item) => item.date === today);
  const upcoming = sorted.filter((item) => {
    const timestamp = scheduleTimestamp(item);
    return Number.isFinite(timestamp) && timestamp >= now.getTime();
  });

  if (todaySchedules.length > 0) {
    return {
      kind: "today",
      day: todaySchedules[0].day,
      date: today,
      schedules: todaySchedules,
      nextSchedule: upcoming[0] ?? todaySchedules[todaySchedules.length - 1],
    };
  }

  if (upcoming.length > 0) {
    const first = upcoming[0];
    return {
      kind: "upcoming",
      day: first.day,
      date: first.date,
      schedules: sorted.filter(
        (item) => item.date === first.date && item.day === first.day,
      ),
      nextSchedule: first,
    };
  }

  const first = sorted[0];
  return {
    kind: "saved",
    day: first.day,
    date: first.date,
    schedules: sorted.filter(
      (item) => item.date === first.date && item.day === first.day,
    ),
    nextSchedule: first,
  };
}
