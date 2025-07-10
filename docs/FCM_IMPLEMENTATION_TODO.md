# FCM 알림 기능 구현 TODO

## 📋 개요
Firebase Cloud Messaging (FCM)을 사용한 최소한의 푸시 알림 시스템 구현

## 🔧 사전 준비 사항
- [x] Firebase 프로젝트 생성 완료
- [ ] Firebase 콘솔에서 iOS/Android 앱 추가
- [ ] google-services.json (Android) 다운로드
- [ ] GoogleService-Info.plist (iOS) 다운로드

## 📱 백엔드 구현

### 1. Firebase Admin SDK 설정 ⚡ (우선순위: 높음)
- [ ] Firebase 서비스 계정 키 JSON 파일 생성 및 다운로드
- [ ] 환경 변수 설정
  ```bash
  FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
  # 또는 환경 변수로 직접 설정
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY=your-private-key
  FIREBASE_CLIENT_EMAIL=your-client-email
  ```

### 2. 패키지 설치 ⚡ (우선순위: 높음)
```bash
cd apps/backend
pnpm add firebase-admin
```

### 3. 데이터베이스 스키마 ⚡ (우선순위: 높음)
```sql
-- FCM 토큰 저장 테이블
CREATE TABLE fcm_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text CHECK (platform IN ('ios', 'android', 'web')),
  device_info jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, token)
);

-- 인덱스 추가
CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX idx_fcm_tokens_is_active ON fcm_tokens(is_active);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fcm_tokens_updated_at 
  BEFORE UPDATE ON fcm_tokens 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. API 엔드포인트 구현 ⚡ (우선순위: 높음)

#### 4.1 Firebase Admin 초기화 서비스
```typescript
// apps/backend/src/services/firebase-admin.service.ts
```

#### 4.2 FCM 토큰 관리 API
```typescript
// apps/backend/src/routes/notifications.routes.ts

// POST /api/notifications/register
// - FCM 토큰 등록/갱신
// - 요청 바디: { token: string, platform: 'ios' | 'android', deviceInfo?: object }

// DELETE /api/notifications/unregister
// - FCM 토큰 삭제
// - 요청 바디: { token: string }

// GET /api/notifications/tokens
// - 사용자의 등록된 토큰 목록 조회
```

#### 4.3 알림 발송 API
```typescript
// POST /api/notifications/send
// - 특정 사용자에게 알림 발송
// - 요청 바디: { 
//     userId: string,
//     title: string,
//     body: string,
//     data?: object,
//     imageUrl?: string
//   }

// POST /api/notifications/send-to-topic
// - 토픽 구독자에게 알림 발송
// - 요청 바디: { topic: string, title: string, body: string }
```

### 5. 타입 정의 ⚡ (우선순위: 높음)
```typescript
// packages/shared/src/schemas/notification.schemas.ts
```

## 📱 모바일 앱 구현

### 1. 패키지 설치 ⚡ (우선순위: 높음)
```bash
cd apps/mobile
pnpm add expo-notifications expo-device expo-constants
```

### 2. app.json 설정 ⚡ (우선순위: 높음)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### 3. 알림 권한 요청 ⚡ (우선순위: 높음)
- [ ] 온보딩 권한 화면 수정 (permissions.tsx)
- [ ] 알림 권한 상태 관리
- [ ] 권한 거부 시 재요청 로직

### 4. FCM 토큰 관리 서비스 ⚡ (우선순위: 높음)
```typescript
// apps/mobile/shared/lib/notifications/fcm.service.ts
// - FCM 토큰 획득
// - 토큰 백엔드 등록
// - 토큰 갱신 처리
// - 토큰 삭제 (로그아웃 시)
```

### 5. 알림 수신 처리 🔶 (우선순위: 중간)
```typescript
// apps/mobile/shared/lib/notifications/notification.handler.ts
// - 포그라운드 알림 수신
// - 백그라운드 알림 수신
// - 알림 클릭 처리
// - 딥링크 네비게이션
```

### 6. 알림 UI 컴포넌트 🔶 (우선순위: 중간)
- [ ] 인앱 알림 토스트 컴포넌트
- [ ] 알림 설정 화면
- [ ] 알림 히스토리 화면 (선택사항)

## 🧪 테스트 및 검증 🔶 (우선순위: 중간)

### 1. 기능 테스트
- [ ] FCM 토큰 등록 테스트
- [ ] 알림 발송 테스트 (개별/토픽)
- [ ] 포그라운드 알림 수신 테스트
- [ ] 백그라운드 알림 수신 테스트
- [ ] 알림 클릭 → 앱 열기 테스트

### 2. 엣지 케이스
- [ ] 토큰 만료 및 갱신
- [ ] 네트워크 오류 처리
- [ ] 권한 거부 상태 처리
- [ ] 로그아웃 시 토큰 정리

## 📝 구현 순서

1. **백엔드 Firebase Admin SDK 설정** (fcm-1, fcm-2)
2. **데이터베이스 테이블 생성** (fcm-3)
3. **백엔드 API 구현** (fcm-4, fcm-5)
4. **모바일 패키지 설치 및 설정** (fcm-6, fcm-7)
5. **알림 권한 요청 구현** (fcm-8)
6. **FCM 토큰 관리 구현** (fcm-9)
7. **알림 수신 처리** (fcm-10, fcm-11)
8. **통합 테스트** (fcm-12)

## 🚀 최소 구현 목표

1차 목표 (필수):
- 사용자별 알림 발송
- 알림 권한 요청 및 토큰 등록
- 기본 알림 수신 (제목, 내용)

2차 목표 (선택):
- 알림 클릭 시 특정 화면 이동
- 알림 설정 관리
- 토픽 기반 알림
- 리치 알림 (이미지, 액션 버튼)

## 📌 주의사항

1. **iOS 설정**
   - Apple Developer 계정에서 Push Notification 인증서 필요
   - Xcode에서 Push Notifications capability 활성화

2. **Android 설정**
   - google-services.json 파일 android/app 폴더에 추가
   - 알림 채널 설정 (Android 8.0+)

3. **보안**
   - Firebase 서비스 계정 키는 절대 커밋하지 않기
   - 환경 변수로 관리
   - .gitignore에 추가 확인

4. **성능**
   - 대량 발송 시 배치 처리
   - 토큰 유효성 주기적 검증
   - 실패한 토큰 자동 정리