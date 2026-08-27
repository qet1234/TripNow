import { requireOptionalNativeModule } from "expo";

export type TransitLiveUpdatePayload = {
  lineName: string;
  direction: string;
  departureTime: string;
  arrivalTime: string;
  nextStation: string;
  remainingStops: number;
  progress: number;
  statusText?: string;
};

export type TransitLiveUpdateSupport = {
  android: boolean;
  androidVersion: number;
  notificationsEnabled: boolean;
  liveUpdateEligible: boolean;
};

export type TripNowLiveTransitNativeModule = {
  getSupportInfo(): TransitLiveUpdateSupport;
  requestNotificationPermission(): boolean;
  start(
    lineName: string,
    direction: string,
    departureTime: string,
    arrivalTime: string,
    nextStation: string,
    remainingStops: number,
    progress: number,
    statusText: string,
  ): boolean;
  update(
    lineName: string,
    direction: string,
    departureTime: string,
    arrivalTime: string,
    nextStation: string,
    remainingStops: number,
    progress: number,
    statusText: string,
  ): boolean;
  stop(finalMessage: string): boolean;
};

export default requireOptionalNativeModule<TripNowLiveTransitNativeModule>(
  "TripNowLiveTransit",
);
