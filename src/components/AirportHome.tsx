import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import type { AirportFlightPlan, AirportPhase } from "@/src/context/AirportContext";
import { colors, radius } from "@/src/theme";

type Props = {
  phase: Exclude<AirportPhase, "none">;
  plan: AirportFlightPlan;
  onOpenSetup: () => void;
  onOpenTransport: () => void;
  onContinue: () => void;
};

export function AirportHome({
  phase,
  plan,
  onOpenSetup,
  onOpenTransport,
  onContinue,
}: Props) {
  const isDeparture = phase === "departure";
  const accent = isDeparture ? colors.blue : colors.teal;
  const soft = isDeparture ? "#EDF5FF" : colors.tealSoft;
  const title = isDeparture ? "인천공항 출국 안내" : "인천공항 입국 안내";
  const subtitle = isDeparture
    ? "오늘 출발 일정에 맞춰 필요한 정보를 먼저 보여드려요."
    : "오늘 도착 일정에 맞춰 입국 절차를 먼저 보여드려요.";
  const flight = isDeparture ? plan.outboundFlight : plan.returnFlight;
  const time = isDeparture ? plan.outboundTime : plan.returnTime;
  const terminal = isDeparture ? plan.outboundTerminal : plan.returnTerminal;
  const airportSide = isDeparture
    ? `제${terminal || "1"}여객터미널 · 출국장`
    : `제${terminal || "1"}여객터미널 · 입국장`;
  const routeText = isDeparture
    ? `인천 → ${plan.outboundDestination || "일본"}`
    : `${plan.returnOrigin || "일본"} → 인천`;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>트립나우</Text>
        <View style={[styles.autoBadge, { backgroundColor: soft }]}>
          <MaterialCommunityIcons color={accent} name="flash-outline" size={15} />
          <Text style={[styles.autoBadgeText, { color: accent }]}>자동 시작</Text>
        </View>
      </View>

      <View style={[styles.hero, { backgroundColor: soft, borderColor: accent + "40" }]}>
        <View style={[styles.heroIcon, { backgroundColor: accent }]}>
          <MaterialCommunityIcons
            color="#FFFFFF"
            name={isDeparture ? "airplane-takeoff" : "airplane-landing"}
            size={29}
          />
        </View>
        <Text style={[styles.eyebrow, { color: accent }]}>TODAY · INCHEON AIRPORT</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.routePill}>
          <Text style={styles.routeText}>{routeText}</Text>
          <Text style={[styles.routeStatus, { color: accent }]}>
            {isDeparture ? "출발 준비" : "도착 후 안내"}
          </Text>
        </View>
      </View>

      <View style={styles.flightCard}>
        <View style={styles.cardHeading}>
          <View style={[styles.cardIcon, { backgroundColor: soft }]}>
            <MaterialCommunityIcons color={accent} name="airplane" size={21} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text style={styles.cardLabel}>항공 일정</Text>
            <Text style={styles.cardTitle}>{flight || "항공편을 입력해 주세요"}</Text>
          </View>
          <Text style={[styles.flightTime, { color: accent }]}>{time || "--:--"}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>이용 위치</Text>
            <Text style={styles.infoValue}>{airportSide}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{isDeparture ? "출국 전" : "입국 후"}</Text>
            <Text style={styles.infoValue}>{isDeparture ? "체크인 · 보안검색" : "입국심사 · 수하물"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionList}>
        <Pressable onPress={onOpenSetup} style={[styles.primaryButton, { backgroundColor: accent }]}>
          <MaterialCommunityIcons color="#FFFFFF" name="information-outline" size={20} />
          <Text style={styles.primaryButtonText}>공항 안내 상세 보기</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="chevron-right" size={21} />
        </Pressable>
        <View style={styles.secondaryRow}>
          <Pressable onPress={onOpenTransport} style={styles.secondaryButton}>
            <MaterialCommunityIcons color={colors.teal} name="train" size={20} />
            <Text style={styles.secondaryButtonText}>공항 교통</Text>
          </Pressable>
          <Pressable onPress={onContinue} style={styles.secondaryButton}>
            <MaterialCommunityIcons color={colors.primary} name="map-search-outline" size={20} />
            <Text style={styles.secondaryButtonText}>여행 홈 보기</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.note}>
        저장한 항공 일정의 날짜가 오늘이면 앱 시작 화면이 공항 안내로 자동 전환됩니다.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 47, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  brand: { color: colors.text, fontSize: 24, fontWeight: "900", letterSpacing: -1.2 },
  autoBadge: { minHeight: 30, borderRadius: radius.pill, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5 },
  autoBadgeText: { fontSize: 11, fontWeight: "900" },
  hero: { borderRadius: radius.lg, borderWidth: 1, padding: 18, marginTop: 9 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 15 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  routePill: { minHeight: 40, borderRadius: radius.md, backgroundColor: colors.surface, marginTop: 14, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  routeText: { color: colors.text, fontSize: 13, fontWeight: "900" },
  routeStatus: { fontSize: 11, fontWeight: "900" },
  flightCard: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 15, marginTop: 12 },
  cardHeading: { flexDirection: "row", alignItems: "center" },
  cardIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardHeadingCopy: { flex: 1, minWidth: 0 },
  cardLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  flightTime: { fontSize: 22, fontWeight: "900" },
  infoRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 12, flexDirection: "row", gap: 10 },
  infoItem: { flex: 1, minWidth: 0 },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  infoValue: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 4 },
  actionList: { marginTop: 13, gap: 9 },
  primaryButton: { minHeight: 53, borderRadius: radius.md, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 8 },
  primaryButtonText: { flex: 1, color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  secondaryRow: { flexDirection: "row", gap: 9 },
  secondaryButton: { flex: 1, minHeight: 49, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondaryButtonText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  note: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 15, paddingHorizontal: 12 },
});
