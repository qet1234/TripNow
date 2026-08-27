# Galaxy 실시간 지하철 안내

TripNow의 지하철 실시간 안내는 **Samsung Galaxy 전용**입니다. iOS 구현은 포함하지 않습니다.

## 표시 방식

### Live Update 지원 Galaxy

사용자가 지하철 이동을 직접 시작하면 Android Live Update 승격을 요청합니다.

표시될 수 있는 위치:

- 잠금화면
- 알림창 상단
- 상태바 chip
- Galaxy / One UI가 지원하는 Now Bar 등 시스템 실시간 영역

실제 승격 여부와 화면 위치는 Android 및 Samsung 시스템 정책이 결정합니다.

### Live Update 미지원 Galaxy

같은 데이터를 표준 진행형 지속 알림으로 자동 전환합니다. 알림 ID를 유지하므로 다음 역, 남은 역 수, 진행률이 갱신될 때 기존 알림이 교체됩니다.

### 비갤럭시 Android

알림을 시작하지 않습니다. 네이티브 모듈이 제조사를 확인하여 Galaxy 기기에서만 동작합니다.

## 알림 데이터

네이티브 모듈은 다음 필드를 받습니다.

- 노선명
- 방면
- 출발 시각
- 도착 예정 시각
- 다음 역
- 남은 역 수
- 진행률
- 정상/지연/운행상태

## 구현

- Android-only local Expo module
- Samsung 제조사 확인
- 지원 기기: NotificationCompat ProgressStyle + promoted ongoing 요청
- 미지원 Galaxy: 표준 NotificationCompat 진행률 표시
- POST_NOTIFICATIONS
- POST_PROMOTED_NOTIFICATIONS
- 시작 / 갱신 / 종료 API
- 알림 클릭 시 TripNow 실행
- 이동 화면 테스트 UI

## 실제 지하철 데이터

실제 자동 갱신에는 ODPT(Public Transportation Open Data Center) API 키가 필요합니다.

1차 연결 대상:

- Tokyo Metro
- 도에이 지하철

ODPT 실시간 데이터에서 다음을 정규화해 네이티브 알림에 전달합니다.

```text
ODPT / GTFS-Realtime
        ↓
TripNow transit service
        ↓
line / destination / delay / next stop / ETA
        ↓
Galaxy Live Update 또는 진행형 알림
```

ODPT 개발자 등록과 API 키 발급이 완료되기 전까지 앱 화면에서는 테스트 데이터로 네이티브 표시를 검증합니다.

## 중요

이 기능은 Expo Go로 검증할 수 없습니다. 로컬 Expo native module을 포함한 Android development/release build가 필요합니다.

GitHub Actions는 자동 실행되지 않으며, 2026년 9월 1일까지 수동 실행도 하지 않습니다.
