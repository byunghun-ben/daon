# FCM 알림 기능 구현 TODO

## 📋 개요
Firebase Cloud Messaging (FCM)을 사용한 최소한의 푸시 알림 시스템 구현

## ✅ 완료된 작업 (2025-01-10)

### 백엔드 구현 완료
1. **Firebase Admin SDK 설정** ✅
   - firebase-admin 패키지 설치
   - Firebase Admin 초기화 서비스 구현
   - 환경 변수 기반 인증 설정

2. **데이터베이스** ✅
   - FCM 토큰 테이블 생성 (fcm_tokens)
   - RLS 정책 설정 (사용자별 접근 제어)
   - 인덱스 및 트리거 설정

3. **API 엔드포인트** ✅
   - POST /api/notifications/register - FCM 토큰 등록/갱신
   - DELETE /api/notifications/unregister - FCM 토큰 삭제
   - GET /api/notifications/tokens - 사용자 토큰 목록 조회
   - POST /api/notifications/send - 특정 사용자에게 알림 발송
   - POST /api/notifications/send-to-topic - 토픽 구독자에게 알림 발송

4. **타입 정의** ✅
   - Zod v4 스키마 정의 (notification.schemas.ts)
   - FCM 토큰 및 알림 관련 타입 완성

### 모바일 앱 구현 완료
1. **패키지 설치** ✅
   - expo-notifications 설치 및 설정
   - app.json 플러그인 구성

2. **알림 권한** ✅
   - 온보딩 권한 화면에 알림 권한 추가
   - 권한 유틸리티 함수 구현
   - iOS/Android 권한 처리

3. **FCM 토큰 관리** ✅
   - Expo Push Token 사용 (FCM 토큰 대체)
   - 로그인 시 자동 토큰 등록
   - 로그아웃 시 자동 토큰 해제
   - 디바이스 정보 수집 및 전송

4. **알림 수신 처리** ✅
   - 포그라운드 알림 표시
   - 백그라운드 알림 수신
   - 알림 클릭 시 딥링크 처리
   - Android 알림 채널 설정 (5개 카테고리)

5. **API 연동** ✅
   - FCM API 훅 구현 (TanStack Query)
   - 토큰 등록/해제/조회 훅

## 🔧 남은 준비 사항
- [ ] Firebase 콘솔에서 iOS/Android 앱 추가
- [ ] google-services.json (Android) 다운로드
- [ ] GoogleService-Info.plist (iOS) 다운로드
- [ ] 환경 변수 설정 (FIREBASE_SERVICE_ACCOUNT_PATH 등)

## 🚀 향후 추가 가능한 기능들

### 1. 알림 설정 화면 🔶 (우선순위: 중간)
- [ ] 카테고리별 알림 on/off 설정
  - 수유 알림
  - 기저귀 알림
  - 수면 알림
  - 성장 기록 알림
  - 마일스톤 알림
- [ ] 알림 시간대 설정 (Do Not Disturb)
- [ ] 알림 소리/진동 설정

### 2. 예약 알림 기능 🔶 (우선순위: 중간)
- [ ] 정기 알림 설정 (예: 매일 오후 8시 일기 작성 알림)
- [ ] 활동 기반 알림 (예: 마지막 수유 후 3시간 경과 알림)
- [ ] 성장 기록 알림 (예: 매월 1일 성장 측정 알림)

### 3. 알림 히스토리 📊 (우선순위: 낮음)
- [ ] 받은 알림 목록 표시
- [ ] 알림별 읽음/안읽음 상태
- [ ] 알림 삭제 기능
- [ ] 알림 필터링 (날짜, 카테고리별)

### 4. 고급 알림 기능 🎯 (우선순위: 낮음)
- [ ] 리치 알림 (이미지, 액션 버튼)
- [ ] 알림 그룹화 (Android)
- [ ] 알림 요약 (iOS)
- [ ] 커스텀 알림 소리

### 5. 분석 및 모니터링 📈 (우선순위: 낮음)
- [ ] 알림 전송 성공률 추적
- [ ] 알림 클릭률 측정
- [ ] 사용자별 알림 선호도 분석
- [ ] 알림 피로도 관리

## 📱 프로덕션 배포 전 필수 설정

### 1. Firebase 프로젝트 설정
```bash
# Firebase 콘솔에서 수행
1. https://console.firebase.google.com 접속
2. 프로젝트 생성 또는 선택
3. iOS/Android 앱 추가
   - iOS: Bundle ID 입력 (com.bridgestudio.daon)
   - Android: Package name 입력 (com.bridgestudio.daon)
4. 설정 파일 다운로드
   - iOS: GoogleService-Info.plist → apps/mobile/ios/
   - Android: google-services.json → apps/mobile/android/app/
```

### 2. 백엔드 환경 변수 설정
```bash
# apps/backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# 또는
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### 3. iOS Push Notification 설정
- [ ] Apple Developer Console에서 Push Notification 인증서 생성
- [ ] Firebase Console에 APNs 인증서 업로드
- [ ] Xcode에서 Push Notifications capability 활성화

### 4. EAS Build 설정
```bash
# EAS 빌드 시 Firebase 설정 파일 포함 확인
eas build --platform all --profile production
```

## 🧪 테스트 체크리스트

### 기본 기능 테스트 ✅
- [x] FCM 토큰 등록/해제 API
- [x] 알림 발송 API (개별/토픽)
- [x] 알림 권한 요청 플로우
- [x] 로그인/로그아웃 시 토큰 관리

### 실제 디바이스 테스트 필요
- [ ] iOS 실기기 알림 수신
- [ ] Android 실기기 알림 수신
- [ ] 백그라운드 알림 동작
- [ ] 알림 클릭 시 딥링크
- [ ] 알림 채널별 설정 (Android)

## 📊 구현 완료 통계
- **총 작업 항목**: 10개
- **완료된 항목**: 10개 (100%)
- **커밋 수**: 5개
- **영향받은 파일**: 약 20개

## 🎯 다음 단계 권장사항
1. **Firebase 프로젝트 설정 완료** (최우선)
2. **실기기 테스트** (iOS/Android)
3. **알림 설정 화면 구현** (사용자 경험 개선)
4. **예약 알림 기능** (사용자 편의성)