import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// API 키가 아직 등록되지 않은 미리보기 환경에서도 Mock 화면은 사용할 수
// 있어야 합니다. 실제 Edge Function을 호출하는 서비스는
// supabaseConfigured를 먼저 확인하고 안내 문구를 표시합니다.
const clientUrl = supabaseUrl || "https://tripnow-placeholder.invalid";
const clientKey = supabasePublishableKey || "tripnow-placeholder-key";

// TripNow 1차 버전은 회원가입/로그인을 사용하지 않습니다.
// Supabase는 운영정보, 공식 규정, API 캐시 및 Edge Functions 용도로만 사용합니다.
export const supabase = createClient(
  clientUrl,
  clientKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
