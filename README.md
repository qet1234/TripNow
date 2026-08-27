# TripNow

해외여행 중 **지금 필요한 행동**을 빠르게 실행할 수 있도록 돕는 로그인 없는 Galaxy 전용 모바일 앱입니다.

## 1차 출시

첫 지원 국가는 **일본**입니다.

### 사용 모드

- 한국 등 일본 외 지역: **일본 여행 미리보기**
- 일본 도착 후: **현지 모드**
- 위치 권한은 일본 도착 여부를 단말 내부에서 확인할 때만 사용
- 현재 위도/경도는 TripNow 서버나 Supabase에 저장·전송하지 않음
- 위치 이력·위치 공유·백그라운드 추적 없음

### 핵심 기능

- 도쿄·오사카·후쿠오카 등 일본 지역 직접 선택
- 현지시간 / 일본 날씨
- 엔화 → 원화 환산
- 선택 지역 기준 관광지·음식점·카페 탐색
- 숙소 등록 및 Google Maps로 돌아가기
- Galaxy 실시간 지하철 안내(Live Update / 진행형 알림)
- 선택 지역 기준 경찰서·병원·대한민국 공관
- 일본 긴급전화 110 / 119
- 상황별 일본어 회화 카드
- 일본 면세 구매 및 출국 체크

## 위치 처리 구조

```text
현재 위치 권한
   ↓
단말 내부에서 일본 여부만 판정
   ↓
좌표 폐기
   ↓
현지 모드

장소/날씨 검색
   ↓
사용자가 선택한 지역의 고정 중심좌표

길찾기
   ↓
TripNow는 목적지만 전달
   ↓
Google Maps가 현재 위치 처리
```

## 데이터 저장

회원가입/로그인은 사용하지 않습니다.

기기 내부:
- 선택 지역
- 숙소
- 즐겨찾기
- 여행 경비
- 면세 구매내역

Supabase:
- 국가별 공식 규정
- 일본 면세 규정
- 공관/긴급정보
- 앱 운영 설정
- API 캐시
- Edge Functions / API secret

## 기술

- Expo SDK 57
- React Native / TypeScript
- Expo Router
- Android-only local Expo module
- Supabase
- Google Maps / Places
- Open-Meteo + JMA
- 한국수출입은행 환율 Open API

## 앱 구조

```text
지금 | 찾기 | 이동 | 안심 | 여행
```

## Expo / EAS

- 지원 플랫폼: `android` (Samsung Galaxy)
- Expo slug: `tripnow`
- Android package: `com.qet1234.tripnow`
- scheme: `tripnow://`

신규 EAS 프로젝트 생성/연결 절차는 [docs/expo-eas-setup.md](docs/expo-eas-setup.md)를 따릅니다.

## 문서

- [앱 구조](docs/architecture.md)
- [위치정보 처리 원칙](docs/location-privacy.md)
- [Galaxy 실시간 지하철 안내](docs/galaxy-live-transit.md)
- [일본 API 계획](docs/api-plan.md)
- [Supabase 구성](docs/supabase-setup.md)
- [Expo/EAS 연결](docs/expo-eas-setup.md)
