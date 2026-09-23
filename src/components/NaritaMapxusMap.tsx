import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createElement, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme";
import { OfficialAirportMapViewer } from "@/src/components/OfficialAirportMapViewer";

const NARITA_CENTER: [number, number] = [140.3929, 35.772];
const MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.js";
const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.css";
const MAPXUS_AUTH_JS = "https://web-sdk.mapxus.com/prod/mapxus-auth-0.1.2.js";
const MAPXUS_MAP_JS = "https://web-sdk.mapxus.com/prod/mapxus-map-10.1.0.js";
const MAPXUS_MAP_CSS = "https://web-sdk.mapxus.com/prod/mapxus-map-10.2.1.css";

type Status = "idle" | "loading" | "ready" | "missing-credentials" | "error";

function appendStylesheet(id: string, href: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(id: string, src: string) {
  if (typeof document === "undefined") return Promise.reject(new Error("document unavailable"));

  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === "true") return Promise.resolve();
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function buildingList(response: any): any[] {
  const candidates = [
    response?.result?.data,
    response?.result?.buildings,
    response?.result,
    response?.data?.result,
    response?.data,
    response?.buildings,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(candidate?.items)) return candidate.items;
  }
  return [];
}

function buildingIdOf(item: any) {
  return item?.id || item?.buildingId || item?.building_id || item?.properties?.id || item?.properties?.buildingId || "";
}

function buildingNameOf(item: any) {
  const names = [
    item?.name,
    item?.name_en,
    item?.nameEn,
    item?.properties?.name,
    item?.properties?.name_en,
  ];
  return names.filter(Boolean).join(" ");
}

export function NaritaMapxusMap({ fullscreen = false, terminal = "T1", direction = "departure" }: { fullscreen?: boolean; terminal?: string; direction?: "departure" | "arrival" }) {
  const containerRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const appId = process.env.EXPO_PUBLIC_MAPXUS_APP_ID?.trim();
    const appSecret = process.env.EXPO_PUBLIC_MAPXUS_SECRET?.trim();

    if (!appId || !appSecret) {
      setStatus("missing-credentials");
      setMessage("나리타 공식 실내지도를 내장하려면 Mapxus 웹 SDK 인증값이 필요합니다.");
      return;
    }

    let disposed = false;
    let maplibreMap: any = null;
    setStatus("loading");
    setMessage("나리타 공식 실내지도를 불러오는 중입니다.");

    const boot = async () => {
      appendStylesheet("tripnow-maplibre-css", MAPLIBRE_CSS);
      appendStylesheet("tripnow-mapxus-css", MAPXUS_MAP_CSS);

      await loadScript("tripnow-maplibre-js", MAPLIBRE_JS);
      await loadScript("tripnow-mapxus-auth-js", MAPXUS_AUTH_JS);
      await loadScript("tripnow-mapxus-map-js", MAPXUS_MAP_JS);

      if (disposed || !containerRef.current) return;

      const webWindow = window as any;
      const { maplibregl, MapxusAuth, MapxusMap } = webWindow;
      if (!maplibregl || !MapxusAuth || !MapxusMap) {
        throw new Error("Mapxus SDK 초기화에 실패했습니다.");
      }

      MapxusAuth.registerWithApiKey(appId, appSecret);

      maplibreMap = new maplibregl.Map({
        container: containerRef.current,
        center: NARITA_CENTER,
        zoom: 16.7,
      });

      const mapxusMap = new MapxusMap.Map({
        map: maplibreMap,
      });

      mapxusMap.renderComplete(async () => {
        if (disposed) return;

        try {
          if (typeof mapxusMap.setLanguage === "function") mapxusMap.setLanguage("en");

          const service = new MapxusMap.BuildingsService();
          const response = await service.searchByDistance({
            center: { lat: NARITA_CENTER[1], lon: NARITA_CENTER[0] },
            distance: 3500,
            offset: 0,
            page: 50,
          });

          const buildings = buildingList(response);
          const narita =
            buildings.find((item) => /narita|成田|nrt/i.test(buildingNameOf(item))) ||
            buildings[0];
          const buildingId = buildingIdOf(narita);

          if (buildingId && typeof mapxusMap.selectBuildingById === "function") {
            await mapxusMap.selectBuildingById(buildingId, {
              animate: false,
              fitBounds: true,
            });
          }

          setStatus("ready");
          setMessage("");
        } catch {
          setStatus("ready");
          setMessage("");
        }
      });
    };

    boot().catch((error) => {
      if (disposed) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "나리타 공식 지도를 불러오지 못했습니다.");
    });

    return () => {
      disposed = true;
      try {
        maplibreMap?.remove?.();
      } catch {
        // no-op
      }
    };
  }, []);

  if (Platform.OS !== "web" || status === "missing-credentials" || status === "error") {
    return (
      <OfficialAirportMapViewer
        airportCode="NRT"
        terminal={terminal}
        direction={direction}
        fullscreen={fullscreen}
      />
    );
  }

  return (
    <View style={[styles.wrapper, fullscreen && styles.wrapperFullscreen]}>
      {createElement("div", {
        ref: (node: any) => {
          containerRef.current = node;
        },
        style: {
          width: "100%",
          height: "100%",
          minHeight: fullscreen ? 560 : 420,
          borderRadius: fullscreen ? 0 : 14,
          overflow: "hidden",
          background: "#eef4f8",
        },
      })}
      {status === "loading" ? (
        <View pointerEvents="none" style={styles.overlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingTitle}>나리타 공식 지도 로딩 중</Text>
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      ) : null}
      {status === "error" ? (
        <View pointerEvents="none" style={styles.overlay}>
          <MaterialCommunityIcons color={colors.blue} name="map-marker-alert-outline" size={28} />
          <Text style={styles.loadingTitle}>지도 초기화 실패</Text>
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 420,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#C7DCF5",
    backgroundColor: "#EEF4F8",
    overflow: "hidden",
    position: "relative",
  },
  wrapperFullscreen: {
    flex: 1,
    height: "100%",
    minHeight: 560,
    borderRadius: 0,
    borderWidth: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247,251,255,0.94)",
    padding: 24,
  },
  notice: {
    minHeight: 220,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#C7DCF5",
    backgroundColor: "#F3F8FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fullscreenNotice: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E4F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 11,
    textAlign: "center",
  },
  text: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 430,
  },
  code: {
    color: colors.blue,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },
});
