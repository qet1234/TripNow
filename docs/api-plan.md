# Japan API Plan

| 기능 | 1차 후보 | 호출 위치 | 상태 |
|---|---|---|---|
| 지도 | Google Maps Platform | 모바일 SDK | 준비 |
| 장소 | Google Places API | Supabase Edge Function 권장 | 준비 |
| 길찾기 | Google Maps deep link | 외부 지도앱 | 연결 |
| 일본 날씨 | Open-Meteo JMA API | 앱 직접 호출(개발) | 연결 |
| 엔화 환율 | 한국수출입은행 Open API | 서버 | 준비 |
| 안전정보 | 외교부 공공데이터 | 서버 | 준비 |
| 경찰서/병원 | Google Places | 서버 프록시 권장 | 준비 |
| 일본 면세 | 일본 공식 규정 자체 DB | 서버 | 준비 |

## Japan weather

TripNow은 현재 Open-Meteo의 JMA API를 사용합니다.

- 사용자가 선택한 일본 지역의 고정 중심좌표만 전송
- 사용자 GPS 좌표는 날씨 API에 전송하지 않음
- timezone: Asia/Tokyo
- 현재 기온
- 체감온도
- 습도
- 현재 강수
- 풍속
- 오늘 최고/최저
- 오늘 누적 강수
- 시간대별 예보
- 앱 메모리 10분 캐시
- 화면에 Open-Meteo / JMA 출처 링크 표시

현재 무료 Open-Meteo API는 개발·평가용으로 사용합니다.
상업 출시 전에는 Open-Meteo 상업용 엔드포인트 또는 서버 프록시로 전환합니다.

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
