import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { colors, radius } from "@/src/theme";

export default function MoveScreen() {
  return (
    <Screen>
      <Text style={styles.title}>이동</Text>
      <Text style={styles.subtitle}>현재 위치에서 목적지까지 필요한 이동 기능을 모았습니다.</Text>

      <View style={styles.hotel}>
        <Text style={styles.hotelLabel}>내 숙소</Text>
        <Text style={styles.hotelName}>숙소를 등록해 주세요</Text>
        <Text style={styles.hotelMeta}>등록 후 항상 빠르게 귀가 경로를 확인할 수 있어요.</Text>
      </View>

      <View style={styles.grid}>
        <ActionCard icon="🏨" title="숙소로 가기" subtitle="현재 위치에서 바로" />
        <ActionCard icon="🚶" title="도보 경로" subtitle="가까운 곳 이동" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="🚇" title="대중교통" subtitle="전철·버스" tone="teal" />
        <ActionCard icon="🚕" title="택시 안심" subtitle="1차 버전은 탑승 기록" tone="teal" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  hotel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 22,
    marginBottom: 18,
  },
  hotelLabel: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  hotelName: { color: colors.text, fontWeight: "800", fontSize: 19, marginTop: 6 },
  hotelMeta: { color: colors.textMuted, marginTop: 6, lineHeight: 19 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
});
