# TripNow

해외여행 중 **지금 필요한 행동**을 빠르게 실행할 수 있도록 돕는 모바일 앱입니다.

## 1차 출시

첫 지원 국가는 **일본**입니다.

### 핵심 기능

- 현재 위치 / 현지시간 / 일본 날씨
- 엔화 → 원화 환산
- 관광지·음식점·카페 탐색
- 숙소 등록 및 숙소로 돌아가기
- 주변 경찰서·병원·대한민국 공관
- SOS·현재 위치 공유
- 상황별 일본어 회화 카드
- 일본 면세 구매 및 출국 체크

## 기술

- Expo SDK 57
- React Native / TypeScript
- Expo Router
- Supabase
- Google Maps / Places
- Open-Meteo + JMA
- 한국수출입은행 환율 Open API

## 앱 구조

```text
지금 | 찾기 | 이동 | 안심 | 여행
```

## Expo / EAS

이 저장소는 기존 앱과 분리된 **TripNow 전용 Expo/EAS 프로젝트**를 사용합니다.

- Expo slug: `tripnow`
- Android package: `com.qet1234.tripnow`
- iOS bundle identifier: `com.qet1234.tripnow`
- scheme: `tripnow://`

신규 EAS 프로젝트 생성/연결 절차는 [docs/expo-eas-setup.md](docs/expo-eas-setup.md)를 따릅니다.

GitHub Actions의 `EAS Build` workflow는 신규 Expo projectId 및 `EXPO_TOKEN` 연결 후 Android/iOS 빌드를 실행할 수 있도록 준비되어 있습니다.

## 문서

- [앱 구조](docs/architecture.md)
- [일본 API 계획](docs/api-plan.md)
- [Expo/EAS 연결](docs/expo-eas-setup.md)
