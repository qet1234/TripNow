import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { GalaxyTransitLiveCard } from "@/src/components/GalaxyTransitLiveCard";
import { getJapanRegion } from "@/src/data/japanRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";
import {
  openGoogleMapsDirections,
  openGoogleMapsSearch,
} from "@/src/services/navigation";
import { colors, radius } from "@/src/theme";

export default function MoveScreen() {
  const { selectedRegionId } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);

  return (
    <Screen>
      <Text style={styles.title}>이동</Text>
      <Text style={styles.subtitle}>
        지하철 이동을 시작하면 지원되는 갤럭시에서 출발·도착·다음 역 정보를
        잠금화면과 상태바에 계속 표시할 수 있습니다.
      </Text>

      <View style={styles.regionCard}>
        <Text style={styles.regionLabel}>선택 지역</Text>
        <Text style={styles.regionName}>{region.label}</Text>
        <Text style={styles.regionMeta}>
          관광·교통 검색은 이 지역을 기준으로 합니다.
        </Text>
      </View>

      <GalaxyTransitLiveCard />

      <View style={styles.hotel}>
        <Text style={styles.hotelLabel}>내 숙소</Text>
        <Text style={styles.hotelName}>숙소를 등록해 주세요</Text>
        <Text style={styles.hotelMeta}>
          숙소 정보는 기기에 저장하고 길찾기 때 목적지만 Google Maps에
          전달합니다.
        </Text>
      </View>

      <View style={styles.grid}>
        <ActionCard
          icon="🏨"
          title="숙소로 가기"
          subtitle="숙소 등록 후 Google Maps 연결"
        />
        <ActionCard
          icon="🗺️"
          title="선택 지역 열기"
          subtitle={region.label + " 지도 보기"}
          onPress={() => openGoogleMapsSearch(region.label + " Japan")}
        />
      </View>

      <View style={styles.grid}>
        <ActionCard
          icon="🚇"
          title="대중교통"
          subtitle="경로 선택 후 갤럭시 실시간 안내"
          tone="teal"
          onPress={() => openGoogleMapsDirections(region.label + " Japan")}
        />
        <ActionCard
          icon="🚕"
          title="택시 정보"
          subtitle="실시간 위치 추적 없이 제공"
          tone="teal"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 6, color: colors.textMuted, lineHeight: 21 },
  regionCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 17,
    marginTop: 20,
    marginBottom: 14,
  },
  regionLabel: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  regionName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 5,
  },
  regionMeta: { color: colors.textMuted, marginTop: 5, lineHeight: 19 },
  hotel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 18,
  },
  hotelLabel: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  hotelName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 19,
    marginTop: 6,
  },
  hotelMeta: { color: colors.textMuted, marginTop: 6, lineHeight: 19 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
});
