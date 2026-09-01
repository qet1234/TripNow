import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getTransitLiveUpdateSupport,
  requestTransitNotificationPermission,
  startTransitLiveUpdate,
  stopTransitLiveUpdate,
  updateTransitLiveUpdate,
} from "@/modules/tripnow-live-transit";
import { colors, radius } from "@/src/theme";

const DEMO_STEPS = [
  { nextStation: "요요기", remainingStops: 7, progress: 12, statusText: "정상 운행" },
  { nextStation: "아오야마잇초메", remainingStops: 4, progress: 46, statusText: "정상 운행" },
  { nextStation: "롯폰기", remainingStops: 3, progress: 62, statusText: "약 1분 지연" },
  { nextStation: "다이몬", remainingStops: 0, progress: 100, statusText: "도착 예정" },
] as const;

export function GalaxyTransitLiveCard() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("오에도선 도착 정보를 갤럭시 잠금화면과 상단바에 표시합니다.");

  const start = () => {
    const support = getTransitLiveUpdateSupport();
    if (!support.android) {
      setMessage("네이티브 모듈이 포함된 Android 빌드에서 사용할 수 있습니다.");
      return;
    }
    if (!support.galaxy) {
      setMessage("이 기능은 Samsung Galaxy 기기에서만 사용할 수 있습니다.");
      return;
    }
    if (!support.notificationsEnabled) {
      requestTransitNotificationPermission();
      setMessage("알림 권한을 허용한 뒤 시작 버튼을 다시 눌러 주세요.");
      return;
    }

    const started = startTransitLiveUpdate({
      lineName: "도에이 오에도선",
      direction: "롯폰기·다이몬 방면",
      departureTime: "12:40",
      arrivalTime: "12:58",
      ...DEMO_STEPS[0],
    });
    if (!started) {
      setMessage("실시간 알림을 시작하지 못했습니다. 알림 설정을 확인해 주세요.");
      return;
    }
    setStep(0);
    setActive(true);
    setMessage(support.displayMode === "live_update" ? "Galaxy Live Update로 안내를 시작했습니다." : "일반 진행형 지속 알림으로 안내를 시작했습니다.");
  };

  const update = () => {
    const nextStep = Math.min(step + 1, DEMO_STEPS.length - 1);
    updateTransitLiveUpdate({
      lineName: "도에이 오에도선",
      direction: "롯폰기·다이몬 방면",
      departureTime: "12:40",
      arrivalTime: "12:58",
      ...DEMO_STEPS[nextStep],
    });
    setStep(nextStep);
    setMessage(nextStep === DEMO_STEPS.length - 1 ? "다이몬역에 도착할 예정입니다." : "열차 위치가 한 정거장 가까워졌어요.");
  };

  const stop = () => {
    stopTransitLiveUpdate("도착 알림을 종료했습니다.");
    setActive(false);
    setStep(0);
    setMessage("실시간 지하철 안내가 종료되었습니다.");
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}><Text style={styles.icon}>🚇</Text></View>
        <View style={styles.headerBody}><Text style={styles.eyebrow}>GALAXY LIVE</Text><Text style={styles.title}>오에도선 도착 알림</Text></View>
        <View style={[styles.badge, active && styles.badgeActive]}><Text style={[styles.badgeText, active && styles.badgeTextActive]}>{active ? "실행 중" : "준비"}</Text></View>
      </View>
      <Text style={styles.body}>{message}</Text>
      <View style={styles.preview}>
        <Text style={styles.previewLine}>E 오에도선 · 롯폰기·다이몬 방면</Text>
        <Text style={styles.previewMain}>{active ? `다음 역 ${DEMO_STEPS[step].nextStation}` : "신주쿠역 · 다음 열차 2분"}</Text>
        <Text style={styles.previewSub}>{active ? `${DEMO_STEPS[step].remainingStops}개 역 남음 · ${DEMO_STEPS[step].statusText}` : "잠금화면 · 알림창 상단 · 상태바"}</Text>
      </View>
      {!active ? (
        <Pressable style={styles.primaryButton} onPress={start}><Text style={styles.primaryButtonText}>갤럭시 도착 알림 테스트</Text></Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={update}><Text style={styles.secondaryButtonText}>다음 역 갱신</Text></Pressable>
          <Pressable style={styles.stopButton} onPress={stop}><Text style={styles.stopButtonText}>알림 종료</Text></Pressable>
        </View>
      )}
      <Text style={styles.footnote}>현재는 기기 표시 검증용 샘플이며 ODPT 실제 데이터 연결 후 자동 갱신됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  icon: { fontSize: 23 },
  headerBody: { flex: 1, marginLeft: 11 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  title: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 2 },
  badge: { borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 6 },
  badgeActive: { backgroundColor: colors.tealSoft },
  badgeText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  badgeTextActive: { color: colors.teal },
  body: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 13 },
  preview: { marginTop: 14, padding: 14, borderRadius: radius.md, backgroundColor: colors.background },
  previewLine: { color: colors.text, fontSize: 13, fontWeight: "800" },
  previewMain: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 7 },
  previewSub: { color: colors.textMuted, fontSize: 11, marginTop: 5 },
  primaryButton: { marginTop: 14, borderRadius: radius.pill, backgroundColor: colors.primary, paddingVertical: 13, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
  actions: { flexDirection: "row", gap: 9, marginTop: 14 },
  secondaryButton: { flex: 1, borderRadius: radius.sm, backgroundColor: colors.primarySoft, paddingVertical: 12, alignItems: "center" },
  secondaryButtonText: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  stopButton: { flex: 1, borderRadius: radius.sm, backgroundColor: colors.dangerSoft, paddingVertical: 12, alignItems: "center" },
  stopButtonText: { color: colors.danger, fontWeight: "800", fontSize: 12 },
  footnote: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 10 },
});
