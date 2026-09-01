import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { GalaxyTransitLiveCard } from "@/src/components/GalaxyTransitLiveCard";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getJapanRegion } from "@/src/data/japanRegions";
import { supportedRealtimeLines } from "@/src/data/tripNowDesign";
import { openGoogleMapsDirections } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

const routeSteps = [
  { time: "14:20", station: "시부야역", line: "도쿄메트로 긴자선", color: "#F3A322", detail: "아사쿠사 방면" },
  { time: "14:53", station: "아사쿠사역", line: "도보 7분", color: colors.blue, detail: "아사쿠사 도착" },
] as const;

export default function MoveScreen() {
  const { selectedRegionId } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.title}>길찾기</Text>
        <Text style={styles.options}>⋮</Text>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.searchRow}><View style={styles.startDot} /><Text style={styles.searchText}>시부야역</Text></View>
        <View style={styles.searchDivider} />
        <View style={styles.searchRow}><Text style={styles.pin}>●</Text><Text style={styles.searchText}>아사쿠사역</Text></View>
        <Text style={styles.swap}>↕</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTime}>14:20</Text>
        <View style={styles.summaryCenter}><Text style={styles.summaryDuration}>33분</Text><Text style={styles.summaryTransfer}>환승 없음</Text></View>
        <Text style={styles.summaryTime}>14:53</Text>
      </View>

      <View style={styles.routeCard}>
        {routeSteps.map((step, index) => (
          <View key={step.time} style={styles.routeRow}>
            <Text style={styles.routeTime}>{step.time}</Text>
            <View style={styles.railColumn}>
              <View style={[styles.railDot, { borderColor: step.color }]} />
              {index < routeSteps.length - 1 ? <View style={styles.railLine} /> : null}
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.station}>{step.station}</Text>
              <View style={[styles.lineBadge, { backgroundColor: step.color }]}><Text style={styles.lineBadgeText}>{step.line}</Text></View>
              <Text style={styles.routeDetail}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.googleButton} onPress={() => openGoogleMapsDirections("Asakusa Station Tokyo Japan")}>
        <Text style={styles.googleButtonText}>Google Maps에서 실제 경로 확인</Text>
      </Pressable>

      <View style={styles.liveBox}>
        <View style={styles.liveHeading}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>실시간 위치 지원 노선</Text>
          <Text style={styles.updated}>6개 노선</Text>
        </View>
        <View style={styles.lineGrid}>
          {supportedRealtimeLines.map((line) => (
            <View key={`${line.operator}-${line.code}`} style={styles.liveLine}>
              <View style={[styles.lineCode, { backgroundColor: line.color }]}><Text style={styles.lineCodeText}>{line.code}</Text></View>
              <View><Text style={styles.liveLineName}>{line.name}</Text><Text style={styles.operator}>{line.operator}</Text></View>
            </View>
          ))}
        </View>
        <Text style={styles.metroNote}>도쿄메트로 9개 노선은 실시간 열차 위치가 아니라 운행정보를 지원합니다.</Text>
      </View>

      <GalaxyTransitLiveCard />
      <View style={styles.regionNote}><Text style={styles.regionNoteText}>현재 선택 지역 · {region.label}</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: colors.text, fontSize: 30 },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  options: { color: colors.text, fontSize: 25 },
  searchCard: { borderRadius: radius.md, backgroundColor: colors.surface, padding: 14, borderWidth: 1, borderColor: colors.border },
  searchRow: { height: 32, flexDirection: "row", alignItems: "center", gap: 10 },
  startDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  pin: { color: colors.primary, fontSize: 13 },
  searchText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  searchDivider: { height: 1, backgroundColor: colors.border, marginLeft: 20 },
  swap: { position: "absolute", right: 16, top: 33, color: colors.text, fontSize: 22 },
  summary: { height: 76, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryTime: { color: colors.text, fontSize: 24, fontWeight: "900" },
  summaryCenter: { alignItems: "center", gap: 3 },
  summaryDuration: { color: colors.teal, fontSize: 19, fontWeight: "900" },
  summaryTransfer: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  routeCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 12 },
  routeRow: { minHeight: 88, flexDirection: "row" },
  routeTime: { width: 44, color: colors.text, fontSize: 12, fontWeight: "700", paddingTop: 2 },
  railColumn: { width: 24, alignItems: "center" },
  railDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, backgroundColor: colors.surface, zIndex: 1 },
  railLine: { width: 3, flex: 1, backgroundColor: colors.warning },
  routeInfo: { flex: 1, gap: 5 },
  station: { color: colors.text, fontSize: 15, fontWeight: "900" },
  lineBadge: { alignSelf: "flex-start", borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  lineBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  routeDetail: { color: colors.textMuted, fontSize: 11 },
  googleButton: { height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginTop: 12 },
  googleButtonText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  liveBox: { borderRadius: radius.md, backgroundColor: colors.surface, padding: 15, borderWidth: 1, borderColor: colors.border, marginTop: 12, marginBottom: 12 },
  liveHeading: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal },
  liveTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "900" },
  updated: { color: colors.textMuted, fontSize: 10 },
  lineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  liveLine: { width: "48%", flexDirection: "row", alignItems: "center", gap: 7 },
  lineCode: { width: 27, height: 27, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  lineCodeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  liveLineName: { color: colors.text, fontSize: 12, fontWeight: "800" },
  operator: { color: colors.textMuted, fontSize: 9, marginTop: 1 },
  metroNote: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 12 },
  regionNote: { alignItems: "center", paddingVertical: 8 },
  regionNoteText: { color: colors.textMuted, fontSize: 10 },
});
