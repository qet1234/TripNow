import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { mockTrip } from "@/src/data/mockJapan";
import { colors, radius } from "@/src/theme";

export default function NowScreen() {
  return (
    <Screen>
      <Text style={styles.brand}>TripNow</Text>

      <View style={styles.tripCard}>
        <Text style={styles.tripTitle}>
          🇯🇵 {mockTrip.countryName} · {mockTrip.city}
        </Text>
        <Text style={styles.tripMeta}>
          여행 {mockTrip.day}일차 · 현지시간 {mockTrip.localTime}
        </Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipMain}>☀️ {mockTrip.temperatureC}°C</Text>
            <Text style={styles.chipSub}>{mockTrip.weatherLabel}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipMain}>
              💴 100엔 ≈ {mockTrip.jpy100ToKrw.toLocaleString()}원
            </Text>
            <Text style={styles.chipSub}>참고 환율</Text>
          </View>
        </View>
      </View>

      <Text style={styles.heading}>지금 무엇이 필요하세요?</Text>

      <View style={styles.grid}>
        <ActionCard icon="🏨" title="숙소로 돌아가기" subtitle="등록한 숙소까지 빠르게" />
        <ActionCard icon="🍜" title="지금 먹을 곳" subtitle="영업 중 · 가까운 곳" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="🏯" title="지금 갈 곳" subtitle="시간·거리 기준으로 찾기" />
        <ActionCard icon="🚇" title="이동하기" subtitle="도보 · 대중교통 · 택시" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="💬" title="말 보여주기" subtitle="상황별 일본어 카드" tone="teal" />
        <ActionCard icon="🛡️" title="여행 안심" subtitle="SOS · 위치 공유 · 병원" tone="teal" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 14,
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  tripTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  tripMeta: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 14,
  },
  chips: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  chip: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    padding: 12,
  },
  chipMain: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  chipSub: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
