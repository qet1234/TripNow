import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createElement, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { MotionPressable } from "@/src/components/MotionPressable";
import { NaritaMapxusMap } from "@/src/components/NaritaMapxusMap";
import { useAirportJourney, type AirportFlightPlan } from "@/src/context/AirportContext";
import {
  japanAirportGuides,
  normalizeAirportCode,
  resolveAirline,
  resolveTerminal,
  type JapanAirportCode,
} from "@/src/data/japanAirportGuides";
import { colors, radius } from "@/src/theme";
import { getDigitalAirportMap } from "@/src/data/digitalAirportMaps";

type GuideDirection = "departure" | "arrival";

type OfficialFlightRow = {
  flight?: string;
  destination?: string;
  scheduled?: string;
  estimated?: string;
  gate?: string;
  terminal?: string;
  status?: string;
  airline?: string;
  cells?: string[];
};

type OfficialFlightResponse = {
  flights?: OfficialFlightRow[];
  fallback?: boolean;
  fetchedAt?: string;
  sourceUrl?: string;
  error?: string;
};

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

function openOfficialPage(url: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  void Linking.openURL(url);
}
function officialInternationalFlightUrl(
  airportCode: JapanAirportCode,
  direction: GuideDirection,
  fallbackUrl: string,
) {
  if (airportCode === "NRT") {
    return direction === "departure"
      ? "https://www.narita-airport.jp/en/flight/dep-search/?searchDepArr=dep-search"
      : "https://www.narita-airport.jp/en/flight/arr-search/?searchDepArr=arr-search";
  }

  if (airportCode === "CTS") {
    const purposeType = direction === "departure" ? "departure" : "arrival";
    return `https://www.hokkaido-airports.com/en/new-chitose/airport/fis/?airline=&airlineType=international&airport=&flightNumber=&purposeType=${purposeType}&timeFrom=&timeTo=`;
  }

  return fallbackUrl;
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
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [flightFullscreen, setFlightFullscreen] = useState(false);
  const [officialFlights, setOfficialFlights] = useState<OfficialFlightRow[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState("");
  const [flightFallback, setFlightFallback] = useState(false);

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
  const digitalMap = getDigitalAirportMap(airportCode, terminal.value, direction);
  const flightOfficialWebOnly = airportCode === "NRT";

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

  const openFlightBoard = async () => {
    if (flightOfficialWebOnly) {
      openOfficialPage(officialInternationalFlightUrl(airportCode, direction, guide.flightUrl));
      return;
    }

    if (Platform.OS !== "web") {
      openOfficialPage(guide.flightUrl);
      return;
    }

    setFlightFullscreen(true);
    setFlightLoading(true);
    setFlightError("");
    setFlightFallback(false);
    setOfficialFlights([]);

    try {
      const response = await fetch(
        `/api/airport-flights?airport=${airportCode}&direction=${direction}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as OfficialFlightResponse;
      if (!response.ok) throw new Error(data.error || "공식 운항정보를 불러오지 못했습니다.");
      const rows = Array.isArray(data.flights) ? data.flights : [];
      setOfficialFlights(rows);
      setFlightFallback(Boolean(data.fallback) || rows.length === 0);
    } catch (error) {
      setFlightError(error instanceof Error ? error.message : "공식 운항정보를 불러오지 못했습니다.");
      setFlightFallback(true);
    } finally {
      setFlightLoading(false);
    }
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
            <MotionPressable
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
            </MotionPressable>
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
        <MotionPressable
          onPress={() => selectDirection("departure")}
          style={[styles.directionTab, direction === "departure" && styles.directionTabActive]}
        >
          <MaterialCommunityIcons color={direction === "departure" ? "#FFFFFF" : colors.textMuted} name="airplane-takeoff" size={17} />
          <Text style={[styles.directionText, direction === "departure" && styles.directionTextActive]}>일본에서 출국</Text>
        </MotionPressable>
        <MotionPressable
          onPress={() => selectDirection("arrival")}
          style={[styles.directionTab, direction === "arrival" && styles.directionTabActive]}
        >
          <MaterialCommunityIcons color={direction === "arrival" ? "#FFFFFF" : colors.textMuted} name="airplane-landing" size={17} />
          <Text style={[styles.directionText, direction === "arrival" && styles.directionTextActive]}>일본에 도착</Text>
        </MotionPressable>
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
          <MotionPressable onPress={() => router.push("/airport-setup")} style={styles.photoButton}>
            <MaterialCommunityIcons color={colors.blue} name="camera-outline" size={17} />
            <Text style={styles.photoButtonText}>항공권 사진</Text>
          </MotionPressable>
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
        <MotionPressable onPress={() => setMatched(true)} style={styles.matchButton}>
          <MaterialCommunityIcons color="#FFFFFF" name="airplane-search" size={18} />
          <Text style={styles.matchButtonText}>터미널 찾기</Text>
        </MotionPressable>
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
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardEyebrow}>공항별 내장 지도 · 공식 자료</Text>
            <Text style={styles.cardTitle}>{guide.code} · {digitalMap.provider}</Text>
          </View>
          <View style={styles.officialBadge}>
            <MaterialCommunityIcons color={colors.teal} name="map-marker-radius-outline" size={15} />
            <Text style={styles.officialBadgeText}>{digitalMap.interactive ? "인터랙티브" : "웹 지도"}</Text>
          </View>
        </View>

        {Platform.OS === "web" ? (
          <>
            {airportCode === "NRT" ? (
              <NaritaMapxusMap terminal={terminal.value} direction={direction} />
            ) : (
              <View style={styles.kixMapFrame}>
                {createElement("iframe", {
                  key: `${airportCode}-${terminal.value}-${direction}`,
                  src: digitalMap.embedUrl,
                  title: `${guide.name} 공식 디지털 지도`,
                  loading: "eager",
                  allow: "geolocation; fullscreen",
                  allowFullScreen: true,
                  referrerPolicy: "strict-origin-when-cross-origin",
                  style: {
                    width: "100%",
                    height: 460,
                    border: 0,
                    borderRadius: 14,
                    backgroundColor: "#FFFFFF",
                  },
                })}
              </View>
            )}
            <View style={styles.mapTools}>
              <Text style={styles.mapSource}>
                {airportCode === "NRT"
                  ? "Mapxus 지도 인증 시 실제 실내지도를 표시합니다. 인증되지 않았다면 PDF가 아닌 TripNow 간이 층별 동선 안내를 표시합니다."
                  : airportCode === "CTS"
                    ? "신치토세공항 공식 국제선 웹 층별 지도를 TripNow 안에서 표시합니다."
                    : digitalMap.note}
              </Text>
              <MotionPressable
                onPress={() => setMapFullscreen(true)}
                style={styles.zoomButton}
              >
                <MaterialCommunityIcons color={colors.blue} name="arrow-expand-all" size={16} />
                <Text style={styles.zoomText}>전체 화면</Text>
              </MotionPressable>
            </View>
          </>
        ) : (
          <View style={styles.mapUnavailable}>
            <MaterialCommunityIcons color={colors.blue} name="web" size={30} />
            <Text style={styles.mapUnavailableTitle}>공식 디지털 지도</Text>
            <Text style={styles.mapUnavailableText}>
              PDF나 저장된 지도 이미지 대신 공항 운영사의 최신 웹 지도를 사용합니다.
            </Text>
            <MotionPressable
              accessibilityRole="link"
              onPress={() => openOfficialPage(digitalMap.openUrl)}
              style={[styles.officialPrimary, { marginTop: 12, minWidth: 180, flex: 0 }]}
            >
              <MaterialCommunityIcons color="#FFFFFF" name="map-search-outline" size={18} />
              <Text style={styles.officialPrimaryText}>공식 지도 보기</Text>
            </MotionPressable>
          </View>
        )}

        <Text style={styles.mapDisclaimer}>
          CTS와 다른 공항은 공식 웹 지도를 내부에 표시합니다. NRT는 Mapxus 인증 시 실내 지도를, 인증이 없으면 비축척 간이 동선 안내를 제공합니다. 시설·게이트 변경은 공항 전광판에서 확인하세요.
        </Text>

        <View style={styles.officialButtons}>
          <MotionPressable
            onPress={() => setMapFullscreen(true)}
            style={styles.officialPrimary}
          >
            <MaterialCommunityIcons color="#FFFFFF" name="map-outline" size={18} />
            <Text style={styles.officialPrimaryText}>내장 전체 화면</Text>
            <MaterialCommunityIcons color="#FFFFFF" name="fullscreen" size={15} />
          </MotionPressable>
          <MotionPressable onPress={openFlightBoard} style={styles.officialSecondary}>
            <MaterialCommunityIcons color={colors.blue} name="airplane-clock" size={18} />
            <Text style={styles.officialSecondaryText}>{flightOfficialWebOnly ? "공식 국제선 웹" : "국제선 운항조회"}</Text>
          </MotionPressable>
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

      {Platform.OS === "web" ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setMapFullscreen(false)}
          presentationStyle="fullScreen"
          visible={mapFullscreen}
        >
          <View style={styles.fullscreenMap}>
            <View style={styles.fullscreenHeader}>
              <View style={styles.fullscreenTitleWrap}>
                <Text style={styles.fullscreenEyebrow}>TRIPNOW AIRPORT MAP</Text>
                <Text style={styles.fullscreenTitle}>{guide.code} · {digitalMap.provider}</Text>
                <Text style={styles.fullscreenSubtitle}>{terminal.value} · {direction === "departure" ? "출국" : "도착"}</Text>
              </View>
              <MotionPressable
                accessibilityLabel="전체 화면 지도 닫기"
                onPress={() => setMapFullscreen(false)}
                style={styles.fullscreenClose}
              >
                <MaterialCommunityIcons color="#FFFFFF" name="close" size={24} />
              </MotionPressable>
            </View>
            <View style={styles.fullscreenBody}>
              {airportCode === "NRT" ? (
                <NaritaMapxusMap fullscreen terminal={terminal.value} direction={direction} />
              ) : (
                createElement("iframe", {
                  key: `fullscreen-${airportCode}-${terminal.value}-${direction}`,
                  src: digitalMap.embedUrl,
                  title: `${guide.name} 전체 화면 공식 디지털 지도`,
                  allow: "geolocation; fullscreen",
                  allowFullScreen: true,
                  referrerPolicy: "strict-origin-when-cross-origin",
                  style: {
                    width: "100%",
                    height: "100%",
                    border: 0,
                    backgroundColor: "#FFFFFF",
                  },
                })
              )}
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === "web" ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setFlightFullscreen(false)}
          presentationStyle="fullScreen"
          visible={flightFullscreen}
        >
          <View style={styles.fullscreenMap}>
            <View style={styles.fullscreenHeader}>
              <View style={styles.fullscreenTitleWrap}>
                <Text style={styles.fullscreenEyebrow}>TRIPNOW INTERNATIONAL FLIGHT BOARD</Text>
                <Text style={styles.fullscreenTitle}>{guide.code} · 국제선 운항정보</Text>
                <Text style={styles.fullscreenSubtitle}>
                  {guide.name} · {direction === "departure" ? "국제선 출발" : "국제선 도착"} · 공식 공항 데이터
                </Text>
              </View>
              <MotionPressable
                accessibilityLabel="운항정보 닫기"
                onPress={() => setFlightFullscreen(false)}
                style={styles.fullscreenClose}
              >
                <MaterialCommunityIcons color="#FFFFFF" name="close" size={24} />
              </MotionPressable>
            </View>
            <View style={styles.flightBoardNotice}>
              <MaterialCommunityIcons color={colors.blue} name="information-outline" size={17} />
              <Text style={styles.flightBoardNoticeText}>
                공항 운영사가 제공하는 국제선 운항정보만 TripNow 내부에서 표시합니다. 편명, 목적지, 시간, 터미널, 게이트 및 운항 상태를 확인하세요.
              </Text>
            </View>
            <View style={styles.flightBoardBody}>
              {flightLoading ? (
                <View style={styles.flightLoading}>
                  <ActivityIndicator size="large" />
                  <Text style={styles.flightLoadingTitle}>공식 운항정보 불러오는 중</Text>
                  <Text style={styles.flightLoadingText}>공항 공식 페이지에서 오늘 운항표를 확인하고 있습니다.</Text>
                </View>
              ) : officialFlights.length > 0 ? (
                <ScrollView
                  contentContainerStyle={styles.flightList}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.flightListHeader}>
                    <View>
                      <Text style={styles.flightListEyebrow}>OFFICIAL AIRPORT DATA</Text>
                      <Text style={styles.flightListTitle}>
                        {direction === "departure" ? "오늘 국제선 출발편" : "오늘 국제선 도착편"}
                      </Text>
                    </View>
                    <View style={styles.flightCountBadge}>
                      <Text style={styles.flightCountText}>{officialFlights.length}편</Text>
                    </View>
                  </View>

                  {officialFlights.map((item, index) => (
                    <View
                      key={`${item.flight || "flight"}-${item.scheduled || index}-${index}`}
                      style={styles.flightCard}
                    >
                      <View style={styles.flightCardTop}>
                        <View style={styles.flightNumberWrap}>
                          <MaterialCommunityIcons color={colors.blue} name="airplane" size={17} />
                          <Text style={styles.flightNumber}>{item.flight || item.airline || "항공편"}</Text>
                        </View>
                        <View style={styles.flightTimeWrap}>
                          <Text style={styles.flightTime}>{item.scheduled || "--:--"}</Text>
                          {item.estimated && item.estimated !== item.scheduled ? (
                            <Text style={styles.flightEstimated}>→ {item.estimated}</Text>
                          ) : null}
                        </View>
                      </View>

                      <Text style={styles.flightDestination}>
                        {item.destination || (direction === "departure" ? "목적지 확인 중" : "출발지 확인 중")}
                      </Text>

                      <View style={styles.flightMetaRow}>
                        {item.terminal ? <Text style={styles.flightMeta}>터미널 {item.terminal}</Text> : null}
                        {item.gate ? <Text style={styles.flightMeta}>게이트 {item.gate}</Text> : null}
                        {item.airline && item.airline !== item.flight ? <Text style={styles.flightMeta}>{item.airline}</Text> : null}
                      </View>

                      {item.status ? (
                        <View style={styles.flightStatus}>
                          <MaterialCommunityIcons color={colors.teal} name="information-outline" size={14} />
                          <Text style={styles.flightStatusText}>{item.status}</Text>
                        </View>
                      ) : null}

                      {!item.destination && item.cells?.length ? (
                        <Text style={styles.flightRawText}>{item.cells.slice(0, 6).join(" · ")}</Text>
                      ) : null}
                    </View>
                  ))}

                  <View style={styles.flightSourceNotice}>
                    <MaterialCommunityIcons color={colors.teal} name="shield-check-outline" size={16} />
                    <Text style={styles.flightSourceNoticeText}>
                      공항 운영사의 공개 국제선 운항 페이지를 서버에서 읽어 TripNow 형식으로 정리한 정보입니다. 국내선은 제외하며, 당일 변경 사항은 공항 전광판과 항공사 안내를 함께 확인하세요.
                    </Text>
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.flightUnavailable}>
                  <View style={styles.flightUnavailableIcon}>
                    <MaterialCommunityIcons color={colors.blue} name="airplane-alert" size={28} />
                  </View>
                  <Text style={styles.flightFallbackTitle}>국제선 운항정보를 불러오지 못했습니다</Text>
                  <Text style={styles.flightFallbackText}>
                    {flightError || "공항 공식 페이지에서 국제선 운항표를 구조화된 데이터로 확인하지 못했습니다. 외부 웹페이지는 표시하지 않습니다."}
                  </Text>
                  <MotionPressable onPress={openFlightBoard} style={styles.retryButton}>
                    <MaterialCommunityIcons color="#FFFFFF" name="refresh" size={17} />
                    <Text style={styles.retryButtonText}>다시 불러오기</Text>
                  </MotionPressable>
                </View>
              )}
            </View>
          </View>
        </Modal>
      ) : null}

      <Text style={styles.footerNotice}>
        화면 속 지도는 공항 운영사가 게시한 자료입니다. 터미널·탑승구와 시설 위치는 당일 변경될 수 있으므로 공식 최신 지도와 전광판에서 최종 확인해 주세요.
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
  mapTabs: { gap: 7, paddingBottom: 11 },
  mapTab: { minHeight: 34, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, justifyContent: "center", backgroundColor: "#F8FAFC" },
  mapTabSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  mapTabText: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  mapTabTextSelected: { color: "#FFFFFF" },
  mapViewport: { borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FFFFFF", overflow: "hidden" },
  mapTools: { minHeight: 39, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8 },
  mapSource: { color: colors.textMuted, fontSize: 9, lineHeight: 14, flex: 1 },
  zoomButton: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F7FBFF" },
  zoomText: { color: colors.blue, fontSize: 10, fontWeight: "900" },
  mapDisclaimer: { color: colors.textMuted, fontSize: 9, lineHeight: 15, marginTop: 2 },
  kixMapFrame: { height: 420, overflow: "hidden", borderRadius: 15, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#FFFFFF" },
  officialWebCard: { minHeight: 220, borderRadius: 15, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F3F8FF", alignItems: "center", justifyContent: "center", padding: 20 },
  officialWebIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#E4F1FF", alignItems: "center", justifyContent: "center" },
  officialWebTitle: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 11 },
  officialWebText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 7, maxWidth: 420 },
  officialWebButton: { minHeight: 42, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 15, marginTop: 14 },
  officialWebButtonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  mapUnavailable: { minHeight: 186, borderRadius: 15, borderWidth: 1, borderColor: "#C7DCF5", backgroundColor: "#F3F8FF", alignItems: "center", justifyContent: "center", padding: 20 },
  mapUnavailableTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: 10 },
  mapUnavailableText: { color: colors.textMuted, fontSize: 11, lineHeight: 18, textAlign: "center", marginTop: 8 },
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
  fullscreenMap: { flex: 1, backgroundColor: "#071827" },
  fullscreenHeader: { minHeight: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 12, backgroundColor: "#102A43" },
  fullscreenTitleWrap: { flex: 1, minWidth: 0, paddingRight: 12 },
  fullscreenEyebrow: { color: "#8FD2FF", fontSize: 8, fontWeight: "900", letterSpacing: 1.2 },
  fullscreenTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginTop: 3 },
  fullscreenSubtitle: { color: "#C8D8E8", fontSize: 10, fontWeight: "800", marginTop: 3 },
  fullscreenClose: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  fullscreenBody: { flex: 1, width: "100%", backgroundColor: "#FFFFFF", overflow: "hidden" },
  flightBoardNotice: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#EEF6FF", borderBottomWidth: 1, borderBottomColor: "#D5E5F6" },
  flightBoardNoticeText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15, fontWeight: "700" },
  flightBoardBody: { flex: 1, width: "100%", backgroundColor: "#F4F7FA" },
  flightLoading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  flightLoadingTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 14 },
  flightLoadingText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 6 },
  flightList: { padding: 14, paddingBottom: 32 },
  flightListHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  flightListEyebrow: { color: colors.blue, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  flightListTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 },
  flightCountBadge: { borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 6 },
  flightCountText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  flightCard: { borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 9 },
  flightCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  flightNumberWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 0 },
  flightNumber: { color: colors.text, fontSize: 15, fontWeight: "900" },
  flightTimeWrap: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  flightTime: { color: colors.text, fontSize: 17, fontWeight: "900" },
  flightEstimated: { color: colors.warning, fontSize: 10, fontWeight: "900" },
  flightDestination: { color: colors.text, fontSize: 13, fontWeight: "800", marginTop: 9 },
  flightMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  flightMeta: { color: colors.textMuted, fontSize: 9, fontWeight: "800", borderRadius: radius.pill, backgroundColor: "#F1F4F7", paddingHorizontal: 8, paddingVertical: 5 },
  flightStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 9, borderRadius: 10, backgroundColor: colors.tealSoft, paddingHorizontal: 9, paddingVertical: 7 },
  flightStatusText: { color: colors.teal, fontSize: 9, lineHeight: 14, fontWeight: "900", flex: 1 },
  flightRawText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 8 },
  flightSourceNotice: { flexDirection: "row", alignItems: "flex-start", gap: 7, borderRadius: 13, backgroundColor: colors.tealSoft, padding: 12, marginTop: 4 },
  flightSourceNoticeText: { flex: 1, color: colors.textMuted, fontSize: 9, lineHeight: 15, fontWeight: "700" },
  flightUnavailable: { flex: 1, alignItems: "center", justifyContent: "center", padding: 26, backgroundColor: "#F4F7FA" },
  flightUnavailableIcon: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF4FF", marginBottom: 12 },
  flightFallbackTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginTop: 7 },
  flightFallbackText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 5 },
  retryButton: { minHeight: 42, marginTop: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  retryButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  footerNotice: { color: colors.textMuted, fontSize: 9, lineHeight: 15, textAlign: "center", paddingHorizontal: 18, marginTop: 13, marginBottom: 6 },
});
