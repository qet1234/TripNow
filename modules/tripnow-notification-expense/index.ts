import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

export type PaymentNotificationCandidate = {
  id: string;
  amount: number;
  currency: "JPY" | "KRW";
  merchant: string;
  timestamp: number;
};

type TripNowNotificationExpenseNativeModule = {
  isNotificationAccessEnabled(): Promise<boolean>;
  openNotificationAccessSettings(): Promise<void>;
  getPendingCandidates(): Promise<PaymentNotificationCandidate[]>;
  removeCandidate(id: string): Promise<void>;
  clearCandidates(): Promise<void>;
};

const nativeModule =
  Platform.OS === "android"
    ? requireOptionalNativeModule<TripNowNotificationExpenseNativeModule>(
        "TripNowNotificationExpense",
      )
    : null;

export function isPaymentNotificationCaptureAvailable() {
  return Platform.OS === "android" && nativeModule != null;
}

export async function isPaymentNotificationAccessEnabled() {
  if (!nativeModule) return false;
  return nativeModule.isNotificationAccessEnabled();
}

export async function openPaymentNotificationAccessSettings() {
  if (!nativeModule) {
    throw new Error("결제 알림 자동 감지는 Android 설치 앱에서만 사용할 수 있습니다.");
  }
  await nativeModule.openNotificationAccessSettings();
}

export async function getPendingPaymentNotifications() {
  if (!nativeModule) return [] as PaymentNotificationCandidate[];
  return nativeModule.getPendingCandidates();
}

export async function removePendingPaymentNotification(id: string) {
  if (!nativeModule) return;
  await nativeModule.removeCandidate(id);
}

export async function clearPendingPaymentNotifications() {
  if (!nativeModule) return;
  await nativeModule.clearCandidates();
}
