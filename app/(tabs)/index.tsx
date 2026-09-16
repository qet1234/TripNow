import type { ComponentProps } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  Image,
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
import { useResponsiveLayout } from "@/src/hooks/useResponsiveLayout";

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
  const { isCompactWidth, isLandscape, isLargeScreen } = useResponsiveLayout();
  const region = getHomeRegion(selectedRegionId);
  const heroHeight = isCompactWidth ? 120 : isLargeScreen ? 180 : isLandscape ? 150 : 137;

  return (
    <Screen>
      <View
        style={[
          styles.themeWash,
          isLargeScreen && styles.themeWashLarge,
          { backgroundColor: region.soft },
        ]}
      />

      <View style={styles.header}>
        <Text style={[styles.brand, { color: region.accentDark }]}>트립나우</Text>
        <Image
          resizeMode="contain"
          source={region.artImage}
          style={[
            styles.headerArt,
            isCompactWidth && styles.headerArtCompact,
            isLargeScreen && styles.headerArtLarge,
          ]}
        />
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
              hitSlop={7}
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

      <View
        style={[
          styles.titleBlock,
          isCompactWidth && styles.titleBlockCompact,
          isLargeScreen && styles.titleBlockLarge,
        ]}
      >
        <View>
          <Text
            style={[
              styles.cityTitle,
              isCompactWidth && styles.titleCompact,
              isLargeScreen && styles.titleLarge,
              { color: region.accentDark },
            ]}
          >
            {region.name},
          </Text>
          <Text
            style={[
              styles.headline,
              isCompactWidth && styles.titleCompact,
              isLargeScreen && styles.titleLarge,
            ]}
          >
            오늘의 여행
          </Text>
          <Text style={styles.tripDay}>여행 2일차</Text>
        </View>
        <View style={[styles.titleDecoration, isCompactWidth && styles.titleDecorationCompact]}>
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
        resizeMode="cover"
        source={region.heroImage}
        style={[styles.hero, { height: heroHeight }]}
      >
        <View style={styles.heroShade}>
          <Text style={styles.heroCity}>{region.englishName}</Text>
          <Text style={styles.heroDescription}>{region.description}</Text>
        </View>
      </ImageBackground>

      <View
        style={[
          styles.ticket,
          isCompactWidth && styles.ticketCompact,
          isLargeScreen && styles.ticketLarge,
          { borderColor: region.softStrong },
        ]}
      >
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
        {!isCompactWidth ? (
          <View style={styles.ticketWatermark}>
            <Image resizeMode="contain" source={region.artImage} style={styles.ticketArt} />
          </View>
        ) : null}
        <Pressable
          onPress={() => router.push("/move")}
          style={[
            styles.routeButton,
            isCompactWidth && styles.routeButtonCompact,
            { backgroundColor: region.accentDark },
          ]}
        >
          <Text style={styles.routeButtonText}>경로 보기</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} />
        </Pressable>
      </View>

      <View style={[styles.quickGrid, isCompactWidth && styles.quickGridCompact]}>
        {quickActions.map((action) => {
          const iconColor = action.warm ? "#D58A22" : region.accent;
          const tileColor = action.warm ? "#FFF4DF" : region.soft;
          return (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route)}
              style={[
                styles.quickAction,
                isCompactWidth && styles.quickActionCompact,
                isLargeScreen && styles.quickActionLarge,
              ]}
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
        {!isCompactWidth ? (
          <>
            <View style={[styles.budgetDivider, { backgroundColor: region.accent }]} />
            <Text style={styles.budgetNote}>입력한 지출 기준</Text>
          </>
        ) : null}
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  themeWash: { position: "absolute", top: -40, left: -100, right: -100, height: 250, opacity: 0.55 },
  themeWashLarge: { height: 320 },
  header: { minHeight: 43, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", overflow: "visible" },
  brand: { paddingTop: 3, fontSize: 24, fontWeight: "900", letterSpacing: -1.2, zIndex: 2 },
  headerArt: { position: "absolute", width: 142, height: 82, top: -9, right: 30, opacity: 0.93 },
  headerArtCompact: { width: 118, height: 72, right: 24 },
  headerArtLarge: { width: 162, height: 94, right: 48 },
  bellButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", zIndex: 3 },
  alertDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, right: 5, top: 5 },
  regionTabs: { gap: 6, paddingTop: 2, paddingBottom: 9, paddingRight: 4 },
  regionTab: { minWidth: 68, height: 29, paddingHorizontal: 10, borderWidth: 1, borderColor: "#D7DDDB", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.86)", alignItems: "center", justifyContent: "center" },
  regionTabText: { color: "#425159", fontSize: 11, fontWeight: "800" },
  regionTabTextActive: { color: "#FFFFFF" },
  titleBlock: { minHeight: 83, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 0 },
  titleBlockCompact: { minHeight: 76 },
  titleBlockLarge: { minHeight: 94 },
  cityTitle: { fontSize: 27, lineHeight: 29, fontWeight: "900", letterSpacing: -1.4 },
  headline: { color: "#10242A", fontSize: 27, lineHeight: 29, fontWeight: "900", letterSpacing: -1.3 },
  titleCompact: { fontSize: 24, lineHeight: 26 },
  titleLarge: { fontSize: 30, lineHeight: 33 },
  tripDay: { color: "#5E6B70", fontSize: 11, fontWeight: "700", marginTop: 5 },
  titleDecoration: { width: 104, alignItems: "flex-end", justifyContent: "flex-end", paddingTop: 36 },
  titleDecorationCompact: { width: 78, paddingTop: 31 },
  eyebrow: { maxWidth: 100, fontSize: 8, lineHeight: 12, fontWeight: "800", letterSpacing: 2, textAlign: "right" },
  search: { minHeight: 43, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8DEDC", flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 9, shadowColor: "#24352E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 2 },
  searchText: { flex: 1, color: "#6F7B80", fontSize: 14, fontWeight: "600" },
  searchDivider: { width: 1, height: 24, backgroundColor: "#E3E8E6" },
  hero: { width: "100%", marginTop: 10, borderRadius: 17, overflow: "hidden", justifyContent: "flex-end" },
  heroImage: { width: "100%", height: "100%", borderRadius: 17 },
  heroShade: { flex: 1, justifyContent: "flex-end", borderRadius: 17, paddingHorizontal: 15, paddingBottom: 12, backgroundColor: "rgba(7,24,25,0.18)" },
  heroCity: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: 4 },
  heroDescription: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", marginTop: 2 },
  ticket: { minHeight: 84, marginTop: 9, borderWidth: 1, borderRadius: 15, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", overflow: "hidden", shadowColor: "#1D2F28", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  ticketCompact: { minHeight: 78 },
  ticketLarge: { minHeight: 96 },
  ticketBand: { width: 7, alignSelf: "stretch" },
  notch: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: "#F7F7F9", top: 34 },
  notchLeft: { left: -10 },
  notchRight: { right: -10 },
  ticketCopy: { flex: 1, paddingLeft: 14, paddingVertical: 10, zIndex: 2 },
  ticketLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ticketLabel: { fontSize: 11, fontWeight: "900" },
  ticketTitle: { color: "#10242A", fontSize: 18, fontWeight: "900", marginTop: 4, letterSpacing: -0.7 },
  ticketMeta: { color: "#617076", fontSize: 10, fontWeight: "600", marginTop: 3 },
  ticketWatermark: { width: 76, height: 78, alignItems: "center", justifyContent: "center", overflow: "hidden", opacity: 0.9 },
  ticketArt: { width: 84, height: 90 },
  routeButton: { height: 44, borderRadius: 14, paddingHorizontal: 11, marginHorizontal: 9, flexDirection: "row", gap: 3, alignItems: "center", justifyContent: "center", zIndex: 2 },
  routeButtonCompact: { paddingHorizontal: 8, marginHorizontal: 6 },
  routeButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  quickGrid: { flexDirection: "row", gap: 7, marginTop: 9 },
  quickGridCompact: { gap: 5 },
  quickAction: { flex: 1, minWidth: 0, height: 84, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EDF0EF" },
  quickActionCompact: { height: 78 },
  quickActionLarge: { height: 96 },
  quickIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  quickLabel: { color: "#263B42", fontSize: 10, fontWeight: "800", marginTop: 5 },
  sectionHeading: { marginTop: 13, marginBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#10242A", fontSize: 18, fontWeight: "900", letterSpacing: -0.7 },
  seeAllButton: { flexDirection: "row", alignItems: "center" },
  seeAll: { fontSize: 12, fontWeight: "900" },
  scheduleList: { position: "relative" },
  scheduleLine: { position: "absolute", width: 2, top: 24, bottom: 24, left: 7 },
  scheduleRow: { minHeight: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EDF0EF" },
  scheduleDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, marginRight: 14, zIndex: 2 },
  scheduleTime: { width: 48, color: "#4D626A", fontSize: 12, fontWeight: "700" },
  scheduleCopy: { flex: 1, minWidth: 0 },
  scheduleTitle: { color: "#10242A", fontSize: 14, fontWeight: "900" },
  scheduleDetail: { color: "#718086", fontSize: 10, fontWeight: "600", marginTop: 2 },
  budgetCard: { minHeight: 52, marginTop: 9, borderRadius: 15, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 9 },
  budgetIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  budgetLabel: { color: "#33484F", fontSize: 11, fontWeight: "800" },
  budgetValue: { flex: 1, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  budgetDivider: { width: 1, height: 24, opacity: 0.5 },
  budgetNote: { color: "#6E7A7E", fontSize: 9, fontWeight: "700" },
});
