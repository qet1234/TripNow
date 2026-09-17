# 호텔 OCR 개인정보 보호 설계

## 결론

호텔 예약 확인서 OCR은 Android 기기 안에서만 실행한다. TripNow 서버, Supabase, Vercel Function 또는 클라우드 OCR에는 이미지와 인식 결과를 전송하지 않는다.

이 설계는 개인정보 처리 범위와 유출 위험을 최소화하기 위한 것이다. 특정 신고·신고 면제 여부를 보장하는 법률 의견은 아니며, 출시 국가·사업 형태·추가 기능에 따라 개인정보보호위원회 또는 전문가의 최종 검토가 필요하다.

## 데이터 흐름

1. 사용자가 Android 시스템 파일 선택창에서 예약 사진 한 장을 직접 고른다.
2. 앱은 선택된 URI를 Google ML Kit의 앱 번들형 모델로 인식한다.
3. 원본 사진과 OCR 전문은 앱 파일·DB·로그에 저장하지 않는다.
4. 호텔명, 주소, 체크인, 체크아웃만 편집 화면에 채운다.
5. 사용자가 내용을 확인하고 저장 버튼을 눌러야만 최소 필드를 `expo-secure-store`에 저장한다.
6. 앱은 파일 선택 URI에 대한 지속 접근 권한을 OCR 직후 해제한다.
7. 사용자는 화면의 삭제 버튼으로 저장 정보를 즉시 삭제할 수 있다.

## 의도적으로 처리하지 않는 정보

- 투숙객·예약자 이름
- 예약번호·확인번호
- 이메일·전화번호
- 결제수단·가격·영수증 정보
- 여권·신분증 정보
- 원본 이미지와 전체 OCR 텍스트
- 현재 위치 또는 호텔 방문 이력

## 권한과 외부 전송

- 카메라 권한을 요청하지 않는다.
- 사진 보관함 전체 접근 권한을 요청하지 않는다.
- Android 시스템 파일 선택창으로 사용자가 선택한 한 장에만 접근한다.
- ML Kit 공식 약관에 따르면 입력 이미지와 OCR 출력은 기기에서 처리되고 Google 서버로 전송되지 않는다.
- 다만 ML Kit SDK는 성능·진단·사용량 측정을 위해 기기/앱 정보, 설치 단위 식별자, 성능 지표, API 설정, 입력·출력 크기, 이벤트 종류, 오류 코드를 Google에 전송할 수 있다. 이 항목은 개인정보처리방침과 Google Play 데이터 보안 양식에 정확히 공개해야 한다.

## 출시 전 필수 확인

- 개인정보처리방침에 호텔 OCR의 기기 내 처리, 최소 필드 저장, 삭제 방법을 기재한다.
- Google Play 데이터 보안 양식에 앱 전체 SDK의 수집 항목을 다시 점검한다.
- ML Kit 진단·사용량 데이터의 처리 내용을 누락하지 않는다.
- 앱 화면의 “서버로 전송하지 않음” 문구가 실제 네트워크·로그·분석 코드와 일치하는지 릴리스마다 검증한다.
- 고객지원 첨부, 계정 동기화, 백업, 분석 이벤트, 서버 저장 기능을 나중에 추가하면 출시 전 법률·보안 검토를 다시 수행한다.

## 공식 근거

- 개인정보 보호법: https://www.law.go.kr/법령/개인정보보호법
- Google ML Kit Terms & Privacy: https://developers.google.com/ml-kit/terms
- ML Kit Android 데이터 공개 안내: https://developers.google.com/ml-kit/android-data-disclosure
- Google Play 데이터 보안 섹션 안내: https://support.google.com/googleplay/android-developer/answer/10787469?hl=ko
- ML Kit Android Text Recognition v2: https://developers.google.com/ml-kit/vision/text-recognition/v2/android
