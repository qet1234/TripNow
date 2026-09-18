# 인천공항 혼잡도 연동

TripNow 공항 홈은 Supabase Edge Function `incheon-airport-congestion`을 통해 공식 공공데이터만 조회합니다. 앱에는 공공데이터포털 인증키를 포함하지 않습니다.

## 제공 범위

- 입국장: 제1·제2여객터미널, 현재 시각 기준 전후 2시간 도착편의 입국장과 대기 인원
- 출국장: 공식 API가 현재 제공하는 제1여객터미널 출국장 대기 인원
- 제2여객터미널 출국장: 공식 API 제공 전까지 `unsupported`로 표시
- API 장애 또는 인증키 미등록: 저장된 항공 일정은 그대로 표시하고 혼잡도 카드만 준비 상태로 전환

## 나중에 설정할 서버 비밀값

1. 공공데이터포털에서 아래 두 API의 활용신청을 완료합니다.
   - `인천국제공항공사_입국장현황 정보 서비스` (데이터 ID `15095061`)
   - `인천국제공항공사_출국장 혼잡도 조회` (데이터 ID `15148225`)
2. 두 활용신청의 인증키를 각각 다음 Supabase Edge Function Secret에 저장합니다.
   - 입국장: `DATA_GO_KR_ARRIVAL_CONGESTION_SERVICE_KEY`
   - 출국장: `DATA_GO_KR_DEPARTURE_CONGESTION_SERVICE_KEY`
   - 값은 일반 인증키 또는 디코딩 인증키를 모두 지원합니다.
3. 출국장 API의 운영 엔드포인트가 기본값과 다르면 `DATA_GO_KR_DEPARTURE_CONGESTION_URL`에 활용가이드의 요청주소를 저장합니다.

인증키는 `EXPO_PUBLIC_` 환경변수나 앱 번들에 넣지 않습니다.

## 확인 항목

- `phase=arrival`, `terminal=1|2`: 200과 정규화된 `items`
- `phase=departure`, `terminal=1`: 200과 출국장별 대기 인원
- `phase=departure`, `terminal=2`: 200, `availability=unsupported`
- 인증키 미등록: 503, 앱에서는 비차단 안내 문구
- 함수는 JWT 검증을 활성화한 상태로 배포
