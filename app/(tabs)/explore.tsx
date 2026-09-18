import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ExploreMap } from "@/src/components/ExploreMap";
import { Screen } from "@/src/components/Screen";
import { useSavedPlaces } from "@/src/context/SavedPlacesContext";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { mockPlaces } from "@/src/data/mockJapan";
import { fetchNearbyJapanPlaces } from "@/src/services/places";
import { getJapanRegion, getJapanRegionsByCity, japanCities } from "@/src/data/japanRegions";
import { openGoogleMapsDirections, openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";
import type { PlaceCategory, PlacePreview } from "@/src/types/travel";

const filters = ["맛집", "카페", "관광", "쇼핑"] as const;
type Filter = (typeof filters)[number];

const categoryByFilter: Record<Filter, PlaceCategory> = {
  맛집: "food",
  카페: "cafe",
  관광: "tourism",
  쇼핑: "shopping",
};

const categoryIcon: Record<Filter, string> = {
  맛집: "🍜",
  카페: "☕",
  관광: "🏯",
  쇼핑: "🛍️",
};

export default function ExploreScreen() {
  const router = useRouter();
  const { selectedRegionId, setSelectedRegionId, mode } = useTravelMode();
  const { savedPlaces, isSaved, toggleSaved } = useSavedPlaces();
  const [activeFilter, setActiveFilter] = useState<Filter>("맛집");
  const [query, setQuery] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [livePlaces, setLivePlaces] = useState<PlacePreview[]>([]);
  const [livePlacesLoading, setLivePlacesLoading] = useState(false);
  const [livePlacesError, setLivePlacesError] = useState("");
  const region = getJapanRegion(selectedRegionId);
  const cityRegions = getJapanRegionsByCity(region.cityId);

  useEffect(() => {
    let active = true;
    setLivePlacesLoading(true);
    setLivePlacesError("");

    void fetchNearbyJapanPlaces(
      selectedRegionId,
      categoryByFilter[activeFilter],
    )
      .then((nextPlaces) => {
        if (!active) return;
        setLivePlaces(nextPlaces);
      })
      .catch(() => {
        if (!active) return;
        setLivePlaces([]);
        setLivePlacesError("실시간 장소 조회가 지연되어 추천 샘플을 표시합니다.");
      })
      .finally(() => {
        if (active) setLivePlacesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeFilter, selectedRegionId]);

  const places = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const source = savedOnly ? savedPlaces : livePlaces.length > 0 ? livePlaces : mockPlaces;
    return source.filter((place) => {
      if (place.cityId !== region.cityId || place.category !== categoryByFilter[activeFilter]) return false;
      if (!normalizedQuery) return true;
      return [place.name, place.areaLabel, place.address, ...place.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, livePlaces, query, region.cityId, savedOnly, savedPlaces]);

  useEffect(() => {
    if (!places.some((place) => place.id === selectedPlaceId)) {
      setSelectedPlaceId(places[0]?.id ?? "");
    }
  }, [places, selectedPlaceId]);

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0];
  const markers = places.length > 0
    ? places.map((place) => ({
        id: place.id,
        title: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
      }))
    : [{ id: region.id, title: region.label, latitude: region.latitude, longitude: region.longitude }];

  const selectCity = (cityId: string) => {
    const firstRegion = getJapanRegionsByCity(cityId)[0];
    if (firstRegion) setSelectedRegionId(firstRegion.id);
  };

  const openCategorySearch = () =>
    openGoogleMapsSearch(`${region.city} ${region.area} ${activeFilter}`);

  const addToSchedule = (place: PlacePreview) => {
    router.push({
      pathname: "/schedule-edit",
      params: {
        regionId: place.regionId,
        title: place.name,
        placeId: place.id,
        placeQuery: place.mapQuery,
        placeAddress: place.address,
        placeLatitude: String(place.latitude),
        placeLongitude: String(place.longitude),
      },
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TRIPNOW PLACE</Text>
          <Text style={styles.title}>{region.city} 탐색</Text>
        </View>
        <Pressable
          accessibilityLabel={savedOnly ? "전체 추천 장소 보기" : "저장한 장소만 보기"}
          onPress={() => setSavedOnly((current) => !current)}
          style={[styles.savedToggle, savedOnly && styles.savedToggleActive]}
        >
          <MaterialCommunityIcons color={savedOnly ? "#FFFFFF" : colors.primary} name={savedOnly ? "bookmark" : "bookmark-outline"} size={18} />
          <Text style={[styles.savedToggleText, savedOnly && styles.savedToggleTextActive]}>보관함 {savedPlaces.length}</Text>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={21} />
        <TextInput
          onChangeText={setQuery}
          placeholder="장소명·지역·태그 검색"
          placeholderTextColor="#9AA2AA"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <Pressable accessibilityLabel="검색어 지우기" hitSlop={8} onPress={() => setQuery("")}>
            <MaterialCommunityIcons color={colors.textMuted} name="close-circle" size={19} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filter, active && styles.filterActive]}>
              <Text style={styles.filterEmoji}>{categoryIcon[filter]}</Text>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.regionPicker}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>도시와 지역</Text>
          <Text style={styles.sectionMeta}>{mode === "local" ? "현지 모드" : "미리보기"}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cities}>
          {japanCities.map((city) => {
            const selected = city.id === region.cityId;
            return (
              <Pressable key={city.id} onPress={() => selectCity(city.id)} style={[styles.city, selected && styles.citySelected]}>
                <Text style={[styles.cityText, selected && styles.cityTextSelected]}>{city.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areas}>
          {cityRegions.map((item) => {
            const selected = item.id === selectedRegionId;
            return (
              <Pressable key={item.id} onPress={() => setSelectedRegionId(item.id)} style={[styles.area, selected && styles.areaSelected]}>
                <Text style={[styles.areaText, selected && styles.areaTextSelected]}>{item.area}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.previewNotice}>
        <MaterialCommunityIcons color={colors.blue} name="information-outline" size={18} />
        <Text style={styles.previewNoticeText}>
          {livePlacesLoading
            ? "Google Places에서 주변 장소를 불러오는 중입니다."
            : livePlaces.length > 0
              ? "Google Places 실시간 검색 결과입니다. 영업시간은 지도에서 최종 확인해 주세요."
              : livePlacesError || "추천 샘플 데이터입니다. 실제 영업시간은 지도에서 확인해 주세요."}
        </Text>
      </View>

      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>{activeFilter} 지도</Text>
        <Pressable onPress={() => void openCategorySearch()} style={styles.mapSearchLink}>
          <Text style={styles.mapSearchLinkText}>Google Maps에서 더 보기</Text>
          <MaterialCommunityIcons color={colors.primary} name="open-in-new" size={14} />
        </Pressable>
      </View>
      <View style={styles.mapCard}>
        <ExploreMap
          key={`${region.cityId}-${activeFilter}-${savedOnly}`}
          markers={markers}
          onSelectMarker={setSelectedPlaceId}
          region={region}
          selectedMarkerId={selectedPlace?.id}
        />
        <View style={styles.mapLabel}><Text style={styles.mapLabelText}>{region.label}</Text></View>
      </View>

      <View style={styles.resultHeading}>
        <Text style={styles.sectionTitle}>{savedOnly ? "저장한 장소" : "추천 장소"}</Text>
        <Text style={styles.sectionMeta}>{places.length}곳</Text>
      </View>

      {places.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons color={colors.textMuted} name={savedOnly ? "bookmark-off-outline" : "map-search-outline"} size={28} />
          <Text style={styles.emptyTitle}>{savedOnly ? "저장한 장소가 없습니다" : "검색 결과가 없습니다"}</Text>
          <Text style={styles.emptyText}>{savedOnly ? "추천 장소의 북마크 버튼을 눌러 보관해 보세요." : "검색어 또는 카테고리를 변경해 보세요."}</Text>
        </View>
      ) : (
        <View style={styles.placeList}>
          {places.map((place) => {
            const selected = place.id === selectedPlace?.id;
            const saved = isSaved(place.id);
            return (
              <View key={place.id} style={[styles.placeCard, selected && styles.placeCardSelected]}>
                <Pressable accessibilityRole="button" onPress={() => setSelectedPlaceId(place.id)} style={styles.placeSelectButton}>
                  <View style={styles.placeEmojiWrap}><Text style={styles.placeEmoji}>{categoryIcon[activeFilter]}</Text></View>
                  <View style={styles.placeInfo}>
                    <Text numberOfLines={1} style={styles.placeTitle}>{place.name}</Text>
                    <Text numberOfLines={1} style={styles.placeMeta}>{place.areaLabel}</Text>
                    <Text numberOfLines={1} style={styles.placeTags}>{place.tags.map((tag) => `#${tag}`).join(" ")}</Text>
                  </View>
                </Pressable>
                <Pressable accessibilityLabel={saved ? `${place.name} 보관함에서 삭제` : `${place.name} 보관함에 저장`} hitSlop={8} onPress={() => toggleSaved(place)} style={styles.bookmarkButton}>
                  <MaterialCommunityIcons color={saved ? colors.primary : colors.textMuted} name={saved ? "bookmark" : "bookmark-outline"} size={23} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {selectedPlace ? (
        <View style={styles.detailCard}>
          <View style={styles.detailTop}>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>선택한 장소</Text>
              <Text style={styles.detailTitle}>{selectedPlace.name}</Text>
            </View>
            <Pressable accessibilityLabel="보관함 저장 전환" onPress={() => toggleSaved(selectedPlace)} style={styles.detailSave}>
              <MaterialCommunityIcons color={colors.primary} name={isSaved(selectedPlace.id) ? "bookmark" : "bookmark-outline"} size={21} />
            </Pressable>
          </View>
          <Text style={styles.detailDescription}>{selectedPlace.description}</Text>
          <View style={styles.detailLine}>
            <MaterialCommunityIcons color={colors.textMuted} name="map-marker-outline" size={17} />
            <Text style={styles.detailLineText}>{selectedPlace.address}</Text>
          </View>
          <View style={styles.detailLine}>
            <MaterialCommunityIcons color={colors.textMuted} name="clock-outline" size={17} />
            <Text style={styles.detailLineText}>{selectedPlace.hoursLabel}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => void openGoogleMapsDirections(selectedPlace.mapQuery)} style={styles.secondaryAction}>
              <MaterialCommunityIcons color={colors.primary} name="directions" size={18} />
              <Text style={styles.secondaryActionText}>길찾기</Text>
            </Pressable>
            <Pressable onPress={() => addToSchedule(selectedPlace)} style={styles.primaryAction}>
              <MaterialCommunityIcons color="#FFFFFF" name="calendar-plus" size={18} />
              <Text style={styles.primaryActionText}>일정에 추가</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 2 },
  savedToggle: { minHeight: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12 },
  savedToggleActive: { backgroundColor: colors.primary },
  savedToggleText: { color: colors.primary, fontSize: 11, fontWeight: "900" },
  savedToggleTextActive: { color: "#FFFFFF" },
  searchBox: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13, marginTop: 10 },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 13, fontWeight: "700", paddingVertical: 11 },
  filters: { paddingVertical: 12, gap: 8 },
  filter: { height: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14 },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterEmoji: { fontSize: 14 },
  filterText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  filterTextActive: { color: "#FFFFFF" },
  regionPicker: { paddingBottom: 5 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  sectionMeta: { color: colors.textMuted, fontSize: 10, fontWeight: "700" },
  cities: { gap: 7, paddingBottom: 9, paddingTop: 8 },
  city: { minHeight: 36, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center", paddingHorizontal: 14 },
  citySelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityText: { color: colors.textMuted, fontSize: 11, fontWeight: "800" },
  cityTextSelected: { color: "#FFFFFF" },
  areas: { gap: 7, paddingBottom: 7 },
  area: { minHeight: 32, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, justifyContent: "center", paddingHorizontal: 11 },
  areaSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  areaText: { color: colors.textMuted, fontSize: 10, fontWeight: "700" },
  areaTextSelected: { color: colors.primary },
  previewNotice: { borderRadius: radius.sm, backgroundColor: "#EEF5FF", flexDirection: "row", alignItems: "center", gap: 7, padding: 10, marginTop: 4, marginBottom: 14 },
  previewNoticeText: { flex: 1, color: "#496378", fontSize: 10, lineHeight: 15, fontWeight: "700" },
  mapHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  mapSearchLink: { flexDirection: "row", alignItems: "center", gap: 3 },
  mapSearchLinkText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  mapCard: { height: 300, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  mapLabel: { position: "absolute", left: 12, top: 12, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  mapLabelText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  resultHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 17, marginBottom: 8 },
  placeList: { gap: 8 },
  placeCard: { minHeight: 78, padding: 9, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center" },
  placeCardSelected: { borderColor: colors.primary, backgroundColor: "#FFFBFA" },
  placeSelectButton: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  placeEmojiWrap: { width: 54, height: 54, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  placeEmoji: { fontSize: 25 },
  placeInfo: { flex: 1, minWidth: 0 },
  placeTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  placeMeta: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  placeTags: { color: colors.primary, fontSize: 9, fontWeight: "700", marginTop: 4 },
  bookmarkButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  emptyCard: { minHeight: 130, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: 18 },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 8 },
  emptyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 4 },
  detailCard: { marginTop: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: "#F2D3D0", backgroundColor: colors.surface, padding: 15 },
  detailTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailCopy: { flex: 1, minWidth: 0 },
  detailLabel: { color: colors.primary, fontSize: 9, fontWeight: "900" },
  detailTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 3 },
  detailSave: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  detailDescription: { color: "#52606A", fontSize: 11, lineHeight: 17, marginTop: 10, marginBottom: 7 },
  detailLine: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 6 },
  detailLineText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  secondaryAction: { flex: 1, minHeight: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondaryActionText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  primaryAction: { flex: 1.25, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  primaryActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
