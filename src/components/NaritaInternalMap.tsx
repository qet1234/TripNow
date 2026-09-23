import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MotionPressable } from "@/src/components/MotionPressable";
import { colors, radius } from "@/src/theme";

type Direction = "departure" | "arrival";
type Terminal = "T1" | "T2" | "T3";

type FloorInfo = {
  floor: string;
  title: string;
  zones: readonly string[];
  accent?: boolean;
};

const terminalFloors: Readonly<Record<Terminal, readonly FloorInfo[]>> = {
  T1: [
    { floor: "5F", title: "식당·전망", zones: ["레스토랑", "전망 데크"] },
    { floor: "4F", title: "국제선 출발", zones: ["체크인 카운터", "보안검색", "출발 로비"], accent: true },
    { floor: "3F", title: "출국심사·게이트", zones: ["출국심사", "면세점", "국제선 게이트"], accent: true },
    { floor: "2F", title: "입국심사", zones: ["입국심사", "검역"] },
    { floor: "1F", title: "국제선 도착", zones: ["도착 로비", "세관", "버스·택시"], accent: true },
    { floor: "B1", title: "철도", zones: ["JR", "게이세이"] },
  ],
  T2: [
    { floor: "4F", title: "식당·전망", zones: ["레스토랑", "전망 데크"] },
    { floor: "3F", title: "국제선 출발", zones: ["체크인", "보안검색", "출국심사", "국제선 게이트"], accent: true },
    { floor: "2F", title: "입국심사·연결통로", zones: ["입국심사", "검역", "본관↔새터라이트"] },
    { floor: "1F", title: "국제선 도착", zones: ["도착 로비", "세관", "버스·택시"], accent: true },
    { floor: "B1", title: "철도", zones: ["JR", "게이세이"] },
  ],
  T3: [
    { floor: "3F", title: "국제선 출발 게이트", zones: ["면세점", "국제선 게이트"], accent: true },
    { floor: "2F", title: "국제선 출발", zones: ["체크인", "보안검색", "출국심사"], accent: true },
    { floor: "1F", title: "국제선 도착", zones: ["입국심사", "세관", "도착 로비", "셔틀버스"], accent: true },
  ],
};

function inferTerminal(value: string): Terminal {
  const normalized = value.toUpperCase();
  if (/\bT3\b/.test(normalized)) return "T3";
  if (/\bT2\b/.test(normalized)) return "T2";
  return "T1";
}

export function NaritaInternalMap({
  terminal,
  direction,
  compact = false,
}: {
  terminal: string;
  direction: Direction;
  compact?: boolean;
}) {
  const inferred = inferTerminal(terminal);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal>(inferred);

  useEffect(() => {
    setSelectedTerminal(inferred);
  }, [inferred]);

  const routeLabel = direction === "departure" ? "출국 동선" : "도착 동선";
  const routeHint = useMemo(() => {
    if (direction === "departure") {
      if (selectedTerminal === "T1") return "4F 체크인 → 4F 보안검색 → 3F 출국심사 → 게이트";
      if (selectedTerminal === "T2") return "3F 체크인 → 3F 보안검색·출국심사 → 게이트";
      return "2F 체크인 → 2F 보안검색·출국심사 → 3F 국제선 게이트";
    }
    if (selectedTerminal === "T1") return "도착 게이트 → 2F 입국심사 → 1F 수하물·세관 → 도착 로비";
    if (selectedTerminal === "T2") return "도착 게이트 → 2F 입국심사 → 1F 수하물·세관 → 도착 로비";
    return "도착 게이트 → 1F 입국심사·수하물·세관 → 도착 로비";
  }, [direction, selectedTerminal]);

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.eyebrow}>TRIPNOW · NARITA INTERNAL MAP</Text>
          <Text style={styles.title}>나리타공항 내장 안내 지도</Text>
          <Text style={styles.subtitle}>공식 시설 배치 정보를 바탕으로 만든 비축척 안내도</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons color={colors.teal} name="map-marker-path" size={15} />
          <Text style={styles.badgeText}>내장 지도</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {(["T1", "T2", "T3"] as Terminal[]).map((item) => {
          const selected = item === selectedTerminal;
          return (
            <MotionPressable
              key={item}
              onPress={() => setSelectedTerminal(item)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabCode, selected && styles.tabCodeSelected]}>{item}</Text>
              <Text style={[styles.tabName, selected && styles.tabNameSelected]}>
                {item === "T1" ? "제1터미널" : item === "T2" ? "제2터미널" : "제3터미널"}
              </Text>
            </MotionPressable>
          );
        })}
      </ScrollView>

      <View style={styles.routeCard}>
        <View style={styles.routeIcon}>
          <MaterialCommunityIcons
            color="#FFFFFF"
            name={direction === "departure" ? "airplane-takeoff" : "airplane-landing"}
            size={18}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.routeEyebrow}>{routeLabel}</Text>
          <Text style={styles.routeText}>{routeHint}</Text>
        </View>
      </View>

      <View style={styles.floorStack}>
        {terminalFloors[selectedTerminal].map((item) => (
          <View key={item.floor} style={[styles.floorRow, item.accent && styles.floorRowAccent]}>
            <View style={[styles.floorBadge, item.accent && styles.floorBadgeAccent]}>
              <Text style={[styles.floorText, item.accent && styles.floorTextAccent]}>{item.floor}</Text>
            </View>
            <View style={styles.floorContent}>
              <Text style={styles.floorTitle}>{item.title}</Text>
              <View style={styles.zoneWrap}>
                {item.zones.map((zone) => (
                  <View key={zone} style={styles.zoneChip}>
                    <Text style={styles.zoneText}>{zone}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <MaterialCommunityIcons color={colors.blue} name="information-outline" size={16} />
        <Text style={styles.noticeText}>
          실제 게이트 위치와 시설 배치는 당일 변경될 수 있습니다. 이 화면은 나리타공항의 공식 시설 배치 설명을 TripNow용으로 단순화한 안내도입니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, backgroundColor: "#F8FBFE", borderWidth: 1, borderColor: "#C7DCF5", padding: 14 },
  compactCard: { borderRadius: 0, borderWidth: 0, flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  eyebrow: { color: colors.blue, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 4 },
  subtitle: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, backgroundColor: colors.tealSoft, paddingHorizontal: 8, paddingVertical: 6 },
  badgeText: { color: colors.teal, fontSize: 8, fontWeight: "900" },
  tabs: { gap: 7, paddingTop: 12, paddingBottom: 10 },
  tab: { minWidth: 92, borderRadius: 12, borderWidth: 1, borderColor: "#D8E1E9", backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 8 },
  tabSelected: { borderColor: colors.blue, backgroundColor: "#EAF4FF" },
  tabCode: { color: colors.textMuted, fontSize: 11, fontWeight: "900" },
  tabCodeSelected: { color: colors.blue },
  tabName: { color: colors.text, fontSize: 9, fontWeight: "800", marginTop: 2 },
  tabNameSelected: { color: colors.blue },
  routeCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 13, backgroundColor: "#102A43", padding: 12, marginBottom: 10 },
  routeIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  routeEyebrow: { color: "#8FD2FF", fontSize: 8, fontWeight: "900" },
  routeText: { color: "#FFFFFF", fontSize: 11, lineHeight: 16, fontWeight: "800", marginTop: 3 },
  floorStack: { gap: 7 },
  floorRow: { flexDirection: "row", alignItems: "stretch", borderRadius: 13, borderWidth: 1, borderColor: "#DDE5EC", backgroundColor: "#FFFFFF", overflow: "hidden" },
  floorRowAccent: { borderColor: "#BFD8F5", backgroundColor: "#F7FBFF" },
  floorBadge: { width: 54, alignItems: "center", justifyContent: "center", backgroundColor: "#EFF2F5", paddingVertical: 12 },
  floorBadgeAccent: { backgroundColor: "#E7F2FF" },
  floorText: { color: colors.textMuted, fontSize: 13, fontWeight: "900" },
  floorTextAccent: { color: colors.blue },
  floorContent: { flex: 1, minWidth: 0, padding: 10 },
  floorTitle: { color: colors.text, fontSize: 11, fontWeight: "900" },
  zoneWrap: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  zoneChip: { borderRadius: radius.pill, backgroundColor: "#F0F4F7", paddingHorizontal: 7, paddingVertical: 4 },
  zoneText: { color: colors.textMuted, fontSize: 8, fontWeight: "800" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 7, borderRadius: 12, backgroundColor: "#EEF6FF", padding: 10, marginTop: 10 },
  noticeText: { flex: 1, color: colors.textMuted, fontSize: 9, lineHeight: 14, fontWeight: "700" },
});
