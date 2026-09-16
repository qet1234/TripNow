import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useSchedule } from "@/src/context/ScheduleContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getHomeRegion } from "@/src/data/homeRegions";
import { colors, radius } from "@/src/theme";

export default function ScheduleScreen() {
  const router = useRouter();
  const { selectedRegionId } = useTravelMode();
  const { getSchedulesByRegion, hydrated } = useSchedule();
  const [selectedDay, setSelectedDay] = useState(1);
  const region = getHomeRegion(selectedRegionId);
  const regionSchedules = getSchedulesByRegion(selectedRegionId);
  const daySchedules = regionSchedules.filter((item) => item.day === selectedDay);

  useEffect(() => {
    const firstDay = regionSchedules[0]?.day ?? 1;
    setSelectedDay(firstDay);
  }, [selectedRegionId, regionSchedules[0]?.id]);

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
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayTab,
                active && { backgroundColor: region.accent, borderColor: region.accent },
              ]}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}일차</Text>
              <Text style={[styles.dayCount, active && styles.dayCountActive]}>{count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!hydrated ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>일정을 불러오는 중입니다</Text>
        </View>
      ) : daySchedules.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: region.soft }]}> 
            <MaterialCommunityIcons color={region.accent} name="calendar-plus" size={30} />
          </View>
          <Text style={styles.emptyTitle}>{selectedDay}일차 일정이 아직 없습니다</Text>
          <Text style={styles.emptyDescription}>시간과 장소를 등록하면 홈 화면의 오늘 일정에도 자동으로 표시됩니다.</Text>
          <Pressable onPress={() => router.push(addRoute)} style={[styles.emptyButton, { backgroundColor: region.accent }]}> 
            <Text style={styles.emptyButtonText}>첫 일정 추가</Text>
          </Pressable>
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
              <Pressable
                onPress={() => router.push(`/schedule-edit?id=${encodeURIComponent(item.id)}`)}
                style={styles.eventCard}
              >
                <View style={styles.eventTop}>
                  <View style={[styles.eventIcon, { backgroundColor: region.soft }]}> 
                    <MaterialCommunityIcons color={region.accent} name="map-marker-outline" size={22} />
                  </View>
                  <View style={styles.eventCopy}>
                    <Text numberOfLines={1} style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventDate}>{item.date}</Text>
                  </View>
                  <MaterialCommunityIcons color="#63747A" name="chevron-right" size={23} />
                </View>
                {item.detail ? <Text style={styles.eventDetail}>{item.detail}</Text> : null}
              </Pressable>
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
  timeline: { paddingTop: 7 },
  timelineRow: { flexDirection: "row", minHeight: 108, gap: 10 },
  timeColumn: { width: 52, alignItems: "center" },
  time: { color: colors.text, fontSize: 12, fontWeight: "800", marginBottom: 7 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, zIndex: 1 },
  line: { flex: 1, width: 2 },
  eventCard: { flex: 1, minHeight: 90, marginBottom: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, paddingVertical: 12 },
  eventTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  eventIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eventCopy: { flex: 1, minWidth: 0 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  eventDate: { color: colors.textMuted, fontSize: 10, fontWeight: "700", marginTop: 3 },
  eventDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 9 },
  emptyState: { minHeight: 255, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyIcon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "center" },
  emptyDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: "600", textAlign: "center", marginTop: 7 },
  emptyButton: { height: 42, borderRadius: radius.pill, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 15 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  addButton: { height: 52, borderRadius: radius.pill, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 8 },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
