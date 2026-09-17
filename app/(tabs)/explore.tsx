import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ExploreMap } from "@/src/components/ExploreMap";
import { Screen } from "@/src/components/Screen";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { mockPlaces } from "@/src/data/mockJapan";
import { getJapanRegion, japanRegions } from "@/src/data/japanRegions";
import { openGoogleMapsDirections, openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

const filters = ["맛집", "카페", "관광", "쇼핑"] as const;
const restaurantCategories = ["스시", "라멘", "야키니쿠", "카페"] as const;

export default function ExploreScreen() {
  const { selectedRegionId, setSelectedRegionId, mode } = useTravelMode();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("맛집");
  const region = getJapanRegion(selectedRegionId);
  const places = selectedRegionId === "tokyo-shibuya" ? mockPlaces : [];

  const openRestaurantSearch = (category?: (typeof restaurantCategories)[number]) => {
    const keyword = category ?? "맛집";
    return openGoogleMapsSearch(`${region.city} ${region.area} ${keyword}`);
  };

  const markers = places.length > 0
    ? places.map((place, index) => ({
        id: place.id,
        title: place.name,
        latitude: region.latitude + (index - 0.5) * 0.004,
        longitude: region.longitude + (index - 0.5) * 0.004,
      }))
    : [{ id: region.id, title: region.label, latitude: region.latitude, longitude: region.longitude }];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.title}>{region.city} 탐색</Text>
        <Text style={styles.options}>☷</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={[styles.filter, active && styles.filterActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regions}>
        {japanRegions.map((item) => {
          const selected = item.id === selectedRegionId;
          return (
            <Pressable key={item.id} onPress={() => setSelectedRegionId(item.id)} style={[styles.region, selected && styles.regionSelected]}>
              <Text style={[styles.regionText, selected && styles.regionTextSelected]}>{item.city} · {item.area}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.modeNote}>
        <View style={styles.modeDot} />
        <Text style={styles.modeNoteText}>{mode === "local" ? "현지 모드" : "미리보기"} · 선택 지역 기준으로 표시합니다.</Text>
      </View>

      <View style={styles.restaurantSearchCard}>
        <Text style={styles.restaurantSearchTitle}>{region.area} 맛집 찾기</Text>
        <Text style={styles.restaurantSearchDescription}>
          Google Maps에서 검색 결과를 열어 비교하고 길찾기까지 이어갈 수 있어요.
        </Text>
        <Pressable
          accessibilityHint="Google Maps 검색 결과를 엽니다"
          accessibilityRole="link"
          onPress={() => openRestaurantSearch()}
          style={styles.restaurantSearchButton}
        >
          <Text style={styles.restaurantSearchButtonText}>{region.area} 맛집 보기 ↗</Text>
        </Pressable>
        <View style={styles.restaurantCategories}>
          {restaurantCategories.map((category) => (
            <Pressable
              accessibilityHint={`Google Maps에서 ${region.area} ${category} 검색 결과를 엽니다`}
              accessibilityRole="link"
              key={category}
              onPress={() => openRestaurantSearch(category)}
              style={styles.restaurantCategory}
            >
              <Text style={styles.restaurantCategoryText}>{category}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.mapCard}>
        <ExploreMap key={selectedRegionId} region={region} markers={markers} />
        <View style={styles.mapLabel}><Text style={styles.mapLabelText}>{region.label}</Text></View>
      </View>

      <View style={styles.placeCard}>
        <View style={styles.placeImage}><Text style={styles.placeEmoji}>{activeFilter === "맛집" ? "🍜" : activeFilter === "카페" ? "☕" : activeFilter === "쇼핑" ? "🛍️" : "🏯"}</Text></View>
        <View style={styles.placeInfo}>
          <Text style={styles.placeTitle}>{places[0]?.name ?? `${region.area} 추천 장소`}</Text>
          <Text style={styles.placeMeta}>{places[0]?.areaLabel ?? "실시간 장소 API 연결 준비 중"}</Text>
          <Text style={styles.placeOpen}>{places[0]?.openNow ? "● 영업 정보 예시" : "운영시간 확인 필요"}</Text>
        </View>
        <Pressable
          style={styles.save}
          onPress={() => openGoogleMapsDirections(places[0]?.mapQuery ?? `${region.label} ${activeFilter}`)}
        >
          <Text style={styles.saveText}>길찾기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: colors.text, fontSize: 30 },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  options: { color: colors.text, fontSize: 22 },
  filters: { paddingVertical: 10, gap: 8 },
  filter: { height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: "center", paddingHorizontal: 16 },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  regions: { gap: 8, paddingBottom: 10 },
  region: { borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  regionSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  regionText: { color: colors.textMuted, fontSize: 11, fontWeight: "700" },
  regionTextSelected: { color: colors.primary },
  modeNote: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  modeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.teal },
  modeNoteText: { color: colors.textMuted, fontSize: 11 },
  restaurantSearchCard: { marginBottom: 14, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  restaurantSearchTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  restaurantSearchDescription: { marginTop: 5, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  restaurantSearchButton: { marginTop: 12, minHeight: 46, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  restaurantSearchButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  restaurantCategories: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  restaurantCategory: { minWidth: 72, flexGrow: 1, minHeight: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  restaurantCategoryText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  mapCard: { height: 360, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  mapLabel: { position: "absolute", left: 12, top: 12, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  mapLabelText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  placeCard: { minHeight: 116, marginTop: 14, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 11 },
  placeImage: { width: 82, height: 92, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  placeEmoji: { fontSize: 35 },
  placeInfo: { flex: 1, alignSelf: "flex-start", paddingTop: 9, gap: 5 },
  placeTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  placeMeta: { color: colors.textMuted, fontSize: 11 },
  placeOpen: { color: colors.teal, fontSize: 11, fontWeight: "700" },
  save: { alignSelf: "flex-end", borderRadius: 9, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 11, paddingVertical: 8 },
  saveText: { color: colors.primary, fontSize: 11, fontWeight: "900" },
});
