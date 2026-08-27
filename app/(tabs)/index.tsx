import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { ActionCard } from "@/src/components/ActionCard";
import { mockTrip } from "@/src/data/mockJapan";
import { getJapanRegion, japanRegions } from "@/src/data/japanRegions";
import { useTravelMode } from "@/src/context/TravelModeContext";
import type { JapanPresenceResult } from "@/src/services/location";
import { colors, radius } from "@/src/theme";

const presenceMessage: Record<JapanPresenceResult, string> = {
  japan: "일본 권역으로 확인되었습니다. 현지 모드를 시작합니다.",
  "outside-japan": "일본 외 지역으로 확인되어 미리보기 모드를 유지합니다.",
  "permission-denied": "위치 권한 없이도 지역을 직접 선택해 미리보기를 사용할 수 있습니다.",
  unavailable: "현재 위치를 확인할 수 없습니다. 지역을 직접 선택해 주세요.",
};

export default function NowScreen() {
  const {
    mode,
    selectedRegionId,
    setSelectedRegionId,
    confirmJapanPresence,
  } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);
  const [status, setStatus] = useState(
    "위치 확인은 일본 도착 여부 판정에만 사용되며 좌표는 저장·전송하지 않습니다.",
  );
  const [checking, setChecking] = useState(false);

  const handlePresenceCheck = async () => {
    setChecking(true);
    const result = await confirmJapanPresence();
    setStatus(presenceMessage[result]);
    setChecking(false);
  };

  return (
    <Screen>
      <Text style={styles.brand}>TripNow</Text>

      <View style={[styles.modeBanner, mode === "local" && styles.localBanner]}>
        <Text style={styles.modeTitle}>
          {mode === "local" ? "🇯🇵 일본 현지 모드" : "🧳 일본 여행 미리보기"}
        </Text>
        <Text style={styles.modeBody}>{status}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={handlePresenceCheck}
          disabled={checking}
          style={({ pressed }) => [
            styles.locationButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.locationButtonText}>
            {checking ? "확인 중..." : "현재 위치로 일본 도착 확인"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>지역 선택</Text>
      <View style={styles.regionWrap}>
        {japanRegions.map((item) => {
          const selected = item.id === selectedRegionId;
          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedRegionId(item.id)}
              style={[
                styles.regionChip,
                selected && styles.regionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.regionChipText,
                  selected && styles.regionChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tripCard}>
        <Text style={styles.tripTitle}>🇯🇵 {region.label}</Text>
        <Text style={styles.tripMeta}>
          {mode === "local"
            ? "현지 모드 · 선택 지역 기준"
            : "미리보기 모드 · 선택 지역 기준"}
        </Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipMain}>☀️ {mockTrip.temperatureC}°C</Text>
            <Text style={styles.chipSub}>{mockTrip.weatherLabel} · API 연결 예정</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipMain}>
              💴 100엔 ≈ {mockTrip.jpy100ToKrw.toLocaleString()}원
            </Text>
            <Text style={styles.chipSub}>참고 환율 · API 연결 예정</Text>
          </View>
        </View>
      </View>

      <Text style={styles.heading}>
        {mode === "local" ? "현지에서 무엇이 필요하세요?" : "일본 여행을 미리 살펴보세요"}
      </Text>

      <View style={styles.grid}>
        <ActionCard
          icon="🏨"
          title="숙소로 돌아가기"
          subtitle="목적지만 Google Maps에 전달"
        />
        <ActionCard
          icon="🍜"
          title="이 지역 먹을 곳"
          subtitle={region.area + " 기준으로 검색"}
        />
      </View>
      <View style={styles.grid}>
        <ActionCard
          icon="🏯"
          title="이 지역 갈 곳"
          subtitle="GPS가 아닌 선택 지역 기준"
        />
        <ActionCard
          icon="🚇"
          title="이동하기"
          subtitle="길찾기는 Google Maps에서 처리"
        />
      </View>
      <View style={styles.grid}>
        <ActionCard
          icon="💬"
          title="말 보여주기"
          subtitle="상황별 일본어 카드"
          tone="teal"
        />
        <ActionCard
          icon="🛡️"
          title="여행 안심"
          subtitle="선택 지역 경찰·병원·공관"
          tone="teal"
        />
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
  modeBanner: {
    backgroundColor: "#FFF7E8",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#F6D79A",
    padding: 16,
    marginBottom: 18,
  },
  localBanner: {
    backgroundColor: colors.tealSoft,
    borderColor: "#BCE9DF",
  },
  modeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  modeBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  locationButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  locationButtonText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.65,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },
  regionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  regionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
  },
  regionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  regionChipText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  regionChipTextSelected: {
    color: "#FFFFFF",
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
