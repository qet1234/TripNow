import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useSchedule } from "@/src/context/ScheduleContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getHomeRegion, homeRegions } from "@/src/data/homeRegions";
import { getJapanRegion } from "@/src/data/japanRegions";
import {
  autocompleteJapanPlaces,
  fetchJapanPlaceDetails,
  type PlaceSuggestion,
} from "@/src/services/places";
import { openGoogleMapsSearch } from "@/src/services/navigation";
import { getLocalIsoDate, isValidScheduleDate } from "@/src/services/schedule";
import { colors, radius } from "@/src/theme";

function getOptionalCoordinate(value?: string) {
  if (!value) return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export default function ScheduleEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    regionId?: string;
    day?: string;
    title?: string;
    placeId?: string;
    placeQuery?: string;
    placeAddress?: string;
    placeLatitude?: string;
    placeLongitude?: string;
    source?: string;
  }>();
  const { selectedRegionId, setSelectedRegionId } = useTravelMode();
  const { addSchedule, getScheduleById, removeSchedule, updateSchedule } = useSchedule();
  const existing = params.id ? getScheduleById(params.id) : undefined;

  const initialDay = Math.max(1, Math.min(4, Number(params.day ?? "1") || 1));
  const [regionId, setRegionId] = useState(params.regionId ?? selectedRegionId);
  const [day, setDay] = useState(initialDay);
  const [date, setDate] = useState(getLocalIsoDate());
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState(params.title ?? "");
  const [placeQuery, setPlaceQuery] = useState(params.placeQuery ?? "");
  const [detail, setDetail] = useState("");
  const [placeId, setPlaceId] = useState(params.placeId ?? "");
  const [placeAddress, setPlaceAddress] = useState(params.placeAddress ?? "");
  const [placeLatitude, setPlaceLatitude] = useState<number | undefined>(() => getOptionalCoordinate(params.placeLatitude));
  const [placeLongitude, setPlaceLongitude] = useState<number | undefined>(() => getOptionalCoordinate(params.placeLongitude));
  const [googleMapsUri, setGoogleMapsUri] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [searchError, setSearchError] = useState("");
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
    setPlaceId(existing.placeId ?? "");
    setPlaceAddress(existing.placeAddress ?? "");
    setPlaceLatitude(existing.placeLatitude);
    setPlaceLongitude(existing.placeLongitude);
    setGoogleMapsUri(existing.googleMapsUri ?? "");
  }, [existing?.id]);

  const region = useMemo(() => getHomeRegion(regionId), [regionId]);
  const japanRegion = useMemo(() => getJapanRegion(regionId), [regionId]);
  const isEditing = Boolean(existing);
  const mapSearchQuery = useMemo(() => {
    if (placeLatitude !== undefined && placeLongitude !== undefined) {
      return `${placeLatitude},${placeLongitude}`;
    }
    if (placeAddress.trim()) return placeAddress.trim();
    if (placeQuery.trim()) return placeQuery.trim();
    const name = title.trim();
    return name ? `${name} ${japanRegion.city} Japan` : "";
  }, [japanRegion.city, placeAddress, placeLatitude, placeLongitude, placeQuery, title]);

  useEffect(() => {
    const query = placeQuery.trim();
    if (query.length < 2 || placeId) {
      setSuggestions([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError("");
      void autocompleteJapanPlaces(query, regionId)
        .then((items) => {
          if (!cancelled) setSuggestions(items);
        })
        .catch((requestError: unknown) => {
          if (!cancelled) {
            setSuggestions([]);
            setSearchError(requestError instanceof Error ? requestError.message : "장소 검색에 실패했습니다.");
          }
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placeId, placeQuery, regionId]);

  const clearSelectedPlace = () => {
    setPlaceId("");
    setPlaceAddress("");
    setPlaceLatitude(undefined);
    setPlaceLongitude(undefined);
    setGoogleMapsUri("");
  };

  const changePlaceQuery = (value: string) => {
    setPlaceQuery(value);
    clearSelectedPlace();
  };

  const chooseSuggestion = async (suggestion: PlaceSuggestion) => {
    setSelecting(true);
    setSearchError("");
    try {
      const place = await fetchJapanPlaceDetails(suggestion.placeId);
      setPlaceId(place.placeId);
      setPlaceQuery(place.name || suggestion.mainText || suggestion.text);
      setPlaceAddress(place.address);
      setPlaceLatitude(place.latitude);
      setPlaceLongitude(place.longitude);
      setGoogleMapsUri(place.googleMapsUri ?? "");
      setSuggestions([]);
      if (!title.trim()) setTitle(place.name || suggestion.mainText || suggestion.text);
    } catch (requestError) {
      setSearchError(requestError instanceof Error ? requestError.message : "장소 상세정보를 불러오지 못했습니다.");
    } finally {
      setSelecting(false);
    }
  };

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
    if (!isValidScheduleDate(normalizedDate)) {
      setError("날짜는 2026-09-16처럼 실제 존재하는 날짜로 입력해 주세요.");
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
      placeId,
      placeAddress,
      placeLatitude,
      placeLongitude,
      googleMapsUri,
    };

    if (existing) {
      updateSchedule(existing.id, draft);
    } else {
      addSchedule(draft);
    }
    setSelectedRegionId(regionId);
    if (!existing && params.source === "explore") {
      router.replace({
        pathname: "/schedule",
        params: { added: "1", day: String(day) },
      });
      return;
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
              onPress={() => {
                setRegionId(item.regionId);
                clearSelectedPlace();
                setSuggestions([]);
              }}
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
          <TextInput autoCapitalize="none" onChangeText={setDate} placeholder="2026-09-16" placeholderTextColor="#9AA4A8" style={styles.input} value={date} />
        </View>
        <View style={styles.timeField}>
          <Text style={styles.label}>시간</Text>
          <TextInput autoCapitalize="none" onChangeText={setTime} placeholder="10:00" placeholderTextColor="#9AA4A8" style={styles.input} value={time} />
        </View>
      </View>

      <Text style={styles.label}>장소명 · 일정 제목</Text>
      <TextInput onChangeText={setTitle} placeholder="예: 센소지" placeholderTextColor="#9AA4A8" style={styles.input} value={title} />

      <Text style={styles.label}>일본 장소 검색</Text>
      <View style={[styles.placeSearchBox, placeId ? { borderColor: region.accent } : null]}>
        <MaterialCommunityIcons color={placeId ? region.accent : colors.textMuted} name={placeId ? "map-marker-check" : "magnify"} size={20} />
        <TextInput
          autoCapitalize="none"
          onChangeText={changePlaceQuery}
          placeholder={`${japanRegion.city} 장소명을 검색하세요`}
          placeholderTextColor="#9AA4A8"
          style={styles.placeInput}
          value={placeQuery}
        />
        {searching || selecting ? <Text style={styles.searchingText}>검색중</Text> : null}
      </View>

      {suggestions.length > 0 ? (
        <View style={styles.suggestionBox}>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion.placeId}
              onPress={() => void chooseSuggestion(suggestion)}
              style={[styles.suggestionItem, index < suggestions.length - 1 && styles.suggestionDivider]}
            >
              <MaterialCommunityIcons color={region.accent} name="map-marker-outline" size={19} />
              <View style={styles.suggestionCopy}>
                <Text numberOfLines={1} style={styles.suggestionTitle}>{suggestion.mainText || suggestion.text}</Text>
                {suggestion.secondaryText ? <Text numberOfLines={1} style={styles.suggestionMeta}>{suggestion.secondaryText}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {searchError ? <Text style={styles.searchError}>{searchError}</Text> : null}

      {placeId ? (
        <View style={[styles.selectedPlace, { backgroundColor: region.soft }]}> 
          <MaterialCommunityIcons color={region.accent} name="check-circle" size={18} />
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedTitle}>
              {placeId.startsWith("mock:") ? "추천 장소 선택 완료" : "Google Places 장소 선택 완료"}
            </Text>
            <Text numberOfLines={2} style={styles.selectedAddress}>{placeAddress}</Text>
            {placeLatitude !== undefined && placeLongitude !== undefined ? (
              <Text style={styles.coordinateText}>{placeLatitude.toFixed(6)}, {placeLongitude.toFixed(6)}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <Text style={styles.helperText}>2글자 이상 입력하면 선택 지역 주변의 일본 장소를 자동완성합니다.</Text>
      )}

      <Pressable onPress={previewPlace} style={[styles.mapButton, { borderColor: region.accent }]}> 
        <MaterialCommunityIcons color={region.accent} name="map-search-outline" size={19} />
        <Text style={[styles.mapButtonText, { color: region.accent }]}>Google Maps에서 장소 확인</Text>
      </Pressable>

      <Text style={styles.label}>메모</Text>
      <TextInput multiline onChangeText={setDetail} placeholder="예: 나카미세 거리 산책 후 점심" placeholderTextColor="#9AA4A8" style={[styles.input, styles.memoInput]} textAlignVertical="top" value={detail} />

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
  placeSearchBox: { minHeight: 50, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8 },
  placeInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14, fontWeight: "700", paddingVertical: 11 },
  searchingText: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  suggestionBox: { borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginTop: 6, overflow: "hidden" },
  suggestionItem: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionCopy: { flex: 1, minWidth: 0 },
  suggestionTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  suggestionMeta: { color: colors.textMuted, fontSize: 10, fontWeight: "600", marginTop: 3 },
  searchError: { color: "#C43C35", fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 7 },
  helperText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: "600", marginTop: 6 },
  selectedPlace: { borderRadius: 13, marginTop: 7, padding: 11, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  selectedCopy: { flex: 1 },
  selectedTitle: { color: colors.text, fontSize: 11, fontWeight: "900" },
  selectedAddress: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  coordinateText: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  mapButton: { height: 44, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface, marginTop: 9, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  mapButtonText: { fontSize: 12, fontWeight: "900" },
  error: { color: "#C43C35", fontSize: 12, fontWeight: "800", marginTop: 12 },
  primaryButton: { height: 52, borderRadius: radius.pill, marginTop: 20, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  deleteButton: { height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: "#F0C7C4", backgroundColor: "#FFF7F6", marginTop: 10, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  deleteButtonText: { color: "#C43C35", fontSize: 13, fontWeight: "900" },
});
