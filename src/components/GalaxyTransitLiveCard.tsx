import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getTransitLiveUpdateSupport,
  requestTransitNotificationPermission,
  startTransitLiveUpdate,
  stopTransitLiveUpdate,
  updateTransitLiveUpdate,
} from "@/modules/tripnow-live-transit";
import { colors, radius } from "@/src/theme";

const DEMO_STEPS = [
  {
    nextStation: "오모테산도",
    remainingStops: 17,
    progress: 8,
    statusText: "정상 운행",
  },
  {
    nextStation: "아오야마잇초메",
    remainingStops: 16,
    progress: 14,
    statusText: "정상 운행",
  },
  {
    nextStation: "아카사카미쓰케",
    remainingStops: 14,
    progress: 25,
    statusText: "약 2분 지연",
  },
  {
    nextStation: "우에노",
    remainingStops: 4,
    progress: 78,
    statusText: "정상 운행",
  },
];

export function GalaxyTransitLiveCard() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState(
    "Android 16 지원 갤럭시에서는 Live Update 승격을 요청하고, 미지원 기기에서는 일반 진행형 알림으로 표시합니다.",
  );

  if (Platform.OS !== "android") {
    return null;
  }

  const start = () => {
    const support = getTransitLiveUpdateSupport();

    if (!support.notificationsEnabled) {
      requestTransitNotificationPermission();
      setMessage("알림 권한을 허용한 뒤 시작 버튼을 다시 눌러 주세요.");
      return;
    }

    const first = DEMO_STEPS[0];
    const started = startTransitLiveUpdate({
      lineName: "도쿄메트로 긴자선",
      direction: "아사쿠사 방면",
      departureTime: "12:43",
      arrivalTime: "13:17",
      ...first,
    });

    if (!started) {
      setMessage("실시간 알림을 시작하지 못했습니다. 알림 설정을 확인해 주세요.");
      return;
    }

    setStep(0);
    setActive(true);
    setMessage(
      support.liveUpdateEligible
        ? "Live Update 승격 조건을 충족했습니다. 실제 표시 위치는 Galaxy/One UI 정책에 따라 결정됩니다."
        : "이 기기에서는 일반 진행형 지속 알림으로 표시됩니다.",
    );
  };

  const update = () => {
    const nextStep = Math.min(step + 1, DEMO_STEPS.length - 1);
    const next = DEMO_STEPS[nextStep];

    updateTransitLiveUpdate({
      lineName: "도쿄메트로 긴자선",
      direction: "아사쿠사 방면",
      departureTime: "12:43",
      arrivalTime: "13:17",
      ...next,
    });

    setStep(nextStep);
    setMessage(
      nextStep === DEMO_STEPS.length - 1
        ? "목적지에 가까워졌습니다. 실제 버전에서는 ODPT 열차 상태가 자동 반영됩니다."
        : "다음 역 정보를 갱신했습니다.",
    );
  };

  const stop = () => {
    stopTransitLiveUpdate("아사쿠사 도착 · 실시간 안내를 종료했습니다.");
    setActive(false);
    setStep(0);
    setMessage("실시간 지하철 안내가 종료되었습니다.");
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🚇</Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.eyebrow}>GALAXY · ANDROID</Text>
          <Text style={styles.title}>지하철 실시간 안내</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{active ? "실행 중" : "준비"}</Text>
        </View>
      </View>

      <Text style={styles.body}>{message}</Text>

      <View style={styles.preview}>
        <Text style={styles.previewLine}>긴자선 · 아사쿠사 방면</Text>
        <Text style={styles.previewMain}>
          {active
            ? "다음 역 " + DEMO_STEPS[step].nextStation
            : "출발·도착·다음 역을 잠금화면/상태바에 표시"}
        </Text>
        <Text style={styles.previewSub}>
          {active
            ? DEMO_STEPS[step].remainingStops +
              "개 역 남음 · " +
              DEMO_STEPS[step].statusText
            : "ODPT 실제 데이터 연결 예정"}
        </Text>
      </View>

      {!active ? (
        <Pressable style={styles.primaryButton} onPress={start}>
          <Text style={styles.primaryButtonText}>갤럭시 실시간 안내 테스트</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={update}>
            <Text style={styles.secondaryButtonText}>다음 역 갱신</Text>
          </Pressable>
          <Pressable style={styles.stopButton} onPress={stop}>
            <Text style={styles.stopButtonText}>안내 종료</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.footnote}>
        실제 자동 갱신은 ODPT 실시간 열차 API 연결 후 활성화됩니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  icon: {
    fontSize: 23,
  },
  headerBody: {
    flex: 1,
    marginLeft: 11,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: colors.tealSoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.teal,
    fontSize: 10,
    fontWeight: "800",
  },
  body: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 13,
  },
  preview: {
    marginTop: 14,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  previewLine: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  previewMain: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
  },
  previewSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 5,
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  stopButton: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    paddingVertical: 12,
    alignItems: "center",
  },
  stopButtonText: {
    color: colors.danger,
    fontWeight: "800",
    fontSize: 12,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 10,
  },
});
