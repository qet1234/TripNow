# TripNow Architecture

## Product scope

TripNow의 1차 지원 국가는 일본입니다. 여행 계획 앱보다 **현지에서 지금 필요한 행동**을 빠르게 실행하는 앱을 목표로 합니다.

## Information architecture

```text
TripNow
├─ 지금
│  ├─ 날씨
│  ├─ 엔화 환율
│  ├─ 지금 먹을 곳
│  ├─ 지금 갈 곳
│  ├─ 숙소 귀가
│  └─ 여행 안심
├─ 찾기
│  ├─ 관광지
│  ├─ 음식
│  ├─ 카페
│  ├─ 쇼핑
│  └─ 주변 장소
├─ 이동
│  ├─ 숙소로 가기
│  ├─ 도보
│  ├─ 대중교통
│  └─ 택시 안심
├─ 안심
│  ├─ SOS
│  ├─ 위치 공유
│  ├─ 경찰서
│  ├─ 병원
│  ├─ 한국 공관
│  └─ 긴급 일본어
└─ 여행
   ├─ 일본 면세
   ├─ 엔화 계산
   ├─ 상황별 회화
   ├─ 여행 경비
   └─ 오프라인 국가팩
```

## Runtime architecture

```text
Expo React Native App
       │
       ├─ Foreground Location
       ├─ Google Maps SDK
       └─ Supabase Edge Functions
              ├─ Google Places / Routes proxy
              ├─ JPY → KRW exchange rate
              ├─ official safety information
              └─ Japan tax-free rules
                    │
                    └─ PostgreSQL
```

## Security principles

- 외부 API 비밀키는 앱 번들에 넣지 않습니다.
- 위치는 1차 버전에서 foreground 권한만 사용합니다.
- background location은 택시 안심 고도화 시 별도 정책 검토 후 추가합니다.
- 안전/면세 규정은 공식 출처와 최종 확인일을 함께 저장합니다.
