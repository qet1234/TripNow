# TripNow Supabase

## Project

- Name: `TripNow`
- Project ref: `kszqbdcnbteyqkhcvzrn`
- Region: `ap-northeast-1` (Tokyo)
- Status: `ACTIVE_HEALTHY`
- API URL: `https://kszqbdcnbteyqkhcvzrn.supabase.co`

## Client environment variables

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://kszqbdcnbteyqkhcvzrn.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<TripNow publishable key>
```

`publishable key`만 모바일 앱에 사용합니다.

다음 값은 모바일 코드나 GitHub 저장소에 커밋하지 않습니다.

- secret key
- legacy service_role key
- database password
- 외부 API secret

## Current database state

현재 `public` 스키마에는 사용자 정의 테이블이 없습니다.

다음 단계에서 아래 테이블을 생성할 예정입니다.

- profiles
- trips
- saved_places
- travel_expenses
- tax_free_purchases
- safety_checkins
- country_rules

모든 `public` 테이블에는 RLS를 활성화하고 사용자 소유 데이터는 `auth.uid()` 기반 정책으로 제한합니다.

## Backend secrets

한국수출입은행, 외교부, Google Places/Routes 서버 키는 Supabase Edge Function secret으로 관리합니다.
