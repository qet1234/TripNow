import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { mockPlaces } from "@/src/data/mockJapan";
import { colors, radius } from "@/src/theme";

export default function ExploreScreen() {
  return (
    <Screen>
      <Text style={styles.title}>찾기</Text>
      <Text style={styles.subtitle}>지금 갈 수 있는 관광지와 음식점을 찾아보세요.</Text>

      <View style={styles.filters}>
        {["관광지", "음식", "현재 영업 중", "도보 10분", "실내"].map((item) => (
          <View key={item} style={styles.filter}>
            <Text style={styles.filterText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {mockPlaces.map((place) => (
          <View key={place.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.placeIcon}>
                <Text style={styles.placeEmoji}>
                  {place.category === "food" ? "🍜" : "🏯"}
                </Text>
              </View>
              <View style={styles.placeBody}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.meta}>
                  도보 {place.walkingMinutes}분 · {place.distanceMeters}m
                </Text>
                <Text style={styles.open}>
                  {place.openNow ? "● 현재 영업 중" : "영업정보 확인 필요"}
                </Text>
                <Text style={styles.meta}>{place.hoursLabel}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Text style={styles.actionPrimary}>길찾기</Text>
              <Text style={styles.actionSecondary}>저장</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
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
    gap: 18,
    marginTop: 16,
  },
  actionPrimary: { color: colors.primary, fontWeight: "800" },
  actionSecondary: { color: colors.textMuted, fontWeight: "700" },
});
