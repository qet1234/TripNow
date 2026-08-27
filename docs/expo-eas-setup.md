# TripNow Expo / EAS 연결

TripNow는 기존 앱과 분리된 신규 Expo/EAS 프로젝트를 사용합니다.

## 앱 식별자

- Expo slug: `tripnow`
- Android package: `com.qet1234.tripnow`
- iOS bundleIdentifier: `com.qet1234.tripnow`
- Deep link scheme: `tripnow://`

## 신규 Expo 프로젝트 연결

저장소를 로컬에서 받은 뒤 Expo 계정에 로그인합니다.

```bash
git clone https://github.com/qet1234/TripNow.git
cd TripNow
npm install
npx eas-cli login
npx eas-cli init
```

`eas init`에서 기존 프로젝트를 선택하지 말고 TripNow 신규 프로젝트를 생성합니다.

생성 후 Expo가 `app.json`에 아래 값을 추가합니다.

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "NEW-TRIPNOW-PROJECT-ID"
      }
    }
  }
}
```

이 projectId는 KO-PICK의 EAS projectId를 재사용하면 안 됩니다.

## 빌드

```bash
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile development
npx eas-cli build --platform ios --profile production
```

## 환경변수

모바일 공개 변수는 Expo/EAS Environment Variables에서 관리합니다.

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

한국수출입은행, 외교부 등 서버 인증키는 모바일 EAS 공개 변수에 넣지 않고 Supabase Edge Function secret으로 관리합니다.
