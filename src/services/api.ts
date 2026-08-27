/**
 * TripNow 외부 데이터 연결 원칙
 *
 * - Google Places/Routes처럼 키 보호 또는 비용 통제가 필요한 요청은
 *   가능하면 Supabase Edge Function을 통해 호출합니다.
 * - 한국수출입은행/외교부 인증키도 앱 번들에 직접 넣지 않습니다.
 * - 날씨처럼 공개 클라이언트 호출이 가능한 API도 추후 캐시 계층을 둘 수 있습니다.
 */

export type ApiStatus = "mock" | "connected";

export const apiStatus: Record<string, ApiStatus> = {
  places: "mock",
  weather: "mock",
  exchangeRate: "mock",
  safety: "mock",
  taxFree: "mock",
};
