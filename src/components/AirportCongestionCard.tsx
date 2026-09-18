import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getIncheonAirportCongestion,
  type AirportCongestion,
  type AirportCongestionPhase,
} from "@/src/services/airportCongestion";
import { colors, radius } from "@/src/theme";

type Props = {
  phase: AirportCongestionPhase;
  terminal: string;
  airportCode?: string;
  flightId?: string;
  accent: string;
  soft: string;
};

function formatRefreshTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemSummary(phase: AirportCongestionPhase, waitingPeople: number) {
  if (phase === "departure") {
    return waitingPeople > 0 ? `현재 ${waitingPeople.toLocaleString("ko-KR")}명` : "대기 인원 집계 중";
  }
  return waitingPeople > 0 ? `입국 대기 ${waitingPeople.toLocaleString("ko-KR")}명` : "대기 인원 없음";
}

export function AirportCongestionCard({
  phase,
  terminal,
  airportCode,
  flightId,
  accent,
  soft,
}: Props) {
  const [congestion, setCongestion] = useState<AirportCongestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCongestion(
        await getIncheonAirportCongestion({
          phase,
          terminal,
          airportCode,
          flightId,
        }),
      );
    } catch {
      setCongestion(null);
      setError("인증키 등록 후 실시간 혼잡도가 자동으로 표시됩니다.");
    } finally {
      setLoading(false);
    }
  }, [airportCode, flightId, phase, terminal]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isDeparture = phase === "departure";
  const title = isDeparture ? "출국장 혼잡도" : "입국장 혼잡도";
  const items = congestion?.items.slice(0, 3) || [];
  const refreshedAt = congestion ? formatRefreshTime(congestion.refreshedAt) : "";

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={[styles.icon, { backgroundColor: soft }]}>
          <MaterialCommunityIcons
            color={accent}
            name={isDeparture ? "account-group-outline" : "passport"}
            size={21}
          />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.label}>제{terminal === "2" ? "2" : "1"}여객터미널</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={accent} size="small" />
        ) : (
          <Pressable
            accessibilityLabel={`${title} 새로고침`}
            hitSlop={8}
            onPress={() => void refresh()}
            style={styles.refreshButton}
          >
            <MaterialCommunityIcons color={accent} name="refresh" size={20} />
          </Pressable>
        )}
      </View>

      {congestion?.availability === "unsupported" ? (
        <View style={[styles.notice, { backgroundColor: soft }]}>
          <MaterialCommunityIcons color={accent} name="information-outline" size={18} />
          <Text style={styles.noticeText}>
            {congestion.sourceNotice || "현재 공식 혼잡도 제공 대상이 아닙니다."}
          </Text>
        </View>
      ) : items.length > 0 ? (
        <View style={styles.itemList}>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.label || "공항 안내"}</Text>
                <Text style={styles.itemMeta}>
                  {[item.zone, item.flightId, item.gate ? `게이트 ${item.gate}` : ""]
                    .filter(Boolean)
                    .join(" · ") || "인천공항 공식 집계"}
                </Text>
              </View>
              <Text style={[styles.count, { color: accent }]}>
                {itemSummary(phase, item.waitingPeople)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <MaterialCommunityIcons color="#8D979C" name="cloud-clock-outline" size={20} />
          <Text style={styles.emptyText}>
            {error || "현재 표시할 혼잡도 정보가 없습니다."}
          </Text>
        </View>
      )}

      <Text style={styles.footer}>
        {congestion?.availability === "live"
          ? `인천국제공항공사 제공${refreshedAt ? ` · ${refreshedAt} 갱신` : ""}`
          : "혼잡도는 현장 상황에 따라 달라질 수 있습니다."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 15, marginTop: 12 },
  heading: { flexDirection: "row", alignItems: "center" },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 10 },
  headingCopy: { flex: 1, minWidth: 0 },
  label: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 2 },
  refreshButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  notice: { borderRadius: radius.md, marginTop: 13, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  noticeText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: "700" },
  itemList: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 13 },
  item: { minHeight: 57, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 9 },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  itemMeta: { color: colors.textMuted, fontSize: 9, lineHeight: 13, fontWeight: "700", marginTop: 3 },
  count: { fontSize: 11, fontWeight: "900" },
  empty: { minHeight: 66, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 13, flexDirection: "row", alignItems: "center", gap: 8 },
  emptyText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 16, fontWeight: "700" },
  footer: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 9 },
});
