# TripNow Architecture

## Product scope

TripNow의 1차 지원 국가는 일본입니다. 로그인 없이 설치 후 바로 사용하며, 한국 등 일본 외 지역에서는 미리보기 모드로 동작합니다.

## Mode

```text
한국/일본 외
  → 미리보기 모드
  → 일본 지역 직접 선택

일본 도착
  → 사용자가 위치 확인 실행
  → 단말 내부에서 일본 여부만 판정
  → 좌표 즉시 폐기
  → 현지 모드
```

## Information architecture

```text
TripNow
├─ 지금
│  ├─ 일본 도착 확인
│  ├─ 지역 선택
│  ├─ 날씨
│  ├─ 엔화 환율
│  ├─ 이 지역 먹을 곳
│  └─ 이 지역 갈 곳
├─ 찾기
│  ├─ 관광지
│  ├─ 음식
│  ├─ 카페
│  └─ 쇼핑
├─ 이동
│  ├─ 숙소로 가기
│  ├─ 지역 지도
│  └─ Google Maps 길찾기
├─ 안심
│  ├─ 경찰 110
│  ├─ 구급/소방 119
│  ├─ 선택 지역 경찰서
│  ├─ 선택 지역 병원
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
       ├─ Device-only Japan presence check
       │     └─ GPS coordinates never leave function
       │
       ├─ Local device storage
       │     ├─ selected region
       │     ├─ accommodation
       │     ├─ expenses
       │     └─ tax-free purchases
       │
       ├─ Google Maps
       │     └─ TripNow passes destination only
       │
       └─ Supabase
             ├─ official country rules
             ├─ service configuration
             ├─ API cache
             └─ Edge Functions / secrets
```

## Privacy principles

- 로그인/회원가입 없음
- 현재 좌표 서버 전송 없음
- 현재 좌표 DB 저장 없음
- 위치 이력 없음
- 위치 공유 없음
- 백그라운드 위치 없음
- 주변검색은 선택 지역 고정 중심좌표 기준
- 길찾기의 현재 위치 계산은 Google Maps에서 처리

자세한 내용은 [location-privacy.md](location-privacy.md)를 참고합니다.
