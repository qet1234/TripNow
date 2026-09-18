# 인천공항 실시간 운항정보 연결

TripNow는 항공권 OCR로 저장한 항공편 번호를 Supabase Edge Function에 전달하고,
Edge Function이 공공데이터포털의 인천국제공항공사 여객편 운항현황 API를 호출합니다.

## 데이터 흐름

1. 출국일 또는 귀국일에 공항 홈 화면이 열립니다.
2. 앱이 항공편 번호와 출국·입국 방향만 Edge Function에 전달합니다.
3. Edge Function이 당일 운항정보를 조회합니다.
4. 앱에는 예정·변경 시각, 운항상태, 터미널, 탑승구, 체크인 카운터,
   수하물 수취대, 출구가 제공되는 범위에서 표시됩니다.
5. 조회 실패 시 저장된 항공 일정이 계속 표시됩니다.

현재 위치, 항공권 원본, 승객 이름, 예약번호는 전송하지 않습니다.

## 서버 설정

Supabase Edge Function 이름:

```
incheon-flight-status
```

Supabase 프로젝트의 Edge Function secret에 공공데이터포털에서 발급받은
**디코딩 인증키**를 다음 이름으로 등록합니다.

```
DATA_GO_KR_SERVICE_KEY
```

이 인증키는 `EXPO_PUBLIC_` 환경변수나 모바일 앱 코드에 넣지 않습니다.

사용 API:

- 인천국제공항공사_여객편 운항현황(다국어)
- 도착: `getPassengerArrivalsOdp`
- 출발: `getPassengerDeparturesOdp`

공공데이터 API가 당일 항공편을 제공하지 않거나 일부 항목이 비어 있으면
TripNow는 해당 값을 “공항에서 확인”으로 표시합니다.
