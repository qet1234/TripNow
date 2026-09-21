import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  resolveAirline,
  resolveJapanAirport,
  resolveTerminal,
} from "@/src/data/japanAirportGuides";
import { colors, radius } from "@/src/theme";

type Props = {
  airportCode: string;
  city: string;
  direction: "arrival" | "departure";
  flightId: string;
  gate?: string;
  manualTerminal: string;
};

function openOfficialPage(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  void Linking.openURL(url);
}

export function JapanAirportQuickGuide({
  airportCode,
  city,
  direction,
  flightId,
  gate = "",
  manualTerminal,
}: Props) {
  const guide = resolveJapanAirport(airportCode, city);

  if (!guide) {
    if (!city.trim() && !airportCode.trim()) return null;
    return (
      <View style={styles.helpCard}>
        <MaterialCommunityIcons color={colors.warning} name="map-marker-question-outline" size={21} />
        <Text style={styles.helpText}>
          {city.replace(/\s+/g, "").includes("도쿄")
            ? "도쿄는 나리타(NRT)와 하네다(HND)가 달라요. 공항 코드를 입력하면 맞는 안내를 바로 보여드립니다."
            : "공항 코드(NRT·HND·KIX·CTS·NGO·FUK·OKA)를 입력하면 공식 안내를 바로 보여드립니다."}
        </Text>
      </View>
    );
  }

  const airline = resolveAirline(flightId);
  const terminal = resolveTerminal(guide, flightId, manualTerminal);
  const flow = direction === "arrival" ? guide.arrivalFlow : guide.departureFlow;
  const directionLabel = direction === "arrival" ? "도착 동선" : "출국 동선";

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons color="#FFFFFF" name="airport" size={23} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>일본 공항 빠른 안내</Text>
          <Text style={styles.title}>{guide.name}</Text>
          <Text style={styles.meta}>
            {guide.code} · {airline?.name || "항공사 확인 필요"}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>이용 터미널</Text>
          <Text style={styles.statusValue}>{terminal.value}</Text>
          <Text style={styles.statusSource}>{terminal.source}</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>{direction === "arrival" ? "도착 게이트" : "탑승구"}</Text>
          <Text style={styles.statusValue}>{gate.trim() || "현장 확인"}</Text>
          <Text style={styles.statusSource}>전광판 최종 확인</Text>
        </View>
      </View>

      <Text style={styles.flowLabel}>{directionLabel}</Text>
      <View style={styles.flowWrap}>
        {flow.map((step, index) => (
          <View key={step} style={styles.flowStepWrap}>
            <View style={styles.flowStep}>
              <Text style={styles.flowNumber}>{index + 1}</Text>
              <Text style={styles.flowText}>{step}</Text>
            </View>
            {index < flow.length - 1 ? (
              <MaterialCommunityIcons color="#98A1A8" name="chevron-right" size={16} />
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="link"
          onPress={() => openOfficialPage(guide.mapUrl)}
          style={styles.primaryButton}
        >
          <MaterialCommunityIcons color="#FFFFFF" name="map-outline" size={18} />
          <Text style={styles.primaryButtonText}>공식 지도</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => openOfficialPage(guide.flightUrl)}
          style={styles.secondaryButton}
        >
          <MaterialCommunityIcons color={colors.blue} name="airplane-clock" size={18} />
          <Text style={styles.secondaryButtonText}>공식 운항조회</Text>
        </Pressable>
      </View>

      <Text style={styles.notice}>
        외부 운항 API를 사용하지 않는 기본 안내입니다. 터미널과 탑승구는 당일 공항 전광판에서 최종 확인해 주세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4, marginBottom: 10, padding: 14, borderRadius: radius.md, backgroundColor: "#F7FBFF", borderWidth: 1, borderColor: "#CFE2F7" },
  helpCard: { marginTop: 2, marginBottom: 10, padding: 12, borderRadius: radius.sm, backgroundColor: "#FFF8E8", flexDirection: "row", alignItems: "flex-start", gap: 8 },
  helpText: { flex: 1, color: "#6E5420", fontSize: 11, lineHeight: 17, fontWeight: "700" },
  headingRow: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.blue, marginRight: 10 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.blue, fontSize: 10, fontWeight: "900" },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: 10, fontWeight: "700", marginTop: 3 },
  statusRow: { flexDirection: "row", marginTop: 13, padding: 12, borderRadius: radius.sm, backgroundColor: colors.surface },
  statusItem: { flex: 1, minWidth: 0 },
  statusDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 11 },
  statusLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  statusValue: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: "900", marginTop: 4 },
  statusSource: { color: colors.blue, fontSize: 9, lineHeight: 13, fontWeight: "800", marginTop: 2 },
  flowLabel: { color: colors.text, fontSize: 11, fontWeight: "900", marginTop: 13, marginBottom: 8 },
  flowWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: 6 },
  flowStepWrap: { flexDirection: "row", alignItems: "center" },
  flowStep: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 7, borderRadius: radius.pill, backgroundColor: "#FFFFFF" },
  flowNumber: { color: colors.blue, fontSize: 9, fontWeight: "900" },
  flowText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 13 },
  primaryButton: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  secondaryButton: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#BFD6F1", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondaryButtonText: { color: colors.blue, fontSize: 11, fontWeight: "900" },
  notice: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 9 },
});
