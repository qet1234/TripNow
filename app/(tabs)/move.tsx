import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { GalaxyTransitLiveCard } from "@/src/components/GalaxyTransitLiveCard";
import { type ScheduleItem, useSchedule } from "@/src/context/ScheduleContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getJapanRegion } from "@/src/data/japanRegions";
import { supportedRealtimeLines } from "@/src/data/tripNowDesign";
import { openGoogleMapsDirections, openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

function getMapQuery(item: ScheduleItem, city: string) {
  return item.placeQuery?.trim() || `${item.title} ${city} Japan`;
}

export default function MoveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scheduleId?: string }>();
  const { selectedRegionId } = useTravelMode();
  const { getScheduleById, getSchedulesByRegion, hydrated } = useSchedule();
  const region = getJapanRegion(selectedRegionId);
  const regionSchedules = getSchedulesByRegion(selectedRegionId);
  const requested = params.scheduleId ? getScheduleById(params.scheduleId) : undefined;
  const target = requested?.regionId === selectedRegionId ? requested : regionSchedules[0];
  const sameDay = target
    ? regionSchedules.filter((item) => item.day === target.day && item.date === target.date)
    : [];
  const targetIndex = target ? sameDay.findIndex((item) => item.id === target.id) : -1;
  const previous = targetIndex > 0 ? sameDay[targetIndex - 1] : undefined;

  const destinationQuery = target ? getMapQuery(target, region.city) : region.label;
  const originQuery = previous ? getMapQuery(previous, region.city) : region.label;
  const originLabel = previous?.title ?? `${region.city} · ${region.area}`;
  const destinationLabel = target?.title ?? "등록된 일정 없음";

  const openDirections = () => {
    if (!target) return;
    void openGoogleMapsDirections(destinationQuery, {
      origin: originQuery,
      travelMode: "transit",
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialCommunityIcons color={colors.text} name="chevron-left" size={28} />
        </Pressable>
        <Text style={styles.title}>길찾기</Text>
        <View style={styles.headerIcon} />
      </View>

      {!hydrated ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>일정을 불러오는 중입니다</Text>
        </View>
      ) : !target ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons color={colors.primary} name="map-marker-plus-outline" size={30} />
          </View>
          <Text style={styles.emptyTitle}>길찾기에 사용할 일정이 없습니다</Text>
          <Text style={styles.emptyDescription}>일정 탭에서 목적지를 먼저 등록해 주세요.</Text>
          <Pressable onPress={() => router.push("/schedule")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>일정 등록하러 가기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <View style={styles.startDot} />
              <View style={styles.searchCopy}>
                <Text style={styles.searchCaption}>{previous ? "이전 일정" : "출발 지역"}</Text>
                <Text numberOfLines={1} style={styles.searchText}>{originLabel}</Text>
              </View>
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchRow}>
              <MaterialCommunityIcons color={colors.primary} name="map-marker" size={17} />
              <View style={styles.searchCopy}>
                <Text style={styles.searchCaption}>목적지</Text>
                <Text numberOfLines={1} style={styles.searchText}>{destinationLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summary}>
            <View>
              <Text style={styles.summaryLabel}>{target.day}일차</Text>
              <Text style={styles.summaryDate}>{target.date}</Text>
            </View>
            <View style={styles.summaryCenter}>
              <MaterialCommunityIcons color={colors.teal} name="clock-outline" size={20} />
              <Text style={styles.summaryTime}>{target.time}</Text>
            </View>
          </View>

          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.railColumn}>
                <View style={[styles.railDot, { borderColor: colors.teal }]} />
                <View style={styles.railLine} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>{previous ? "이전 일정에서 출발" : "선택 지역에서 출발"}</Text>
                <Text style={styles.station}>{originLabel}</Text>
              </View>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.railColumn}>
                <View style={[styles.railDot, { borderColor: colors.primary }]} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>등록한 일정 목적지</Text>
                <Text style={styles.station}>{destinationLabel}</Text>
                {target.detail ? <Text style={styles.routeDetail}>{target.detail}</Text> : null}
                <Text numberOfLines={1} style={styles.queryText}>{destinationQuery}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => void openGoogleMapsSearch(destinationQuery)}
            >
              <MaterialCommunityIcons color={colors.primary} name="map-search-outline" size={18} />
              <Text style={styles.secondaryButtonText}>목적지 지도</Text>
            </Pressable>
            <Pressable style={styles.googleButton} onPress={openDirections}>
              <MaterialCommunityIcons color="#FFFFFF" name="directions" size={18} />
              <Text style={styles.googleButtonText}>실제 경로</Text>
            </Pressable>
          </View>

          <Text style={styles.externalNote}>
            이동시간과 환승 정보는 임의로 표시하지 않고 Google Maps의 최신 경로 결과에서 확인합니다.
          </Text>
        </>
      )}

      <View style={styles.liveBox}>
        <View style={styles.liveHeading}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTitle}>실시간 위치 지원 노선</Text>
          <Text style={styles.updated}>6개 노선</Text>
        </View>
        <View style={styles.lineGrid}>
          {supportedRealtimeLines.map((line) => (
            <View key={`${line.operator}-${line.code}`} style={styles.liveLine}>
              <View style={[styles.lineCode, { backgroundColor: line.color }]}>
                <Text style={styles.lineCodeText}>{line.code}</Text>
              </View>
              <View>
                <Text style={styles.liveLineName}>{line.name}</Text>
                <Text style={styles.operator}>{line.operator}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.metroNote}>도쿄메트로 9개 노선은 실시간 열차 위치가 아니라 운행정보를 지원합니다.</Text>
      </View>

      <GalaxyTransitLiveCard />
      <View style={styles.regionNote}>
        <Text style={styles.regionNoteText}>현재 선택 지역 · {region.label}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  searchCard: { borderRadius: radius.md, backgroundColor: colors.surface, padding: 14, borderWidth: 1, borderColor: colors.border },
  searchRow: { minHeight: 45, flexDirection: "row", alignItems: "center", gap: 10 },
  searchCopy: { flex: 1, minWidth: 0 },
  searchCaption: { color: colors.textMuted, fontSize: 9, fontWeight: "800", marginBottom: 2 },
  startDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  searchText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  searchDivider: { height: 1, backgroundColor: colors.border, marginLeft: 20 },
  summary: { minHeight: 76, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  summaryDate: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 3 },
  summaryCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryTime: { color: colors.teal, fontSize: 22, fontWeight: "900" },
  routeCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 12 },
  routeRow: { minHeight: 82, flexDirection: "row" },
  railColumn: { width: 28, alignItems: "center" },
  railDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, backgroundColor: colors.surface, zIndex: 1 },
  railLine: { width: 3, flex: 1, backgroundColor: colors.border },
  routeInfo: { flex: 1, gap: 4, paddingBottom: 10 },
  routeLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  station: { color: colors.text, fontSize: 15, fontWeight: "900" },
  routeDetail: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  queryText: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  secondaryButton: { flex: 1, height: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  googleButton: { flex: 1, height: 46, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  googleButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  externalNote: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 8, paddingHorizontal: 10 },
  emptyState: { minHeight: 250, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  emptyDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 6 },
  primaryButton: { height: 44, borderRadius: radius.pill, backgroundColor: colors.primary, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 15 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
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
