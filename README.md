# TripNow · 트립나우

해외여행 중 **지금 필요한 행동**을 빠르게 실행할 수 있도록 돕는 로그인 없는 Galaxy 앱이며, 브라우저에서 확인할 수 있는 웹 미리보기도 제공합니다. 첫 지원 국가는 일본입니다.

## 디자인

목업을 실제 Expo Router 화면으로 반영했습니다.

- 홈: 여행 검색, 도쿄 대표 배너, 도시별 인기 여행지, 날씨·환율
- 탐색: Android 네이티브 지도·웹 지도 미리보기, 맛집·카페·관광·쇼핑 필터, 지역 선택, Google Maps 길찾기
- 일정: 3박 4일 탭, 시간대별 일정, 교통 화면 연결
- 교통: 시부야→아사쿠사 경로, 실시간 위치 지원 6개 노선, Galaxy 잠금화면·상단바 알림
- 마이: 저장 장소, 여행 일정, 도착 알림, 개인정보 안내

프로토타입 여행지 사진은 Unsplash 원격 이미지를 사용합니다. 정식 출시 전 앱 내 데이터·이미지 출처 화면을 확정합니다.

## 사용 모드

- 한국 등 일본 외 지역: **일본 여행 미리보기**
- 일본 도착 후: **현지 모드**
- 위치 권한은 일본 도착 여부를 단말 내부에서 확인할 때만 사용
- 현재 위도·경도는 TripNow 서버나 Supabase에 저장·전송하지 않음
- 위치 이력·위치 공유·백그라운드 추적 없음

## 지하철 지원 범위

실시간 열차 위치 1차 지원:

- 도에이: 아사쿠사선, 미타선, 신주쿠선, 오에도선
- 요코하마: 블루라인, 그린라인

도쿄메트로 9개 노선은 실시간 열차 위치가 아닌 운행정보 지원 대상으로 구분합니다. 실제 자동 갱신은 ODPT 또는 GTFS-Realtime 데이터를 서버에서 정규화한 뒤 앱과 Galaxy 네이티브 알림에 전달합니다.

## 데이터 저장

회원가입과 로그인을 사용하지 않습니다.

기기 내부:

- 선택 지역
- 숙소
- 즐겨찾기
- 여행 경비
- 면세 구매내역

Supabase:

- 국가별 공식 규정
- 일본 면세 규정
- 공관·긴급정보
- 앱 운영 설정
- API 캐시
- Edge Functions와 API secret

## 기술

- Expo SDK 57
- React Native / TypeScript
- Expo Router
- React Native Maps
- Android-only local Expo module
- Supabase
- Google Maps / Places
- Open-Meteo + JMA
- 한국수출입은행 환율 Open API

## 앱 구조

```text
홈 | 탐색 | 일정 | 교통 | 마이
```

## 로컬 검증

```bash
npm ci
npm run check
```

웹 미리보기:

```bash
npm run web
npm run build:web
```

## GitHub Actions

- `Verify TripNow`: push와 PR에서 TypeScript, Expo 의존성, Android JS 번들, 웹 정적 빌드를 검사
- `EAS Build`: 수동 실행으로 preview APK 또는 production AAB 생성
- EAS 빌드는 저장소 Secret `EXPO_TOKEN`과 최초 EAS 프로젝트 연결이 필요

## Expo / EAS

- 지원 플랫폼: Android (Samsung Galaxy), Web preview
- Expo slug: `tripnow`
- Android package: `com.qet1234.tripnow`
- scheme: `tripnow://`

신규 EAS 프로젝트 생성·연결 절차는 [docs/expo-eas-setup.md](docs/expo-eas-setup.md)를 따릅니다.

## 문서

- [앱 구조](docs/architecture.md)
- [위치정보 처리 원칙](docs/location-privacy.md)
- [Galaxy 실시간 지하철 안내](docs/galaxy-live-transit.md)
- [일본 API 계획](docs/api-plan.md)
- [Supabase 구성](docs/supabase-setup.md)
- [Expo/EAS 연결](docs/expo-eas-setup.md)
