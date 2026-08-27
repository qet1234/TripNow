import TripNowLiveTransitNative, {
  type TransitLiveUpdatePayload,
  type TransitLiveUpdateSupport,
  type TransitNotificationDisplayMode,
} from "./src/TripNowLiveTransitModule";

export type {
  TransitLiveUpdatePayload,
  TransitLiveUpdateSupport,
  TransitNotificationDisplayMode,
};

const unsupported: TransitLiveUpdateSupport = {
  android: false,
  galaxy: false,
  manufacturer: "unknown",
  androidVersion: 0,
  notificationsEnabled: false,
  liveUpdateEligible: false,
  displayMode: "unsupported",
};

export function getTransitLiveUpdateSupport() {
  return TripNowLiveTransitNative?.getSupportInfo() ?? unsupported;
}

export function requestTransitNotificationPermission() {
  return TripNowLiveTransitNative?.requestNotificationPermission() ?? false;
}

function normalize(payload: TransitLiveUpdatePayload) {
  return {
    ...payload,
    remainingStops: Math.max(0, Math.round(payload.remainingStops)),
    progress: Math.max(0, Math.min(100, Math.round(payload.progress))),
    statusText: payload.statusText ?? "정상 운행",
  };
}

export function startTransitLiveUpdate(payload: TransitLiveUpdatePayload) {
  if (!TripNowLiveTransitNative) return false;

  const p = normalize(payload);
  return TripNowLiveTransitNative.start(
    p.lineName,
    p.direction,
    p.departureTime,
    p.arrivalTime,
    p.nextStation,
    p.remainingStops,
    p.progress,
    p.statusText,
  );
}

export function updateTransitLiveUpdate(payload: TransitLiveUpdatePayload) {
  if (!TripNowLiveTransitNative) return false;

  const p = normalize(payload);
  return TripNowLiveTransitNative.update(
    p.lineName,
    p.direction,
    p.departureTime,
    p.arrivalTime,
    p.nextStation,
    p.remainingStops,
    p.progress,
    p.statusText,
  );
}

export function stopTransitLiveUpdate(finalMessage = "목적지에 도착했습니다.") {
  return TripNowLiveTransitNative?.stop(finalMessage) ?? false;
}
