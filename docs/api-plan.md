# Japan API Plan

| 기능 | 1차 후보 | 호출 위치 |
|---|---|---|
| 지도 | Google Maps Platform | 모바일 SDK |
| 장소 | Google Places API | Supabase Edge Function 권장 |
| 길찾기 | Google Routes / Maps deep link | 서버 또는 외부 지도앱 |
| 일본 날씨 | Open-Meteo + JMA 계열 | 앱/서버 캐시 |
| 엔화 환율 | 한국수출입은행 Open API | 서버 |
| 안전정보 | 외교부 공공데이터 | 서버 |
| 경찰서/병원 | Google Places | 서버 프록시 권장 |
| 일본 면세 | 일본 공식 규정 자체 DB | 서버 |

## Key management

모바일 공개 환경변수:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

서버 전용:
- 한국수출입은행 인증키
- 외교부 공공데이터 인증키
- Supabase service role
- Google Places/Routes Web Service key

서버 전용 값은 Supabase Edge Function secrets로 관리합니다.
