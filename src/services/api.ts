/**
 * TripNow 외부 데이터 연결 원칙
 *
 * - 로그인/회원 DB를 사용하지 않습니다.
 * - 사용자의 현재 위도/경도는 Supabase 또는 TripNow API로 전송하지 않습니다.
 * - 장소/날씨 요청은 사용자가 선택한 일본 지역의 고정 중심좌표를 사용합니다.
 * - Google Maps 길찾기는 목적지만 전달하고 현재 위치 처리는 Google Maps가 담당합니다.
 * - 한국수출입은행/외교부 등 서버 인증키는 Edge Function secret으로 관리합니다.
 */

export type ApiStatus = "mock" | "connected";

export const apiStatus: Record<string, ApiStatus> = {
  places: "mock",
  weather: "mock",
  exchangeRate: "mock",
  safety: "mock",
  taxFree: "mock",
};
