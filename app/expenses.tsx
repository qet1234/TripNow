import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "@/src/components/Screen";
import { useExpenses } from "@/src/context/ExpenseContext";
import {
  getPendingPaymentNotifications,
  isPaymentNotificationAccessEnabled,
  isPaymentNotificationCaptureAvailable,
  openPaymentNotificationAccessSettings,
  removePendingPaymentNotification,
  type PaymentNotificationCandidate,
} from "@/modules/tripnow-notification-expense";
import { colors, radius } from "@/src/theme";

function formatMoney(amount: number, currency: "JPY" | "KRW") {
  return currency === "JPY"
    ? `¥${amount.toLocaleString("ko-KR")}`
    : `₩${amount.toLocaleString("ko-KR")}`;
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpensesScreen() {
  const { expenses, confirmNotificationExpense, removeExpense, todayJpyTotal, todayKrwTotal } =
    useExpenses();
  const [accessEnabled, setAccessEnabled] = useState(false);
  const [pending, setPending] = useState<PaymentNotificationCandidate[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (Platform.OS !== "android" || !isPaymentNotificationCaptureAvailable()) {
      setAccessEnabled(false);
      setPending([]);
      return;
    }

    setRefreshing(true);
    try {
      const [enabled, candidates] = await Promise.all([
        isPaymentNotificationAccessEnabled(),
        getPendingPaymentNotifications(),
      ]);
      setAccessEnabled(enabled);
      setPending(candidates);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") void refresh();
      });
      return () => subscription.remove();
    }, [refresh]),
  );

  const confirm = async (candidate: PaymentNotificationCandidate) => {
    confirmNotificationExpense(candidate);
    await removePendingPaymentNotification(candidate.id);
    setPending((current) => current.filter((item) => item.id !== candidate.id));
  };

  const dismiss = async (candidate: PaymentNotificationCandidate) => {
    await removePendingPaymentNotification(candidate.id);
    setPending((current) => current.filter((item) => item.id !== candidate.id));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LOCAL EXPENSE</Text>
          <Text style={styles.title}>여행 경비 자동 기록</Text>
        </View>
        <Pressable accessibilityLabel="결제 알림 후보 새로고침" onPress={() => void refresh()}>
          <MaterialCommunityIcons color={colors.primary} name="refresh" size={24} />
        </Pressable>
      </View>

      <View style={styles.privacyCard}>
        <MaterialCommunityIcons color={colors.teal} name="shield-lock-outline" size={23} />
        <View style={styles.privacyCopy}>
          <Text style={styles.privacyTitle}>기기 안에서만 처리합니다</Text>
          <Text style={styles.privacyText}>
            알림 원문은 저장하지 않습니다. 금액·가맹점·시간만 후보로 남기고,
            사용자가 추가를 누른 항목만 기기 내부에 저장합니다. Supabase로 전송하지 않습니다.
          </Text>
        </View>
      </View>

      {Platform.OS !== "android" ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Android 전용 기능</Text>
          <Text style={styles.infoText}>
            결제 알림 자동 감지는 Android 설치 앱에서만 사용할 수 있습니다.
          </Text>
        </View>
      ) : !accessEnabled ? (
        <View style={styles.permissionCard}>
          <MaterialCommunityIcons color={colors.primary} name="bell-lock-outline" size={28} />
          <Text style={styles.permissionTitle}>알림 접근 권한이 필요합니다</Text>
          <Text style={styles.permissionText}>
            Android 설정에서 TripNow의 알림 접근을 직접 허용해야 합니다.
          </Text>
          <Pressable
            onPress={() => void openPaymentNotificationAccessSettings()}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>알림 접근 설정 열기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>오늘 자동 기록 · 엔</Text>
              <Text style={styles.summaryValue}>¥{todayJpyTotal.toLocaleString("ko-KR")}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>오늘 자동 기록 · 원</Text>
              <Text style={styles.summaryValue}>₩{todayKrwTotal.toLocaleString("ko-KR")}</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>확인이 필요한 결제</Text>
            <Text style={styles.sectionMeta}>{refreshing ? "확인 중" : `${pending.length}건`}</Text>
          </View>

          {pending.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons color={colors.textMuted} name="check-circle-outline" size={30} />
              <Text style={styles.emptyTitle}>확인할 결제 알림이 없습니다</Text>
              <Text style={styles.emptyText}>새 결제 알림이 감지되면 이곳에 후보로 표시됩니다.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {pending.map((candidate) => (
                <View key={candidate.id} style={styles.candidateCard}>
                  <View style={styles.candidateTop}>
                    <View style={styles.candidateCopy}>
                      <Text numberOfLines={1} style={styles.merchant}>{candidate.merchant}</Text>
                      <Text style={styles.time}>{formatTime(candidate.timestamp)}</Text>
                    </View>
                    <Text style={styles.amount}>
                      {formatMoney(candidate.amount, candidate.currency)}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={() => void dismiss(candidate)} style={styles.dismissButton}>
                      <Text style={styles.dismissText}>제외</Text>
                    </Pressable>
                    <Pressable onPress={() => void confirm(candidate)} style={styles.confirmButton}>
                      <Text style={styles.confirmText}>경비에 추가</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>확정된 자동 경비</Text>
            <Text style={styles.sectionMeta}>{expenses.length}건</Text>
          </View>

          {expenses.slice(0, 20).map((expense) => (
            <View key={expense.id} style={styles.expenseRow}>
              <View style={styles.expenseCopy}>
                <Text numberOfLines={1} style={styles.expenseMerchant}>{expense.merchant}</Text>
                <Text style={styles.time}>{formatTime(expense.timestamp)}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                {formatMoney(expense.amount, expense.currency)}
              </Text>
              <Pressable
                accessibilityLabel="확정 경비 삭제"
                hitSlop={8}
                onPress={() => removeExpense(expense.id)}
              >
                <MaterialCommunityIcons color={colors.textMuted} name="trash-can-outline" size={19} />
              </Pressable>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 2 },
  privacyCard: { borderRadius: radius.md, backgroundColor: colors.tealSoft, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 8 },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: colors.teal, fontSize: 12, fontWeight: "900" },
  privacyText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  infoCard: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginTop: 14 },
  infoTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  infoText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  permissionCard: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", padding: 22, marginTop: 14 },
  permissionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 9 },
  permissionText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 5 },
  permissionButton: { minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.primary, justifyContent: "center", paddingHorizontal: 18, marginTop: 14 },
  permissionButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  summaryCard: { minHeight: 78, borderRadius: radius.md, backgroundColor: colors.primarySoft, flexDirection: "row", alignItems: "center", marginTop: 14, padding: 13 },
  summaryItem: { flex: 1 },
  summaryLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800" },
  summaryValue: { color: colors.primary, fontSize: 18, fontWeight: "900", marginTop: 4 },
  summaryDivider: { width: 1, alignSelf: "stretch", backgroundColor: "#FFD6D1", marginHorizontal: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 8 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  sectionMeta: { color: colors.textMuted, fontSize: 10, fontWeight: "700" },
  list: { gap: 8 },
  candidateCard: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 13 },
  candidateTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  candidateCopy: { flex: 1, minWidth: 0 },
  merchant: { color: colors.text, fontSize: 14, fontWeight: "900" },
  time: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  amount: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  dismissButton: { flex: 1, minHeight: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  dismissText: { color: colors.textMuted, fontSize: 11, fontWeight: "900" },
  confirmButton: { flex: 1.4, minHeight: 40, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  emptyCard: { minHeight: 126, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: 18 },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 7 },
  emptyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 4 },
  expenseRow: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 8 },
  expenseCopy: { flex: 1, minWidth: 0 },
  expenseMerchant: { color: colors.text, fontSize: 12, fontWeight: "800" },
  expenseAmount: { color: colors.text, fontSize: 13, fontWeight: "900" },
});
