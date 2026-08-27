import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { colors, radius } from "@/src/theme";

export default function SafetyScreen() {
  return (
    <Screen>
      <Text style={styles.title}>여행 안심</Text>
      <Text style={styles.subtitle}>위급할 때 복잡한 검색 없이 필요한 기능을 바로 실행합니다.</Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>🇯🇵 일본 긴급 연락</Text>
        <Text style={styles.noticeBody}>경찰 110 · 구급/소방 119</Text>
      </View>

      <View style={styles.grid}>
        <ActionCard icon="🆘" title="긴급 SOS" subtitle="현지 긴급전화" tone="danger" />
        <ActionCard icon="📍" title="위치 공유" subtitle="현재 위치 보내기" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="👮" title="경찰서" subtitle="주변 경찰서 찾기" />
        <ActionCard icon="🏥" title="병원" subtitle="주변 의료기관 찾기" />
      </View>
      <View style={styles.grid}>
        <ActionCard icon="🇰🇷" title="한국 공관" subtitle="대사관·총영사관" tone="teal" />
        <ActionCard icon="💬" title="긴급 문장" subtitle="일본어 큰 글씨 카드" tone="teal" />
      </View>

      <View style={styles.checkin}>
        <Text style={styles.checkinTitle}>안전 체크인</Text>
        <Text style={styles.checkinBody}>호텔 도착 예정 시간을 등록하는 기능은 다음 단계에서 연결합니다.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  notice: {
    marginTop: 20,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#FFD7DA",
  },
  noticeTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  noticeBody: { color: colors.danger, marginTop: 7, fontWeight: "800" },
  grid: { flexDirection: "row", gap: 12, marginTop: 12 },
  checkin: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  checkinTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  checkinBody: { color: colors.textMuted, marginTop: 7, lineHeight: 20 },
});
