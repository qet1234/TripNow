import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { mockPlaces } from "@/src/data/mockJapan";
import { getJapanRegion, japanRegions } from "@/src/data/japanRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { openGoogleMapsDirections } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

export default function ExploreScreen() {
  const { selectedRegionId, setSelectedRegionId, mode } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);
  const places = selectedRegionId === "tokyo-shibuya" ? mockPlaces : [];

  return (
    <Screen>
      <Text style={styles.title}>찾기</Text>
      <Text style={styles.subtitle}>
        현재 GPS가 아니라 사용자가 선택한 지역을 기준으로 장소를 찾습니다.
      </Text>

      <View style={styles.modeNote}>
        <Text style={styles.modeNoteText}>
          {mode === "local" ? "현지 모드" : "미리보기"} · {region.label}
        </Text>
      </View>

      <View style={styles.regions}>
        {japanRegions.map((item) => {
          const selected = item.id === selectedRegionId;
          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedRegionId(item.id)}
              style={[styles.region, selected && styles.regionSelected]}
            >
              <Text style={[styles.regionText, selected && styles.regionTextSelected]}>
                {item.city} {item.area}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filters}>
        {["관광지", "음식", "카페", "쇼핑", "현재 영업 중"].map((item) => (
          <View key={item} style={styles.filter}>
            <Text style={styles.filterText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {places.length > 0 ? (
          places.map((place) => (
            <View key={place.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.placeIcon}>
                  <Text style={styles.placeEmoji}>
                    {place.category === "food" ? "🍜" : "🏯"}
                  </Text>
                </View>
                <View style={styles.placeBody}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.meta}>{place.areaLabel}</Text>
                  <Text style={styles.open}>
                    {place.openNow ? "● 영업 정보 예시" : "영업정보 확인 필요"}
                  </Text>
                  <Text style={styles.meta}>{place.hoursLabel}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openGoogleMapsDirections(place.mapQuery)}>
                  <Text style={styles.actionPrimary}>Google Maps 길찾기</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{region.label}</Text>
            <Text style={styles.emptyBody}>
              이 지역의 실시간 장소 결과는 Google Places 연결 단계에서 표시됩니다.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  modeNote: {
    marginTop: 16,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    padding: 12,
  },
  modeNoteText: { color: colors.primary, fontWeight: "800" },
  regions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  region: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  regionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  regionText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  regionTextSelected: { color: "#FFFFFF" },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
  },
  filterText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  list: { gap: 12, marginTop: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
  },
  row: { flexDirection: "row", gap: 14 },
  placeIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  placeEmoji: { fontSize: 32 },
  placeBody: { flex: 1 },
  placeName: { color: colors.text, fontSize: 18, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  open: { color: colors.teal, fontSize: 13, fontWeight: "700", marginTop: 6 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  actionPrimary: { color: colors.primary, fontWeight: "800" },
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 20,
  },
  emptyTitle: { color: colors.text, fontWeight: "800", fontSize: 18 },
  emptyBody: { color: colors.textMuted, marginTop: 7, lineHeight: 20 },
});
