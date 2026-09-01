import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { useTravelMode } from "@/src/context/TravelModeContext";
import { getJapanRegion } from "@/src/data/japanRegions";
import { colors, radius } from "@/src/theme";

const menus = [
  { icon: "♡", label: "저장한 장소", count: "12" },
  { icon: "▣", label: "내 여행 일정", count: "1" },
  { icon: "♢", label: "도착 알림 관리", count: "2" },
  { icon: "⚙", label: "앱 설정", count: "" },
] as const;

export default function ProfileScreen() {
  const { mode, selectedRegionId } = useTravelMode();
  const region = getJapanRegion(selectedRegionId);

  return (
    <Screen>
      <View style={styles.header}><Text style={styles.title}>마이</Text><Text style={styles.settings}>⚙</Text></View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>旅</Text></View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>여행자님</Text>
          <Text style={styles.meta}>로그인 없이 기기에 안전하게 저장합니다.</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}><Text style={styles.statusLabel}>현재 모드</Text><Text style={styles.statusValue}>{mode === "local" ? "일본 현지" : "여행 미리보기"}</Text></View>
        <View style={styles.divider} />
        <View style={styles.statusRow}><Text style={styles.statusLabel}>선택 지역</Text><Text style={styles.statusValue}>{region.label}</Text></View>
      </View>

      <View style={styles.menuCard}>
        {menus.map((menu, index) => (
          <Pressable key={menu.label} style={[styles.menu, index < menus.length - 1 && styles.menuBorder]}>
            <View style={styles.menuIcon}><Text style={styles.menuIconText}>{menu.icon}</Text></View>
            <Text style={styles.menuLabel}>{menu.label}</Text>
            {menu.count ? <Text style={styles.count}>{menu.count}</Text> : null}
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>ⓘ</Text>
        <Text style={styles.noticeText}>현재 위치는 일본 도착 여부만 단말에서 판정하며 서버에 좌표나 위치 이력을 저장하지 않습니다.</Text>
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>🚇</Text>
        <Text style={styles.noticeText}>실시간 열차 위치는 도에이 4개 노선과 요코하마 2개 노선을 우선 지원합니다.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 27, fontWeight: "900" },
  settings: { color: colors.text, fontSize: 21 },
  profileCard: { minHeight: 96, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  profileInfo: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 18, fontWeight: "900" },
  meta: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  chevron: { color: colors.textMuted, fontSize: 25 },
  statusCard: { borderRadius: radius.md, backgroundColor: colors.primarySoft, padding: 15, marginTop: 14 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  statusValue: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  divider: { height: 1, backgroundColor: "#FFD9D5", marginVertical: 11 },
  menuCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginTop: 14 },
  menu: { height: 62, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  menuBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  menuIconText: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "700" },
  count: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  menuChevron: { color: "#B0B3B9", fontSize: 22 },
  notice: { borderRadius: radius.md, padding: 14, backgroundColor: "#F0F1F4", flexDirection: "row", alignItems: "flex-start", gap: 9, marginTop: 12 },
  noticeIcon: { color: colors.textMuted, fontSize: 17 },
  noticeText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
