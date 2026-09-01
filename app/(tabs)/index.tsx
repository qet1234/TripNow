import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen } from "@/src/components/Screen";
import { WeatherCard } from "@/src/components/WeatherCard";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { destinationCards } from "@/src/data/tripNowDesign";
import { getJapanRegion } from "@/src/data/japanRegions";
import { mockTrip } from "@/src/data/mockJapan";
import type { JapanPresenceResult } from "@/src/services/location";
import { colors, radius } from "@/src/theme";

const presenceMessage: Record<JapanPresenceResult, string> = {
  japan: "일본 현지 모드가 시작됐어요.",
  "outside-japan": "한국에서는 일본 여행 미리보기로 이용할 수 있어요.",
  "permission-denied": "위치 권한 없이도 도시를 직접 선택할 수 있어요.",
  unavailable: "현재 위치를 확인하지 못했어요. 도시를 직접 선택해 주세요.",
};

export default function HomeScreen() {
  const router = useRouter();
  const { mode, selectedRegionId, setSelectedRegionId, confirmJapanPresence } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState("위치는 일본 도착 여부만 단말에서 확인하고 저장하지 않아요.");

  const checkPresence = async () => {
    setChecking(true);
    const result = await confirmJapanPresence();
    setStatus(presenceMessage[result]);
    setChecking(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>트립나우</Text>
        <Text style={styles.bell}>♢</Text>
      </View>

      <Text style={styles.headline}>일본 여행,{`\n`}지금 시작해요</Text>
      <Pressable style={styles.search} onPress={() => router.push("/explore")}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>도시 · 장소를 검색해 보세요</Text>
      </Pressable>

      <ImageBackground
        source={{ uri: destinationCards[0].image }}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.heroTag}><Text style={styles.heroTagText}>TOKYO</Text></View>
          <Text style={styles.heroTitle}>도쿄의 오늘을 만나보세요</Text>
        </View>
      </ImageBackground>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityTabs}>
        {destinationCards.map((city) => {
          const active = city.regionId === selectedRegionId;
          return (
            <Pressable
              key={city.id}
              onPress={() => setSelectedRegionId(city.regionId)}
              style={[styles.cityTab, active && styles.cityTabActive]}
            >
              <Text style={[styles.cityTabText, active && styles.cityTabTextActive]}>{city.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>지금 인기 있는 여행지</Text>
        <Pressable onPress={() => router.push("/explore")}><Text style={styles.more}>›</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {destinationCards.map((city) => (
          <Pressable key={city.id} style={styles.cityCard} onPress={() => setSelectedRegionId(city.regionId)}>
            <ImageBackground source={{ uri: city.image }} imageStyle={styles.cardImage} style={styles.cardImageBox}>
              <View style={styles.cardShade}><Text style={styles.cardName}>{city.name}</Text></View>
            </ImageBackground>
            <Text numberOfLines={1} style={styles.cardSubtitle}>{city.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.modeCard}>
        <View style={styles.modeRow}>
          <View style={[styles.modeDot, mode === "local" && styles.modeDotLocal]} />
          <Text style={styles.modeTitle}>{mode === "local" ? "일본 현지 모드" : "일본 여행 미리보기"}</Text>
          <Text style={styles.regionLabel}>{region.label}</Text>
        </View>
        <Text style={styles.modeBody}>{status}</Text>
        <Pressable disabled={checking} onPress={checkPresence} style={styles.locationButton}>
          <Text style={styles.locationButtonText}>{checking ? "확인 중..." : "현재 위치로 일본 도착 확인"}</Text>
        </Pressable>
      </View>

      <WeatherCard region={region} />
      <View style={styles.exchangeCard}>
        <Text style={styles.exchangeTitle}>오늘의 참고 환율</Text>
        <Text style={styles.exchangeValue}>100엔 ≈ {mockTrip.jpy100ToKrw.toLocaleString()}원</Text>
        <Text style={styles.exchangeNote}>실제 결제 환율과 차이가 있을 수 있습니다.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: colors.primary, fontSize: 22, fontWeight: "900", letterSpacing: -0.7 },
  bell: { color: colors.text, fontSize: 23 },
  headline: { color: colors.text, fontSize: 31, lineHeight: 39, fontWeight: "900", letterSpacing: -1.3, marginTop: 10 },
  search: { minHeight: 49, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 10, backgroundColor: colors.surface, marginTop: 16 },
  searchIcon: { color: colors.textMuted, fontSize: 22 },
  searchText: { color: "#8A8E96", fontSize: 14, fontWeight: "600" },
  hero: { height: 240, marginTop: 18, justifyContent: "flex-end" },
  heroImage: { borderRadius: radius.lg },
  heroOverlay: { flex: 1, justifyContent: "flex-end", padding: 18, borderRadius: radius.lg, backgroundColor: "rgba(10,12,16,0.20)" },
  heroTag: { alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 7 },
  heroTagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  cityTabs: { paddingVertical: 14, gap: 8 },
  cityTab: { minWidth: 72, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", paddingHorizontal: 17, backgroundColor: colors.surface },
  cityTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityTabText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  cityTabTextActive: { color: "#FFFFFF" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  more: { color: colors.text, fontSize: 28 },
  cards: { gap: 10, paddingVertical: 14 },
  cityCard: { width: 132, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  cardImageBox: { height: 122, justifyContent: "flex-end" },
  cardImage: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  cardShade: { flex: 1, justifyContent: "flex-end", padding: 10, backgroundColor: "rgba(0,0,0,0.15)" },
  cardName: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  cardSubtitle: { color: colors.textMuted, fontSize: 11, fontWeight: "600", padding: 9 },
  modeCard: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 15, marginTop: 8 },
  modeRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  modeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning },
  modeDotLocal: { backgroundColor: colors.teal },
  modeTitle: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "900" },
  regionLabel: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  modeBody: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  locationButton: { alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  locationButtonText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  exchangeCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 14 },
  exchangeTitle: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  exchangeValue: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 6 },
  exchangeNote: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
});
