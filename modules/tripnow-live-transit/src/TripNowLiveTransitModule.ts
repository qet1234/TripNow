import { requireNativeModule } from "expo-modules-core";

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

type SupportInfo = {
  android: boolean;
  androidVersion: number;
  notificationsEnabled: boolean;
  liveUpdateEligible: boolean;
};

type TripNowLiveTransitNativeModule = {
  getSupportInfo(): SupportInfo;
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

export default requireNativeModule<TripNowLiveTransitNativeModule>(
  "TripNowLiveTransit",
);
