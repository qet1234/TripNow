import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { useAirportJourney, type AirportFlightPlan } from "@/src/context/AirportContext";
import {
  japanAirportGuides,
  normalizeAirportCode,
  resolveAirline,
  resolveTerminal,
  type JapanAirportCode,
} from "@/src/data/japanAirportGuides";
import { colors, radius } from "@/src/theme";

type GuideDirection = "departure" | "arrival";

const airportOrder: readonly JapanAirportCode[] = ["HND", "NRT", "KIX", "CTS", "NGO", "FUK", "OKA"];

const airportShortNames: Readonly<Record<JapanAirportCode, string>> = {
  HND: "도쿄 하네다",
  NRT: "도쿄 나리타",
  KIX: "오사카 간사이",
  CTS: "삿포로 신치토세",
  NGO: "나고야 중부",
  FUK: "후쿠오카",
  OKA: "오키나와 나하",
};

const walkMinutes: Readonly<Record<JapanAirportCode, number>> = {
  HND: 12,
  NRT: 15,
  KIX: 14,
  CTS: 10,
  NGO: 12,
  FUK: 8,
  OKA: 9,
};

const quickTips: Readonly<Record<JapanAirportCode, string>> = {
  HND: "국제선 게이트는 이동 구간이 길 수 있어 보안검색 뒤 바로 게이트 방향으로 이동하세요.",
  NRT: "터미널과 윙이 나뉘어 있어 출발 전에 항공사 체크인 위치를 먼저 확인하세요.",
  KIX: "제2터미널 항공편은 별도 이동이 필요할 수 있어 터미널을 먼저 확인하세요.",
  CTS: "국제선 터미널 연결 통로 이동 시간을 포함해 여유 있게 출발하세요.",
  NGO: "제2터미널 이용 항공사는 셔틀·보행 이동 시간을 미리 반영하세요.",
  FUK: "국제선 터미널은 국내선과 분리되어 있어 무료 셔틀 이동 여부를 확인하세요.",
  OKA: "국제선 구역과 국내선 구역이 연결되어 있으므로 표지판의 국제선 방향을 따라가세요.",
};

const mapNodePositions = ["9%", "36%", "63%", "86%"] as const;

function openOfficialPage(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  void Linking.openURL(url);
}

function subtractMinutes(value: string, minutes: number) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return "출발 90분 전";
  const total = (Number(match[1]) * 60 + Number(match[2]) - minutes + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function planFields(plan: AirportFlightPlan, direction: GuideDirection) {
  if (direction === "departure") {
    return {
      airportCode: plan.returnAirportCode,
      date: plan.returnDate,
      flightId: plan.returnFlight,
      gate: plan.returnGate,
      manualTerminal: plan.returnJapanTerminal,
      time: plan.returnTime,
    };
  }

  return {
    airportCode: plan.outboundAirportCode,
    date: plan.outboundDate,
    flightId: plan.outboundFlight,
    gate: plan.outboundGate,
    manualTerminal: plan.outboundJapanTerminal,
    time: plan.outboundTime,
  };
}

export function AirportQuickGuideScreen() {
  const router = useRouter();
  const { plan, phase, hydrated } = useAirportJourney();
  const [direction, setDirection] = useState<GuideDirection>("departure");
  const [airportCode, setAirportCode] = useState<JapanAirportCode>("HND");
  const [flightId, setFlightId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const nextDirection: GuideDirection = phase === "departure" ? "arrival" : "departure";
    const fields = planFields(plan, nextDirection);
    setDirection(nextDirection);
    setAirportCode(normalizeAirportCode(fields.airportCode) ?? "HND");
    setFlightId(fields.flightId);
    setTravelDate(fields.date);
    setMatched(Boolean(fields.flightId || fields.airportCode));
  }, [hydrated, phase, plan]);

  const guide = japanAirportGuides[airportCode];
  const savedFields = planFields(plan, direction);
  const airline = resolveAirline(flightId);
  const terminal = resolveTerminal(guide, flightId, savedFields.manualTerminal);
  const gate = savedFields.gate.trim() ? `Gate ${savedFields.gate.trim()}` : "전광판 확인";
  const flow = direction === "departure" ? guide.departureFlow : guide.arrivalFlow;
  const startTime = subtractMinutes(savedFields.time, 90);

  const route = useMemo(
    () =>
      direction === "departure"
        ? { from: `${guide.code} ${guide.city}`, to: "ICN 인천" }
        : { from: "ICN 인천", to: `${guide.code} ${guide.city}` },
    [direction, guide],
  );

  const selectDirection = (nextDirection: GuideDirection) => {
    const fields = planFields(plan, nextDirection);
    setDirection(nextDirection);
    setAirportCode(normalizeAirportCode(fields.airportCode) ?? airportCode);
    setFlightId(fields.flightId);
    setTravelDate(fields.date);
    setMatched(Boolean(fields.flightId || fields.airportCode));
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons color="#FFFFFF" name="airplane-marker" size={25} />
        </View>
        <Text style={styles.eyebrow}>TRIPNOW AIRPORT QUICK GUIDE</Text>
        <Text style={styles.heroTitle}>내리기 전에,{"\n"}공항 길부터 준비</Text>
        <Text style={styles.heroDescription}>
          출국장 입구에서 탑승 게이트까지, 도착 게이트에서 공항 출구까지 필요한 동선만 빠르게 보여드려요.
        </Text>
      </View>

      <View style={styles.statusHeader}>
        <View>
          <Text style={styles.statusEyebrow}>TripNow 공항 안내</Text>
          <Text style={styles.statusTitle}>일본 공항 빠른 안내</Text>
        </View>
        <View style={styles.readyBadge}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText}>준비됨</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>공항 선택</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.airportList}>
        {airportOrder.map((code) => {
          const selected = airportCode === code;
          return (
            <Pressable
              accessibilityLabel={`${airportShortNames[code]}공항 선택`}
              key={code}
              onPress={() => {
                setAirportCode(code);
                setMatched(false);
              }}
              style={[styles.airportChip, selected && styles.airportChipSelected]}
            >
              <Text style={[styles.airportCode, selected && styles.airportCodeSelected]}>{code}</Text>
              <Text style={[styles.airportName, selected && styles.airportNameSelected]}>{airportShortNames[code]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.routeSummary}>
        <View style={styles.routePoint}>
          <Text style={styles.routeCode}>{route.from.split(" ")[0]}</Text>
          <Text style={styles.routeCity}>{route.from.split(" ").slice(1).join(" ")}</Text>
        </View>
        <View style={styles.routeLineWrap}>
          <View style={styles.routeLine} />
          <View style={styles.routePlane}>
            <MaterialCommunityIcons color="#FFFFFF" name="airplane" size={15} />
          </View>
        </View>
        <View style={[styles.routePoint, styles.routePointRight]}>
          <Text style={styles.routeCode}>{route.to.split(" ")[0]}</Text>
          <Text style={styles.routeCity}>{route.to.split(" ").slice(1).join(" ")}</Text>
        </View>
      </View>

      <View style={styles.directionTabs}>
        <Pressable
          onPress={() => selectDirection("departure")}
          style={[styles.directionTab, direction === "departure" && styles.directionTabActive]}
        >
          <MaterialCommunityIcons color={direction === "departure" ? "#FFFFFF" : colors.textMuted} name="airplane-takeoff" size={17} />
          <Text style={[styles.directionText, direction === "departure" && styles.directionTextActive]}>일본에서 출국</Text>
        </Pressable>
        <Pressable
          onPress={() => selectDirection("arrival")}
          style={[styles.directionTab, direction === "arrival" && styles.directionTabActive]}
        >
          <MaterialCommunityIcons color={direction === "arrival" ? "#FFFFFF" : colors.textMuted} name="airplane-landing" size={17} />
          <Text style={[styles.directionText, direction === "arrival" && styles.directionTextActive]}>일본에 도착</Text>
        </Pressable>
      </View>

      <View style={styles.matchCard}>
        <View style={styles.cardHeading}>
          <View style={styles.cardHeadingIcon}>
            <MaterialCommunityIcons color={colors.blue} name="auto-fix" size={20} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text style={styles.cardEyebrow}>항공편 기준 자동 맞춤</Text>
            <Text style={styles.cardTitle}>편명으로 터미널 예상</Text>
          </View>
          <Pressable onPress={() => router.push("/airport-setup")} style={styles.photoButton}>
            <MaterialCommunityIcons color={colors.blue} name="camera-outline" size={17} />
            <Text style={styles.photoButtonText}>항공권 사진</Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>항공편명</Text>
            <TextInput
              accessibilityLabel="항공편명"
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={(value) => {
                setFlightId(value.toUpperCase());
                setMatched(false);
              }}
              placeholder="예: KE703"
              placeholderTextColor="#A2A7AE"
              style={styles.input}
              value={flightId}
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>{direction === "departure" ? "출발일" : "도착일"}</Text>
            <TextInput
              accessibilityLabel={direction === "departure" ? "출발일" : "도착일"}
              onChangeText={(value) => {
                setTravelDate(value);
                setMatched(false);
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A2A7AE"
              style={styles.input}
              value={travelDate}
            />
          </View>
        </View>
        <Pressable onPress={() => setMatched(true)} style={styles.matchButton}>
          <MaterialCommunityIcons color="#FFFFFF" name="airplane-search" size={18} />
          <Text style={styles.matchButtonText}>터미널 찾기</Text>
        </Pressable>
        <Text style={styles.matchNotice}>
          {matched
            ? `${airline?.name || "항공사 확인 필요"} · ${guide.name} 기준으로 안내를 맞췄습니다.`
            : "항공편을 입력하면 운항 항공사와 기본 터미널을 함께 확인합니다."}
        </Text>
      </View>

      <View style={styles.overviewCard}>
        <View style={styles.overviewHeading}>
          <View>
            <Text style={styles.cardEyebrow}>탑승까지 한눈에</Text>
            <Text style={styles.cardTitle}>{guide.name}</Text>
          </View>
          <View style={styles.officialBadge}>
            <MaterialCommunityIcons color={colors.teal} name="shield-check-outline" size={15} />
            <Text style={styles.officialBadgeText}>공식 정보 연결</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>터미널</Text>
            <Text style={styles.metricValue}>{terminal.value}</Text>
            <Text style={styles.metricSource}>{terminal.source}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>{direction === "departure" ? "탑승구" : "도착 게이트"}</Text>
            <Text style={styles.metricValue}>{gate}</Text>
            <Text style={styles.metricSource}>전광판 최종 확인</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>예상 이동</Text>
            <Text style={styles.metricValue}>도보 {walkMinutes[airportCode]}분</Text>
            <Text style={styles.metricSource}>{direction === "departure" ? "출국층 기준" : "도착층 기준"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapHeading}>
          <View>
            <Text style={styles.cardEyebrow}>공항 운영사 공식 지도 기준</Text>
            <Text style={styles.cardTitle}>{guide.code} {terminal.value} 동선 미리보기</Text>
          </View>
          <MaterialCommunityIcons color={colors.blue} name="map-marker-path" size={25} />
        </View>

        <View style={styles.mapPreview}>
          <View style={styles.mapRunway} />
          <View style={[styles.mapBlock, styles.mapBlockOne]}><Text style={styles.mapBlockText}>1F</Text></View>
          <View style={[styles.mapBlock, styles.mapBlockTwo]}><Text style={styles.mapBlockText}>2F</Text></View>
          <View style={[styles.mapBlock, styles.mapBlockThree]}><Text style={styles.mapBlockText}>3F</Text></View>
          <View style={styles.mapPath} />
          {flow.slice(0, 4).map((step, index) => (
            <View key={step} style={[styles.mapNode, { left: mapNodePositions[index] ?? "9%" }]}>
              <View style={[styles.mapNodeDot, index === 3 && styles.mapNodeDotLast]} />
              <Text numberOfLines={2} style={styles.mapNodeText}>{step}</Text>
            </View>
          ))}
          <View style={styles.mapGateBadge}>
            <MaterialCommunityIcons color="#FFFFFF" name="airplane" size={14} />
            <Text style={styles.mapGateText}>{gate}</Text>
          </View>
        </View>

        <View style={styles.officialButtons}>
          <Pressable accessibilityRole="link" onPress={() => openOfficialPage(guide.mapUrl)} style={styles.officialPrimary}>
            <MaterialCommunityIcons color="#FFFFFF" name="map-outline" size={18} />
            <Text style={styles.officialPrimaryText}>공식 안내지도 열기</Text>
            <MaterialCommunityIcons color="#FFFFFF" name="open-in-new" size={15} />
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => openOfficialPage(guide.flightUrl)} style={styles.officialSecondary}>
            <MaterialCommunityIcons color={colors.blue} name="airplane-clock" size={18} />
            <Text style={styles.officialSecondaryText}>공식 운항조회</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.flowCard}>
        <View style={styles.flowHeading}>
          <Text style={styles.cardEyebrow}>{direction === "departure" ? "입구 → 보안검색 → 게이트" : "도착 게이트 → 공항 출구"}</Text>
          <Text style={styles.cardTitle}>{direction === "departure" ? "출국 동선" : "도착 동선"}</Text>
        </View>
        <View style={styles.flowList}>
          {flow.map((step, index) => (
            <View key={step} style={styles.flowStepWrap}>
              <View style={[styles.flowNumber, index === flow.length - 1 && styles.flowNumberLast]}>
                <Text style={[styles.flowNumberText, index === flow.length - 1 && styles.flowNumberTextLast]}>{index + 1}</Text>
              </View>
              <Text style={styles.flowText}>{step}</Text>
              {index < flow.length - 1 ? <View style={styles.flowConnector} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <MaterialCommunityIcons color="#FFFFFF" name="run-fast" size={22} />
        </View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipEyebrow}>빠른 이동 팁</Text>
          <Text style={styles.tipText}>{quickTips[airportCode]}</Text>
          <Text style={styles.tipTime}>늦어도 {startTime}부터 안내를 시작하세요.</Text>
        </View>
      </View>

      <Text style={styles.footerNotice}>
        ODPT·FlightAware 없이 공항 운영사 공식 지도와 공식 운항조회 페이지를 연결합니다. 터미널·탑승구는 공동운항 및 당일 변경이 있을 수 있으므로 전광판에서 최종 확인해 주세요.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, backgroundColor: "#102A43", padding: 20, overflow: "hidden" },
  heroIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  eyebrow: { color: "#8FD2FF", fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.8, marginTop: 7 },
  heroDescription: { color: "#C8D8E8", fontSize: 12, lineHeight: 19, marginTop: 10, maxWidth: 520 },
  statusHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2, marginTop: 18, marginBottom: 14 },
  statusEyebrow: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  statusTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 },
  readyBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: radius.pill, backgroundColor: colors.tealSoft, paddingHorizontal: 10, paddingVertical: 7 },
  readyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.teal },
  readyText: { color: colors.teal, fontSize: 10, fontWeight: "900" },
  sectionLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "900", marginBottom: 8, paddingHorizontal: 2 },
  airportList: { gap: 8, paddingBottom: 5 },
  airportChip: { minWidth: 108, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10 },
  airportChipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  airportCode: { color: colors.textMuted, fontSize: 11, fontWeight: "900" },
  airportCodeSelected: { color: colors.primary },
  airportName: { color: colors.text, fontSize: 11, fontWeight: "800", marginTop: 3 },
  airportNameSelected: { color: colors.primary },
  routeSummary: { minHeight: 92, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, marginTop: 12 },
  routePoint: { width: 74 },
  routePointRight: { alignItems: "flex-end" },
  routeCode: { color: colors.text, fontSize: 21, fontWeight: "900" },
  routeCity: { color: colors.textMuted, fontSize: 10, fontWeight: "800", marginTop: 2 },
  routeLineWrap: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center" },
  routeLine: { position: "absolute", left: 4, right: 4, height: 2, backgroundColor: "#C9D7E4" },
  routePlane: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  directionTabs: { flexDirection: "row", gap: 8, marginTop: 10, padding: 5, borderRadius: 16, backgroundColor: "#ECEFF3" },
  directionTab: { flex: 1, minHeight: 43, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  directionTabActive: { backgroundColor: "#102A43" },
  directionText: { color: colors.textMuted, fontSize: 11, fontWeight: "900" },
  directionTextActive: { color: "#FFFFFF" },
  matchCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 12 },
  cardHeading: { flexDirection: "row", alignItems: "center" },
  cardHeadingIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#EDF5FF", alignItems: "center", justifyContent: "center", marginRight: 9 },
  cardHeadingCopy: { flex: 1, minWidth: 0 },
  cardEyebrow: { color: colors.blue, fontSize: 9, fontWeight: "900" },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 3 },
  photoButton: { minHeight: 34, borderRadius: radius.pill, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F7FBFF", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10 },
  photoButtonText: { color: colors.blue, fontSize: 9, fontWeight: "900" },
  inputRow: { flexDirection: "row", gap: 9, marginTop: 14 },
  inputWrap: { flex: 1, minWidth: 0 },
  inputLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", marginBottom: 5 },
  input: { height: 43, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FAFAFB", color: colors.text, paddingHorizontal: 11, fontSize: 12, fontWeight: "800" },
  matchButton: { minHeight: 44, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 },
  matchButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  matchNotice: { color: colors.textMuted, fontSize: 9, lineHeight: 14, textAlign: "center", marginTop: 7 },
  overviewCard: { borderRadius: radius.md, backgroundColor: "#F6FBF8", borderWidth: 1, borderColor: "#CBE9DA", padding: 15, marginTop: 12 },
  overviewHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  officialBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, backgroundColor: colors.tealSoft, paddingHorizontal: 8, paddingVertical: 6 },
  officialBadgeText: { color: colors.teal, fontSize: 8, fontWeight: "900" },
  metricRow: { flexDirection: "row", borderRadius: 14, backgroundColor: colors.surface, paddingVertical: 13, paddingHorizontal: 10, marginTop: 12 },
  metric: { flex: 1, minWidth: 0, alignItems: "center" },
  metricDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 5 },
  metricLabel: { color: colors.textMuted, fontSize: 8, fontWeight: "800" },
  metricValue: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: "900", textAlign: "center", marginTop: 4 },
  metricSource: { color: colors.teal, fontSize: 7, lineHeight: 11, fontWeight: "800", textAlign: "center", marginTop: 2 },
  mapCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 12 },
  mapHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  mapPreview: { height: 188, borderRadius: 16, backgroundColor: "#EAF1F7", overflow: "hidden", position: "relative" },
  mapRunway: { position: "absolute", right: -30, top: 24, width: 180, height: 34, borderRadius: 17, backgroundColor: "#CAD7E2", transform: [{ rotate: "-15deg" }] },
  mapBlock: { position: "absolute", borderRadius: 12, borderWidth: 2, borderColor: "#A8BDD0", backgroundColor: "#DCE7EF", alignItems: "center", justifyContent: "center" },
  mapBlockOne: { width: 92, height: 54, left: 18, top: 20 },
  mapBlockTwo: { width: 110, height: 58, right: 18, top: 72 },
  mapBlockThree: { width: 80, height: 48, left: 105, bottom: 18 },
  mapBlockText: { color: "#7890A5", fontSize: 11, fontWeight: "900" },
  mapPath: { position: "absolute", left: "10%", right: "10%", bottom: 52, height: 4, borderRadius: 2, backgroundColor: colors.blue },
  mapNode: { position: "absolute", bottom: 28, width: 64, alignItems: "center", marginLeft: -23 },
  mapNodeDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 3, borderColor: colors.blue, backgroundColor: "#FFFFFF", marginBottom: 5 },
  mapNodeDotLast: { backgroundColor: colors.primary, borderColor: colors.primary },
  mapNodeText: { color: "#425466", fontSize: 7, lineHeight: 10, fontWeight: "900", textAlign: "center" },
  mapGateBadge: { position: "absolute", right: 13, top: 13, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 6 },
  mapGateText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  officialButtons: { flexDirection: "row", gap: 8, marginTop: 12 },
  officialPrimary: { flex: 1.15, minHeight: 44, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  officialPrimaryText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  officialSecondary: { flex: 0.85, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F7FBFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  officialSecondaryText: { color: colors.blue, fontSize: 10, fontWeight: "900" },
  flowCard: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 12 },
  flowHeading: { marginBottom: 14 },
  flowList: { paddingLeft: 2 },
  flowStepWrap: { minHeight: 46, flexDirection: "row", alignItems: "flex-start", position: "relative" },
  flowNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#EDF5FF", borderWidth: 1, borderColor: "#BCD5F3", alignItems: "center", justifyContent: "center", zIndex: 1 },
  flowNumberLast: { backgroundColor: colors.primary, borderColor: colors.primary },
  flowNumberText: { color: colors.blue, fontSize: 10, fontWeight: "900" },
  flowNumberTextLast: { color: "#FFFFFF" },
  flowText: { color: colors.text, fontSize: 12, fontWeight: "900", marginLeft: 10, marginTop: 6 },
  flowConnector: { position: "absolute", left: 13, top: 28, bottom: -2, width: 2, backgroundColor: "#CCD9E4" },
  tipCard: { borderRadius: radius.md, backgroundColor: "#FFF7E8", borderWidth: 1, borderColor: "#F2D49B", padding: 15, marginTop: 12, flexDirection: "row", alignItems: "flex-start" },
  tipIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.warning, alignItems: "center", justifyContent: "center", marginRight: 11 },
  tipCopy: { flex: 1, minWidth: 0 },
  tipEyebrow: { color: "#9A691A", fontSize: 10, fontWeight: "900" },
  tipText: { color: "#5C4A2C", fontSize: 11, lineHeight: 17, fontWeight: "700", marginTop: 4 },
  tipTime: { color: colors.primary, fontSize: 10, fontWeight: "900", marginTop: 7 },
  footerNotice: { color: colors.textMuted, fontSize: 9, lineHeight: 15, textAlign: "center", paddingHorizontal: 18, marginTop: 13, marginBottom: 6 },
});
