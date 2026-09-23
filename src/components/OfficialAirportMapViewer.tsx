import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { MotionPressable } from "@/src/components/MotionPressable";
import { officialAirportMaps, defaultAirportMap, type AirportMapSheet } from "@/src/data/officialAirportMaps";
import type { JapanAirportCode } from "@/src/data/japanAirportGuides";
import { colors, radius } from "@/src/theme";

type Direction = "departure" | "arrival";

export function OfficialAirportMapViewer({
  airportCode,
  terminal,
  direction,
  fullscreen = false,
}: {
  airportCode: "NRT" | "CTS";
  terminal: string;
  direction: Direction;
  fullscreen?: boolean;
}) {
  const maps = officialAirportMaps[airportCode];
  const initial = useMemo(
    () => defaultAirportMap(airportCode, terminal, direction) ?? maps[0],
    [airportCode, terminal, direction, maps],
  );
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    setSelectedId(initial?.id ?? "");
    setZoom(1);
  }, [initial?.id, airportCode]);

  const selected: AirportMapSheet | undefined =
    maps.find((map) => map.id === selectedId) ?? initial;
  if (!selected) return null;

  const nominalWidth = Math.max(300, Math.min(windowWidth - (fullscreen ? 32 : 68), fullscreen ? 1240 : 820));
  const imageWidth = nominalWidth * zoom;

  return (
    <View style={[styles.wrapper, fullscreen && styles.fullscreen]}>
      <View style={styles.heading}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.eyebrow}>OFFICIAL AIRPORT TERMINAL GUIDE</Text>
          <Text style={styles.title}>{airportCode === "NRT" ? "나리타" : "신치토세"} · 공식 안내도</Text>
          <Text style={styles.source}>{selected.sourceNote}</Text>
        </View>
        <View style={styles.officialBadge}>
          <MaterialCommunityIcons color={colors.teal} name="shield-check-outline" size={14} />
          <Text style={styles.officialLabel}>공식 발행</Text>
        </View>
      </View>

      {maps.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {maps.map((map) => (
            <MotionPressable
              key={map.id}
              accessibilityLabel={map.label}
              onPress={() => { setSelectedId(map.id); setZoom(1); }}
              style={[styles.tab, selected.id === map.id && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selected.id === map.id && styles.tabTextSelected]}>
                {map.label}
              </Text>
            </MotionPressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.tools}>
        <Text style={styles.zoomLabel}>확대 {Math.round(zoom * 100)}%</Text>
        <View style={styles.zoomButtons}>
          <MotionPressable
            accessibilityLabel="지도 축소"
            onPress={() => setZoom((value) => Math.max(1, +(value - 0.5).toFixed(1)))}
            style={styles.zoomButton}
          >
            <MaterialCommunityIcons color={colors.blue} name="minus" size={19} />
          </MotionPressable>
          <MotionPressable
            accessibilityLabel="지도 확대"
            onPress={() => setZoom((value) => Math.min(3, +(value + 0.5).toFixed(1)))}
            style={styles.zoomButton}
          >
            <MaterialCommunityIcons color={colors.blue} name="plus" size={19} />
          </MotionPressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.imageScroll}
        style={[styles.imageScrollWrap, fullscreen && styles.fullscreenScroll]}
      >
        <Image
          accessibilityLabel={`${airportCode} ${selected.label} 공식 공항 안내도`}
          source={selected.image}
          resizeMode="contain"
          style={{ width: imageWidth, height: imageWidth * 1.1, backgroundColor: "#FFFFFF" }}
        />
      </ScrollView>
      <View style={styles.notice}>
        <MaterialCommunityIcons color={colors.blue} name="information-outline" size={15} />
        <Text style={styles.noticeText}>
          공항이 발행한 안내도 파일을 TripNow 안에서 표시합니다. 실시간 공식 웹 지도는 아니며,
          게이트·시설 변경은 현장 전광판에서 최종 확인하세요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 15, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F8FBFE", padding: 12, overflow: "hidden" },
  fullscreen: { flex: 1, borderWidth: 0, borderRadius: 0, padding: 14 },
  heading: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyebrow: { fontSize: 8, color: colors.blue, fontWeight: "900", letterSpacing: 0.8 },
  title: { fontSize: 15, color: colors.text, fontWeight: "900", marginTop: 3 },
  source: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  officialBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: radius.pill, backgroundColor: colors.tealSoft, paddingHorizontal: 7, paddingVertical: 5 },
  officialLabel: { color: colors.teal, fontSize: 8, fontWeight: "800" },
  tabs: { gap: 6, paddingTop: 12, paddingBottom: 8 },
  tab: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 8 },
  tabSelected: { borderColor: colors.blue, backgroundColor: "#E9F3FF" },
  tabText: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  tabTextSelected: { color: colors.blue },
  tools: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 7 },
  zoomLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  zoomButtons: { flexDirection: "row", gap: 7 },
  zoomButton: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#FFFFFF" },
  imageScrollWrap: { borderWidth: 1, borderRadius: 12, borderColor: "#DDE5EC", backgroundColor: "#FFFFFF", maxHeight: 530 },
  fullscreenScroll: { flex: 1, maxHeight: undefined },
  imageScroll: { minWidth: "100%", justifyContent: "center" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 6, paddingVertical: 10 },
  noticeText: { flex: 1, color: colors.textMuted, fontSize: 9, lineHeight: 15 },
});
