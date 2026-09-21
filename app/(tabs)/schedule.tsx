import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { type ScheduleItem, useSchedule } from "@/src/context/ScheduleContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getHomeRegion } from "@/src/data/homeRegions";
import { getJapanRegion } from "@/src/data/japanRegions";
import { openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

function getMapQuery(item: ScheduleItem, city: string) {
  if (item.placeLatitude !== undefined && item.placeLongitude !== undefined) {
    return `${item.placeLatitude},${item.placeLongitude}`;
  }
  return item.placeAddress?.trim() || item.placeQuery?.trim() || `${item.title} ${city} Japan`;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ added?: string; day?: string }>();
  const { selectedRegionId } = useTravelMode();
  const { getSchedulesByRegion, hydrated } = useSchedule();
  const [selectedDay, setSelectedDay] = useState(1);
  const region = getHomeRegion(selectedRegionId);
  const japanRegion = getJapanRegion(selectedRegionId);
  const regionSchedules = getSchedulesByRegion(selectedRegionId);
  const daySchedules = regionSchedules.filter((item) => item.day === selectedDay);
  const requestedDay = Number(params.day);
  const addedDay = requestedDay >= 1 && requestedDay <= 4 ? requestedDay : selectedDay;

  useEffect(() => {
    const firstDay = requestedDay >= 1 && requestedDay <= 4
      ? requestedDay
      : regionSchedules[0]?.day ?? 1;
    setSelectedDay(firstDay);
  }, [params.day, selectedRegionId, regionSchedules[0]?.id]);

  const addRoute = `/schedule-edit?regionId=${encodeURIComponent(selectedRegionId)}&day=${selectedDay}`;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialCommunityIcons color={colors.text} name="chevron-left" size={28} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{region.name} 여행 일정</Text>
          <Text style={styles.subtitle}>등록한 일정은 이 기기에 자동 저장됩니다</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => router.push(addRoute)} style={styles.headerIcon}>
          <MaterialCommunityIcons color={region.accent} name="plus" size={27} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
        {[1, 2, 3, 4].map((day) => {
          const active = day === selectedDay;
          const count = regionSchedules.filter((item) => item.day === day).length;
          return (
            <Pressable key={day} onPress={() => setSelectedDay(day)} style={[styles.dayTab, active && { backgroundColor: region.accent, borderColor: region.accent }]}>
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}일차</Text>
              <Text style={[styles.dayCount, active && styles.dayCountActive]}>{count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {params.added === "1" ? (
        <View style={styles.addedNotice}>
          <MaterialCommunityIcons color="#157A55" name="check-circle" size={19} />
          <Text style={styles.addedNoticeText}>선택한 장소를 {addedDay}일차 일정에 추가했습니다.</Text>
        </View>
      ) : null}

      {!hydrated ? (
        <View style={styles.emptyState}><Text style={styles.emptyTitle}>일정을 불러오는 중입니다</Text></View>
      ) : daySchedules.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: region.soft }]}><MaterialCommunityIcons color={region.accent} name="calendar-plus" size={30} /></View>
          <Text style={styles.emptyTitle}>{selectedDay}일차 일정이 아직 없습니다</Text>
          <Text style={styles.emptyDescription}>시간과 장소를 등록하면 홈 화면의 오늘 일정에도 자동으로 표시됩니다.</Text>
          <Pressable onPress={() => router.push(addRoute)} style={[styles.emptyButton, { backgroundColor: region.accent }]}><Text style={styles.emptyButtonText}>첫 일정 추가</Text></Pressable>
        </View>
      ) : (
        <View style={styles.timeline}>
          {daySchedules.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={[styles.dot, { backgroundColor: region.accent, borderColor: region.softStrong }]} />
                {index < daySchedules.length - 1 ? <View style={[styles.line, { backgroundColor: region.softStrong }]} /> : null}
              </View>
              <View style={styles.eventCard}>
                <Pressable onPress={() => router.push(`/schedule-edit?id=${encodeURIComponent(item.id)}`)} style={styles.eventMain}>
                  <View style={styles.eventTop}>
                    <View style={[styles.eventIcon, { backgroundColor: region.soft }]}><MaterialCommunityIcons color={region.accent} name="map-marker-outline" size={22} /></View>
                    <View style={styles.eventCopy}>
                      <Text numberOfLines={1} style={styles.eventTitle}>{item.title}</Text>
                      <Text style={styles.eventDate}>{item.date}</Text>
                    </View>
                    <MaterialCommunityIcons color="#63747A" name="chevron-right" size={23} />
                  </View>
                  {item.detail ? <Text style={styles.eventDetail}>{item.detail}</Text> : null}
                  {item.placeAddress ? (
                    <View style={styles.placeQueryRow}>
                      <MaterialCommunityIcons color={colors.textMuted} name="map-marker-check-outline" size={14} />
                      <Text numberOfLines={2} style={styles.placeQueryText}>{item.placeAddress}</Text>
                    </View>
                  ) : item.placeQuery ? (
                    <View style={styles.placeQueryRow}>
                      <MaterialCommunityIcons color={colors.textMuted} name="map-search-outline" size={14} />
                      <Text numberOfLines={1} style={styles.placeQueryText}>{item.placeQuery}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <View style={styles.eventActions}>
                  <Pressable onPress={() => void openGoogleMapsSearch(getMapQuery(item, japanRegion.city))} style={styles.actionButton}>
                    <MaterialCommunityIcons color={region.accent} name="map-search-outline" size={16} />
                    <Text style={[styles.actionText, { color: region.accent }]}>지도</Text>
                  </Pressable>
                  <View style={styles.actionDivider} />
                  <Pressable onPress={() => router.push(`/move?scheduleId=${encodeURIComponent(item.id)}`)} style={styles.actionButton}>
                    <MaterialCommunityIcons color={region.accent} name="directions" size={16} />
                    <Text style={[styles.actionText, { color: region.accent }]}>경로 보기</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => router.push(addRoute)} style={[styles.addButton, { backgroundColor: region.accent }]}>
        <MaterialCommunityIcons color="#FFFFFF" name="plus" size={20} />
        <Text style={styles.addButtonText}>일정 추가</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, alignItems: "center" },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  subtitle: { color: colors.textMuted, fontSize: 10, fontWeight: "600", marginTop: 3 },
  dayTabs: { gap: 7, paddingVertical: 12, paddingRight: 4 },
  dayTab: { minWidth: 78, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  dayText: { color: colors.textMuted, fontSize: 13, fontWeight: "800" },
  dayTextActive: { color: "#FFFFFF", fontWeight: "900" },
  dayCount: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#EEF2F1", color: colors.textMuted, fontSize: 10, fontWeight: "900", textAlign: "center", lineHeight: 18 },
  dayCountActive: { backgroundColor: "rgba(255,255,255,0.22)", color: "#FFFFFF" },
  addedNotice: { borderRadius: radius.sm, backgroundColor: "#EAF7F1", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  addedNoticeText: { flex: 1, color: "#17694D", fontSize: 11, lineHeight: 16, fontWeight: "800" },
  timeline: { paddingTop: 7 },
  timelineRow: { flexDirection: "row", minHeight: 132, gap: 10 },
  timeColumn: { width: 52, alignItems: "center" },
  time: { color: colors.text, fontSize: 12, fontWeight: "800", marginBottom: 7 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, zIndex: 1 },
  line: { flex: 1, width: 2 },
  eventCard: { flex: 1, marginBottom: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  eventMain: { paddingHorizontal: 13, paddingTop: 12, paddingBottom: 10 },
  eventTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  eventIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eventCopy: { flex: 1, minWidth: 0 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  eventDate: { color: colors.textMuted, fontSize: 10, fontWeight: "700", marginTop: 3 },
  eventDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 9 },
  placeQueryRow: { flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 7 },
  placeQueryText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: "600" },
  eventActions: { height: 42, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", alignItems: "center" },
  actionButton: { flex: 1, height: "100%", flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 11, fontWeight: "900" },
  actionDivider: { width: 1, height: 20, backgroundColor: colors.border },
  emptyState: { minHeight: 255, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  emptyDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "center", marginTop: 7 },
  emptyButton: { height: 42, borderRadius: radius.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 15 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  addButton: { height: 52, borderRadius: radius.pill, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 8 },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
