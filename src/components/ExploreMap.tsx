import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/src/theme";

type MarkerItem = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type RegionItem = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: RegionItem;
  markers: MarkerItem[];
  selectedMarkerId?: string;
  onSelectMarker?: (markerId: string) => void;
};

const positions = [
  { left: "27%", top: "34%" },
  { left: "59%", top: "53%" },
  { left: "72%", top: "25%" },
  { left: "40%", top: "68%" },
] as const;

export function ExploreMap({ markers, selectedMarkerId, onSelectMarker }: Props) {
  return (
    <View style={styles.map} accessibilityLabel="선택한 일본 지역의 장소 지도 미리보기">
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={styles.park}><Text style={styles.parkText}>CITY PARK</Text></View>
      <Text style={styles.cityLabel}>TRIPNOW MAP</Text>
      {markers.slice(0, 4).map((marker, index) => (
        <Pressable
          accessibilityLabel={`${marker.title} 선택`}
          accessibilityRole="button"
          key={marker.id}
          onPress={() => onSelectMarker?.(marker.id)}
          style={[styles.markerWrap, positions[index]]}
        >
          <View style={[styles.marker, marker.id === selectedMarkerId && styles.markerSelected]}><Text style={styles.markerText}>●</Text></View>
          <Text numberOfLines={1} style={styles.markerLabel}>{marker.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#F1EEE8" },
  road: { position: "absolute", height: 18, width: "125%", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2DDD4" },
  roadOne: { top: "23%", left: "-10%", transform: [{ rotate: "8deg" }] },
  roadTwo: { top: "57%", left: "-12%", transform: [{ rotate: "-12deg" }] },
  roadThree: { top: "40%", left: "-15%", transform: [{ rotate: "76deg" }] },
  park: { position: "absolute", right: "5%", bottom: "8%", width: "34%", height: "24%", borderRadius: radius.lg, backgroundColor: "#DDEAD7", alignItems: "center", justifyContent: "center" },
  parkText: { color: "#79A36D", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  cityLabel: { position: "absolute", left: "8%", bottom: "14%", color: "#B0A99E", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },
  markerWrap: { position: "absolute", maxWidth: 120, alignItems: "center" },
  marker: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderWidth: 3, borderColor: "#FFFFFF" },
  markerSelected: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.teal },
  markerText: { color: "#FFFFFF", fontSize: 11 },
  markerLabel: { marginTop: 4, maxWidth: 120, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.92)", color: colors.text, fontSize: 9, fontWeight: "800" },
});
