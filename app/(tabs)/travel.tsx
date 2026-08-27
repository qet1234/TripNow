import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { colors, radius } from "@/src/theme";

export default function TravelScreen() {
  return (
    <Screen>
      <Text style={styles.title}>여행</Text>
      <Text style={styles.subtitle}>일본 여행에 필요한 도구와 국가 정보를 관리합니다.</Text>

      <View style={styles.taxBanner}>
        <Text style={styles.taxEyebrow}>🇯🇵 일본 면세</Text>
        <Text style={styles.taxTitle}>2026.11.01부터 환급형</Text>
        <Text style={styles.taxBody}>
          구매 등록부터 출국 체크까지 한 화면에서 관리하도록 연결할 예정입니다.
        </Text>
      </View>

      <View style={styles.grid}>
        <ActionCard icon="🛍️" title="쇼핑·면세" subtitle="구매 · 환급 · 출국" tone="teal" />
        <ActionCard icon="💴" title="엔화 계산" subtitle="JPY → KRW" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="💬" title="상황별 회화" subtitle="식당 · 호텔 · 택시" />
        <ActionCard icon="📦" title="일본 국가팩" subtitle="오프라인 여행정보" tone="teal" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="💰" title="여행 경비" subtitle="지출 기록" />
        <ActionCard icon="ℹ️" title="일본 기본정보" subtitle="교통 · 전압 · 긴급번호" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  taxBanner: {
    marginTop: 20,
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    padding: 21,
  },
  taxEyebrow: { color: "#E9FFFA", fontSize: 13, fontWeight: "800" },
  taxTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 7 },
  taxBody: { color: "#E9FFFA", marginTop: 8, lineHeight: 20 },
  grid: { flexDirection: "row", gap: 12, marginTop: 12 },
});
