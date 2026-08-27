import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { JapanRegion } from "@/src/data/japanRegions";
import {
  fetchJapanWeather,
  type JapanWeather,
} from "@/src/services/weather";
import { colors, radius } from "@/src/theme";

type Props = {
  region: JapanRegion;
};

function formatTime(value: string) {
  const part = value.split("T")[1];
  return part ? part.slice(0, 5) : value;
}

export function WeatherCard({ region }: Props) {
  const [weather, setWeather] = useState<JapanWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      setWeather(await fetchJapanWeather(region, { force }));
    } catch (reason) {
      setWeather(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "날씨 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [region.id]);

  if (loading && !weather) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🌤️ {region.label} 실시간 날씨</Text>
        <Text style={styles.muted}>JMA 날씨를 불러오는 중...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>🌤️ {region.label} 실시간 날씨</Text>
        <Text style={styles.error}>
          {error ?? "현재 날씨를 확인할 수 없습니다."}
        </Text>
        <Pressable onPress={() => void load(true)} style={styles.retry}>
          <Text style={styles.retryText}>다시 불러오기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>실시간 일본 날씨 · {region.label}</Text>

      <View style={styles.currentRow}>
        <Text style={styles.icon}>{weather.current.condition.icon}</Text>
        <View>
          <Text style={styles.temperature}>
            {Math.round(weather.current.temperatureC)}°
          </Text>
          <Text style={styles.condition}>
            {weather.current.condition.label}
          </Text>
        </View>

        <View style={styles.highLowBox}>
          <Text style={styles.highLowLabel}>오늘 최고 / 최저</Text>
          <Text style={styles.highLow}>
            {Math.round(weather.today.maxTemperatureC)}° /{" "}
            {Math.round(weather.today.minTemperatureC)}°
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>체감</Text>
          <Text style={styles.metricValue}>
            {Math.round(weather.current.apparentTemperatureC)}°
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>습도</Text>
          <Text style={styles.metricValue}>
            {weather.current.humidityPercent}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>바람</Text>
          <Text style={styles.metricValue}>
            {Math.round(weather.current.windSpeedKmh)}km/h
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>오늘 강수</Text>
          <Text style={styles.metricValue}>
            {weather.today.precipitationMm.toFixed(1)}mm
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.updated}>
          기준 {formatTime(weather.current.time)} · 10분 캐시
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://open-meteo.com/")}
        >
          <Text style={styles.source}>
            Weather data by Open-Meteo · JMA
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginTop: 14,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  muted: {
    color: colors.textMuted,
    marginTop: 12,
  },
  error: {
    color: colors.danger,
    marginTop: 10,
    lineHeight: 19,
  },
  retry: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  icon: {
    fontSize: 36,
    marginRight: 10,
  },
  temperature: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "900",
  },
  condition: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  highLowBox: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  highLowLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  highLow: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  metrics: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 9,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
  },
  metricValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  footer: {
    marginTop: 14,
    gap: 5,
  },
  updated: {
    color: colors.textMuted,
    fontSize: 10,
  },
  source: {
    color: colors.primary,
    fontSize: 10,
    textDecorationLine: "underline",
  },
});
