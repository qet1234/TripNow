import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getHomeRegion, homeRegions } from "@/src/data/homeRegions";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const quickActions: ReadonlyArray<{
  label: string;
  icon: IconName;
  route: "/profile" | "/travel";
  warm?: boolean;
}> = [
  { label: "호텔 주소", icon: "bed-king-outline", route: "/travel" },
  { label: "쿠폰", icon: "ticket-percent-outline", route: "/travel" },
  { label: "여행 경비", icon: "wallet-outline", route: "/profile" },
  { label: "보관함", icon: "bookmark-outline", route: "/profile", warm: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const { selectedRegionId, setSelectedRegionId } = useTravelMode();
  const region = getHomeRegion(selectedRegionId);

  return (
    <Screen>
      <View style={[styles.themeWash, { backgroundColor: region.soft }]} />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={[styles.brand, { color: region.accentDark }]}>트립나우</Text>
          <View style={styles.brandMark}>
            <View style={[styles.sun, { backgroundColor: region.softStrong }]} />
            <MaterialCommunityIcons color={region.accent} name={region.landmarkIcon} size={38} />
          </View>
        </View>
        <Pressable
          accessibilityLabel="알림 열기"
          hitSlop={10}
          style={styles.bellButton}
          onPress={() => router.push("/profile")}
        >
          <MaterialCommunityIcons color="#10242A" name="bell-outline" size={27} />
          <View style={[styles.alertDot, { backgroundColor: region.accent }]} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.regionTabs}
      >
        {homeRegions.map((item) => {
          const active = item.id === region.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.id}
              onPress={() => setSelectedRegionId(item.regionId)}
              style={[
                styles.regionTab,
                active && { backgroundColor: region.accent, borderColor: region.accent },
              ]}
            >
              <Text style={[styles.regionTabText, active && styles.regionTabTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.titleBlock}>
        <View>
          <Text style={[styles.cityTitle, { color: region.accentDark }]}>{region.name},</Text>
          <Text style={styles.headline}>오늘의 여행</Text>
          <Text style={styles.tripDay}>여행 2일차</Text>
        </View>
        <View style={styles.titleDecoration}>
          <MaterialCommunityIcons
            color={region.accent}
            name={region.landmarkIcon}
            size={64}
            style={styles.landmark}
          />
          <Text style={[styles.eyebrow, { color: region.accent }]}>{region.eyebrow}</Text>
        </View>
      </View>

      <Pressable style={styles.search} onPress={() => router.push("/explore")}>
        <MaterialCommunityIcons color="#52636C" name="magnify" size={23} />
        <Text style={styles.searchText}>장소나 역 이름 검색</Text>
        <View style={styles.searchDivider} />
        <MaterialCommunityIcons color={region.accent} name="tune-variant" size={21} />
      </Pressable>

      <ImageBackground
        accessibilityLabel={`${region.name} 대표 여행 사진`}
        imageStyle={styles.heroImage}
        source={{ uri: region.heroImage }}
        style={styles.hero}
      >
        <View style={styles.heroShade}>
          <Text style={styles.heroCity}>{region.englishName}</Text>
          <Text style={styles.heroDescription}>{region.description}</Text>
        </View>
      </ImageBackground>

      <View style={[styles.ticket, { borderColor: region.softStrong }]}>
        <View style={[styles.ticketBand, { backgroundColor: region.accent }]} />
        <View style={[styles.notch, styles.notchLeft]} />
        <View style={[styles.notch, styles.notchRight]} />
        <View style={styles.ticketCopy}>
          <View style={styles.ticketLabelRow}>
            <MaterialCommunityIcons color={region.accent} name="calendar-blank-outline" size={17} />
            <Text style={[styles.ticketLabel, { color: region.accent }]}>다음 일정</Text>
          </View>
          <Text numberOfLines={1} style={styles.ticketTitle}>{region.nextTitle}</Text>
          <Text numberOfLines={1} style={styles.ticketMeta}>{region.nextMeta}</Text>
        </View>
        <View style={[styles.ticketWatermark, { backgroundColor: region.soft }]}> 
          <MaterialCommunityIcons color={region.accent} name={region.landmarkIcon} size={46} />
        </View>
        <Pressable
          onPress={() => router.push("/move")}
          style={[styles.routeButton, { backgroundColor: region.accentDark }]}
        >
          <Text style={styles.routeButtonText}>경로 보기</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} />
        </Pressable>
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => {
          const iconColor = action.warm ? "#D58A22" : region.accent;
          const tileColor = action.warm ? "#FFF4DF" : region.soft;
          return (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route)}
              style={styles.quickAction}
            >
              <View style={[styles.quickIcon, { backgroundColor: tileColor }]}>
                <MaterialCommunityIcons color={iconColor} name={action.icon} size={28} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>오늘의 일정</Text>
        <Pressable onPress={() => router.push("/schedule")} style={styles.seeAllButton}>
          <Text style={[styles.seeAll, { color: region.accent }]}>전체 보기</Text>
          <MaterialCommunityIcons color={region.accent} name="chevron-right" size={18} />
        </Pressable>
      </View>

      <View style={styles.scheduleList}>
        <View style={[styles.scheduleLine, { backgroundColor: region.softStrong }]} />
        {region.schedule.map((item, index) => (
          <Pressable
            key={item.time}
            onPress={() => router.push("/schedule")}
            style={styles.scheduleRow}
          >
            <View
              style={[
                styles.scheduleDot,
                {
                  backgroundColor: index === 0 ? region.accent : "#A8BAB4",
                  borderColor: index === 0 ? region.softStrong : "#EDF2F0",
                },
              ]}
            />
            <Text style={styles.scheduleTime}>{item.time}</Text>
            <View style={styles.scheduleCopy}>
              <Text numberOfLines={1} style={styles.scheduleTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.scheduleDetail}>{item.detail}</Text>
            </View>
            <MaterialCommunityIcons color="#4A6068" name="chevron-right" size={22} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/profile")}
        style={[styles.budgetCard, { backgroundColor: region.softStrong }]}
      >
        <View style={[styles.budgetIcon, { backgroundColor: region.accent }]}> 
          <MaterialCommunityIcons color="#FFFFFF" name="wallet-outline" size={20} />
        </View>
        <Text style={styles.budgetLabel}>오늘 남은 예산</Text>
        <Text style={[styles.budgetValue, { color: region.accentDark }]}>¥8,500</Text>
        <View style={[styles.budgetDivider, { backgroundColor: region.accent }]} />
        <Text style={styles.budgetNote}>입력한 지출 기준</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  themeWash: { position: "absolute", top: -40, left: -100, right: -100, height: 285, opacity: 0.5 },
  header: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brand: { fontSize: 25, fontWeight: "900", letterSpacing: -1.2 },
  brandMark: { width: 58, height: 38, alignItems: "center", justifyContent: "center" },
  sun: { position: "absolute", top: 0, width: 20, height: 20, borderRadius: 10 },
  bellButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  alertDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, right: 5, top: 5 },
  regionTabs: { gap: 7, paddingVertical: 9, paddingRight: 12 },
  regionTab: { minWidth: 68, height: 32, paddingHorizontal: 17, borderWidth: 1, borderColor: "#D7DDDB", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.82)", alignItems: "center", justifyContent: "center" },
  regionTabText: { color: "#425159", fontSize: 12, fontWeight: "800" },
  regionTabTextActive: { color: "#FFFFFF" },
  titleBlock: { minHeight: 114, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 2 },
  cityTitle: { fontSize: 30, lineHeight: 34, fontWeight: "900", letterSpacing: -1.5 },
  headline: { color: "#10242A", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -1.4 },
  tripDay: { color: "#5E6B70", fontSize: 12, fontWeight: "700", marginTop: 7 },
  titleDecoration: { width: 126, alignItems: "flex-end", paddingTop: 2 },
  landmark: { opacity: 0.28, marginRight: 10 },
  eyebrow: { marginTop: 1, maxWidth: 105, fontSize: 8, lineHeight: 12, fontWeight: "800", letterSpacing: 2, textAlign: "right" },
  search: { minHeight: 48, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8DEDC", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, shadowColor: "#24352E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2 },
  searchText: { flex: 1, color: "#6F7B80", fontSize: 14, fontWeight: "600" },
  searchDivider: { width: 1, height: 24, backgroundColor: "#E3E8E6" },
  hero: { height: 205, marginTop: 14, justifyContent: "flex-end" },
  heroImage: { borderRadius: 19 },
  heroShade: { flex: 1, justifyContent: "flex-end", borderRadius: 19, paddingHorizontal: 18, paddingBottom: 16, backgroundColor: "rgba(7,24,25,0.22)" },
  heroCity: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", letterSpacing: 4 },
  heroDescription: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", marginTop: 3 },
  ticket: { minHeight: 112, marginTop: 12, borderWidth: 1, borderRadius: 17, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", overflow: "hidden", shadowColor: "#1D2F28", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  ticketBand: { width: 7, alignSelf: "stretch" },
  notch: { position: "absolute", width: 18, height: 18, borderRadius: 9, backgroundColor: "#F7F7F9", top: 47 },
  notchLeft: { left: -10 },
  notchRight: { right: -10 },
  ticketCopy: { flex: 1, paddingLeft: 16, paddingVertical: 14, zIndex: 2 },
  ticketLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ticketLabel: { fontSize: 11, fontWeight: "900" },
  ticketTitle: { color: "#10242A", fontSize: 20, fontWeight: "900", marginTop: 6, letterSpacing: -0.7 },
  ticketMeta: { color: "#617076", fontSize: 11, fontWeight: "600", marginTop: 4 },
  ticketWatermark: { width: 62, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", opacity: 0.85 },
  routeButton: { height: 51, borderRadius: 15, paddingHorizontal: 13, marginHorizontal: 11, flexDirection: "row", gap: 3, alignItems: "center", justifyContent: "center", zIndex: 2 },
  routeButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  quickGrid: { flexDirection: "row", gap: 8, marginTop: 13 },
  quickAction: { flex: 1, minWidth: 0, height: 108, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.88)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EDF0EF" },
  quickIcon: { width: 53, height: 53, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  quickLabel: { color: "#263B42", fontSize: 11, fontWeight: "800", marginTop: 8 },
  sectionHeading: { marginTop: 20, marginBottom: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#10242A", fontSize: 21, fontWeight: "900", letterSpacing: -0.7 },
  seeAllButton: { flexDirection: "row", alignItems: "center" },
  seeAll: { fontSize: 12, fontWeight: "900" },
  scheduleList: { position: "relative" },
  scheduleLine: { position: "absolute", width: 2, top: 24, bottom: 24, left: 7 },
  scheduleRow: { minHeight: 68, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EDF0EF" },
  scheduleDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, marginRight: 14, zIndex: 2 },
  scheduleTime: { width: 48, color: "#4D626A", fontSize: 12, fontWeight: "700" },
  scheduleCopy: { flex: 1, minWidth: 0 },
  scheduleTitle: { color: "#10242A", fontSize: 16, fontWeight: "900" },
  scheduleDetail: { color: "#718086", fontSize: 11, fontWeight: "600", marginTop: 3 },
  budgetCard: { minHeight: 66, marginTop: 14, borderRadius: 17, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 10 },
  budgetIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  budgetLabel: { color: "#33484F", fontSize: 11, fontWeight: "800" },
  budgetValue: { flex: 1, fontSize: 23, fontWeight: "900", letterSpacing: -0.8 },
  budgetDivider: { width: 1, height: 24, opacity: 0.5 },
  budgetNote: { color: "#6E7A7E", fontSize: 9, fontWeight: "700" },
});
