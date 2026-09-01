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

## 실시간 데이터 지원 범위

1차 실시간 열차 위치 대상은 다음 6개 노선입니다.

- 도에이 아사쿠사선(A)
- 도에이 미타선(I)
- 도에이 신주쿠선(S)
- 도에이 오에도선(E)
- 요코하마 블루라인(B)
- 요코하마 그린라인(G)

도쿄메트로 9개 노선은 실시간 열차 위치가 아니라 운행정보 지원 대상으로 구분합니다.

```text
ODPT / GTFS-Realtime
        ↓
TripNow transit service
        ↓
line / destination / delay / next stop / ETA
        ↓
Galaxy Live Update 또는 진행형 알림
```

## 알림 데이터

- 노선명과 방면
- 출발·도착 예정 시각
- 다음 역과 남은 역 수
- 진행률
- 정상·지연·운행상태

## 구현

- Android-only local Expo module
- Samsung 제조사 확인
- 지원 기기: NotificationCompat ProgressStyle + promoted ongoing 요청
- 미지원 Galaxy: 표준 NotificationCompat 진행률 표시
- POST_NOTIFICATIONS / POST_PROMOTED_NOTIFICATIONS
- 시작 / 갱신 / 종료 API
- 알림 클릭 시 TripNow 실행
- 교통 화면 테스트 UI

현재 앱 화면은 오에도선 샘플 데이터로 네이티브 표시를 검증합니다. 실제 자동 갱신은 ODPT 또는 GTFS-Realtime API를 서버에서 정규화한 뒤 활성화합니다.

이 기능은 Expo Go로 검증할 수 없습니다. 로컬 Expo native module을 포함한 Android development 또는 release 빌드가 필요합니다.
