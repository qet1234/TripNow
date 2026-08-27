import { Linking, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { getJapanRegion } from "@/src/data/japanRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { openGoogleMapsSearch } from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

export default function SafetyScreen() {
  const { selectedRegionId } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);

  return (
    <Screen>
      <Text style={styles.title}>여행 안심</Text>
      <Text style={styles.subtitle}>
        위치 공유나 이동경로 저장 없이 선택 지역 기준의 안전 기능을 제공합니다.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>🇯🇵 일본 긴급 연락</Text>
        <Text style={styles.noticeBody}>경찰 110 · 구급/소방 119</Text>
      </View>

      <View style={styles.areaNote}>
        <Text style={styles.areaTitle}>안전정보 기준 지역</Text>
        <Text style={styles.areaBody}>{region.label}</Text>
      </View>

      <View style={styles.grid}>
        <ActionCard
          icon="🆘"
          title="경찰 110"
          subtitle="전화 앱 열기"
          tone="danger"
          onPress={() => Linking.openURL("tel:110")}
        />
        <ActionCard
          icon="🚑"
          title="구급·소방 119"
          subtitle="전화 앱 열기"
          tone="danger"
          onPress={() => Linking.openURL("tel:119")}
        />
      </View>
      <View style={styles.grid}>
        <ActionCard
          icon="👮"
          title="경찰서"
          subtitle="선택 지역 기준 Google Maps 검색"
          onPress={() => openGoogleMapsSearch(region.label + " police station Japan")}
        />
        <ActionCard
          icon="🏥"
          title="병원"
          subtitle="선택 지역 기준 Google Maps 검색"
          onPress={() => openGoogleMapsSearch(region.label + " hospital Japan")}
        />
      </View>
      <View style={styles.grid}>
        <ActionCard
          icon="🇰🇷"
          title="한국 공관"
          subtitle="대사관·총영사관 정보"
          tone="teal"
        />
        <ActionCard
          icon="💬"
          title="긴급 문장"
          subtitle="일본어 큰 글씨 카드"
          tone="teal"
        />
      </View>

      <View style={styles.checkin}>
        <Text style={styles.checkinTitle}>1차 버전 개인정보 원칙</Text>
        <Text style={styles.checkinBody}>
          현재 위치 공유, 위치 이력 저장, 백그라운드 추적 기능은 사용하지 않습니다.
        </Text>
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
  areaNote: {
    marginTop: 12,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  areaTitle: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  areaBody: { color: colors.primary, fontSize: 17, fontWeight: "800", marginTop: 4 },
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
