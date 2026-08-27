# TripNow Supabase

## Project

- Name: `TripNow`
- Project ref: `kszqbdcnbteyqkhcvzrn`
- Region: `ap-northeast-1` (Tokyo)
- Status: `ACTIVE_HEALTHY`
- API URL: `https://kszqbdcnbteyqkhcvzrn.supabase.co`

## TripNow 운영 원칙

TripNow 1차 버전은 **회원가입/로그인을 사용하지 않습니다.**

Supabase는 사용자 계정 DB가 아니라 아래 용도로 사용합니다.

- 국가별 공식 규정
- 일본 면세 규칙
- 공관/긴급 정보
- 앱 운영 설정
- API 캐시
- 서비스 점검 상태
- Edge Functions
- 외부 API secret 보호

사용자의 현재 GPS 좌표나 이동경로는 Supabase에 저장하지 않습니다.

## Client environment variables

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://kszqbdcnbteyqkhcvzrn.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<TripNow publishable key>
```

모바일에는 publishable key만 사용합니다.

다음 값은 모바일 코드나 GitHub 저장소에 커밋하지 않습니다.

- secret key
- legacy service_role key
- database password
- 외부 API secret

## Current database state

현재 `public` 스키마에는 사용자 정의 테이블이 없습니다.

향후 서버 운영용 테이블만 생성합니다.

- `country_rules`
- `embassy_directory`
- `service_status`
- `app_config`
- `api_cache`

사용자 개인 데이터인 숙소, 여행경비, 면세 구매내역, 즐겨찾기는 1차 버전에서 기기 내부 저장소에 저장합니다.

## Backend secrets

한국수출입은행, 외교부, Google Places/Routes 서버 키는 Supabase Edge Function secrets로 관리합니다.
