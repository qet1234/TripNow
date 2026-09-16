import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useSchedule } from "@/src/context/ScheduleContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getHomeRegion, homeRegions } from "@/src/data/homeRegions";
import { getJapanRegion } from "@/src/data/japanRegions";
import { openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ScheduleEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; regionId?: string; day?: string }>();
  const { selectedRegionId } = useTravelMode();
  const { addSchedule, getScheduleById, removeSchedule, updateSchedule } = useSchedule();
  const existing = params.id ? getScheduleById(params.id) : undefined;

  const initialDay = Math.max(1, Math.min(4, Number(params.day ?? "1") || 1));
  const [regionId, setRegionId] = useState(params.regionId ?? selectedRegionId);
  const [day, setDay] = useState(initialDay);
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;
    setRegionId(existing.regionId);
    setDay(existing.day);
    setDate(existing.date);
    setTime(existing.time);
    setTitle(existing.title);
    setPlaceQuery(existing.placeQuery ?? "");
    setDetail(existing.detail);
  }, [existing?.id]);

  const region = useMemo(() => getHomeRegion(regionId), [regionId]);
  const japanRegion = useMemo(() => getJapanRegion(regionId), [regionId]);
  const isEditing = Boolean(existing);
  const mapSearchQuery = useMemo(() => {
    const custom = placeQuery.trim();
    if (custom) return custom;
    const name = title.trim();
    return name ? `${name} ${japanRegion.city} Japan` : "";
  }, [japanRegion.city, placeQuery, title]);

  const previewPlace = () => {
    if (!mapSearchQuery) {
      setError("먼저 장소명 또는 지도 검색어를 입력해 주세요.");
      return;
    }
    setError("");
    void openGoogleMapsSearch(mapSearchQuery);
  };

  const save = () => {
    const normalizedTitle = title.trim();
    const normalizedTime = time.trim();
    const normalizedDate = date.trim();

    if (!normalizedTitle) {
      setError("장소명 또는 일정 제목을 입력해 주세요.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalizedTime)) {
      setError("시간은 09:30처럼 HH:mm 형식으로 입력해 주세요.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      setError("날짜는 2026-09-16처럼 YYYY-MM-DD 형식으로 입력해 주세요.");
      return;
    }

    const draft = {
      regionId,
      day,
      date: normalizedDate,
      time: normalizedTime,
      title: normalizedTitle,
      detail: detail.trim(),
      placeQuery: placeQuery.trim(),
    };

    if (existing) {
      updateSchedule(existing.id, draft);
    } else {
      addSchedule(draft);
    }
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    removeSchedule(existing.id);
    router.back();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
          <MaterialCommunityIcons color={colors.text} name="close" size={25} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? "일정 수정" : "일정 추가"}</Text>
        <Pressable hitSlop={10} onPress={save} style={styles.saveTop}>
          <Text style={[styles.saveTopText, { color: region.accent }]}>저장</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>지역</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionRow}>
        {homeRegions.map((item) => {
          const active = item.regionId === regionId;
          return (
            <Pressable
              key={item.regionId}
              onPress={() => setRegionId(item.regionId)}
              style={[
                styles.regionChip,
                active && { backgroundColor: item.accent, borderColor: item.accent },
              ]}
            >
              <Text style={[styles.regionChipText, active && styles.regionChipTextActive]}>{item.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>여행 일차</Text>
      <View style={styles.dayRow}>
        {[1, 2, 3, 4].map((item) => {
          const active = day === item;
          return (
            <Pressable
              key={item}
              onPress={() => setDay(item)}
              style={[
                styles.dayButton,
                active && { backgroundColor: region.accent, borderColor: region.accent },
              ]}
            >
              <Text style={[styles.dayButtonText, active && styles.dayButtonTextActive]}>{item}일차</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.twoColumn}>
        <View style={styles.flexField}>
          <Text style={styles.label}>날짜</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setDate}
            placeholder="2026-09-16"
            placeholderTextColor="#9AA4A8"
            style={styles.input}
            value={date}
          />
        </View>
        <View style={styles.timeField}>
          <Text style={styles.label}>시간</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setTime}
            placeholder="10:00"
            placeholderTextColor="#9AA4A8"
            style={styles.input}
            value={time}
          />
        </View>
      </View>

      <Text style={styles.label}>장소명 · 일정 제목</Text>
      <TextInput
        onChangeText={setTitle}
        placeholder="예: 센소지"
        placeholderTextColor="#9AA4A8"
        style={styles.input}
        value={title}
      />

      <Text style={styles.label}>지도 검색어 · 주소</Text>
      <TextInput
        onChangeText={setPlaceQuery}
        placeholder="선택 입력 · 예: Senso-ji, Asakusa"
        placeholderTextColor="#9AA4A8"
        style={styles.input}
        value={placeQuery}
      />
      <Text style={styles.helperText}>
        비워두면 장소명과 {japanRegion.city} 지역명을 조합해 Google Maps에서 검색합니다.
      </Text>
      <Pressable onPress={previewPlace} style={[styles.mapButton, { borderColor: region.accent }]}> 
        <MaterialCommunityIcons color={region.accent} name="map-search-outline" size={19} />
        <Text style={[styles.mapButtonText, { color: region.accent }]}>Google Maps에서 장소 확인</Text>
      </Pressable>

      <Text style={styles.label}>메모</Text>
      <TextInput
        multiline
        onChangeText={setDetail}
        placeholder="예: 나카미세 거리 산책 후 점심"
        placeholderTextColor="#9AA4A8"
        style={[styles.input, styles.memoInput]}
        textAlignVertical="top"
        value={detail}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={save} style={[styles.primaryButton, { backgroundColor: region.accent }]}> 
        <MaterialCommunityIcons color="#FFFFFF" name="calendar-check" size={20} />
        <Text style={styles.primaryButtonText}>{isEditing ? "수정 내용 저장" : "일정 등록"}</Text>
      </Pressable>

      {existing ? (
        <Pressable onPress={remove} style={styles.deleteButton}>
          <MaterialCommunityIcons color="#C43C35" name="trash-can-outline" size={19} />
          <Text style={styles.deleteButtonText}>일정 삭제</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.text, fontSize: 19, fontWeight: "900" },
  saveTop: { minWidth: 42, height: 42, alignItems: "flex-end", justifyContent: "center" },
  saveTopText: { fontSize: 14, fontWeight: "900" },
  label: { color: colors.text, fontSize: 12, fontWeight: "900", marginTop: 13, marginBottom: 7 },
  regionRow: { gap: 7, paddingRight: 12 },
  regionChip: { height: 36, borderRadius: radius.pill, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  regionChipText: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  regionChipTextActive: { color: "#FFFFFF" },
  dayRow: { flexDirection: "row", gap: 7 },
  dayButton: { flex: 1, height: 42, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  dayButtonText: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  dayButtonTextActive: { color: "#FFFFFF" },
  twoColumn: { flexDirection: "row", gap: 9 },
  flexField: { flex: 1 },
  timeField: { width: 112 },
  input: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 14, fontWeight: "700", paddingHorizontal: 13, paddingVertical: 11 },
  memoInput: { minHeight: 112 },
  helperText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: "600", marginTop: 6 },
  mapButton: { height: 44, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface, marginTop: 9, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  mapButtonText: { fontSize: 12, fontWeight: "900" },
  error: { color: "#C43C35", fontSize: 12, fontWeight: "800", marginTop: 12 },
  primaryButton: { height: 52, borderRadius: radius.pill, marginTop: 20, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  deleteButton: { height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: "#F0C7C4", backgroundColor: "#FFF7F6", marginTop: 10, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  deleteButtonText: { color: "#C43C35", fontSize: 13, fontWeight: "900" },
});
