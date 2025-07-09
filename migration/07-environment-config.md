# 7단계: 환경 설정 업데이트

## 📋 개요

새로운 Supabase 프로젝트로 마이그레이션 후 환경 변수와 설정을 업데이트하는 가이드입니다.

## 🔑 새 Supabase 프로젝트 정보 수집

### 1. Supabase Dashboard에서 확인할 정보

새 프로젝트의 Supabase Dashboard > Settings > API에서 다음 정보를 수집하세요:

- **Project URL**: `https://your-project-id.supabase.co`
- **API Keys**:
  - `anon` (공개 키)
  - `service_role` (서비스 역할 키)

### 2. 데이터베이스 연결 정보

Supabase Dashboard > Settings > Database에서:

- **Host**: `db.your-project-id.supabase.co`
- **Database Name**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: [프로젝트 생성 시 설정한 비밀번호]

## 🔧 환경 변수 업데이트

### 1. 모바일 앱 환경 변수

**파일**: `apps/mobile/.env`

```env
# Supabase 설정
EXPO_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key

# API 설정  
EXPO_PUBLIC_API_URL=https://your-new-backend-url.com/api

# 카카오 OAuth (기존과 동일)
EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key
EXPO_PUBLIC_KAKAO_REST_API_KEY=your-kakao-rest-api-key

# 딥링크 (기존과 동일)
EXPO_PUBLIC_SCHEME=daon
```

### 2. 백엔드 환경 변수

**파일**: `apps/backend/.env`

```env
# Supabase 설정
SUPABASE_URL=https://your-new-project-id.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key

# 데이터베이스 연결
DATABASE_URL=postgresql://postgres:your-password@db.your-new-project-id.supabase.co:5432/postgres

# JWT 설정 (Supabase JWT Secret 사용)
JWT_SECRET=your-supabase-jwt-secret

# 카카오 OAuth (기존과 동일)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_REDIRECT_URI=https://your-backend-url.com/api/auth/kakao/callback

# 서버 설정
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# 파일 업로드 (Supabase Storage)
STORAGE_BUCKET=uploads
MAX_FILE_SIZE=10485760
```

### 3. 개발 환경별 설정

**개발 환경** (`apps/mobile/.env.development`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**스테이징 환경** (`apps/mobile/.env.staging`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
EXPO_PUBLIC_API_URL=https://your-staging-backend.com/api
```

## 📱 모바일 앱 설정 업데이트

### 1. Supabase 클라이언트 설정

**파일**: `apps/mobile/shared/lib/supabase.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### 2. API 클라이언트 업데이트

**파일**: `apps/mobile/shared/api/client.ts`

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🖥️ 백엔드 설정 업데이트

### 1. Supabase 클라이언트 설정

**파일**: `apps/backend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### 2. 데이터베이스 연결 업데이트

**파일**: `apps/backend/src/lib/database.ts`

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export { pool }
```

## 🗄️ Storage 설정

### 1. Storage 버킷 생성

Supabase Dashboard > Storage에서 다음 버킷들을 생성:

- **uploads**: 일반 파일 업로드
- **avatars**: 사용자 아바타
- **children-photos**: 아이 사진
- **diary-media**: 일기 사진/동영상

### 2. Storage 정책 설정

각 버킷에 대한 RLS 정책 설정:

```sql
-- uploads 버킷 정책
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🚀 배포 설정 업데이트

### 1. Vercel/Netlify 환경 변수

배포 플랫폼에서 환경 변수 업데이트:

```bash
# Vercel CLI 예시
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 2. EAS Build 설정

**파일**: `apps/mobile/eas.json`

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-dev-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-dev-anon-key"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-prod-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-prod-anon-key"
      }
    }
  }
}
```

## ✅ 설정 검증

### 1. 연결 테스트

```typescript
// Supabase 연결 테스트
const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
console.log('Supabase connection:', error ? 'Failed' : 'Success');

// API 연결 테스트
const response = await fetch(`${API_BASE_URL}/health`);
console.log('API connection:', response.ok ? 'Success' : 'Failed');
```

### 2. 환경 변수 검증

```typescript
// 필수 환경 변수 체크
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_API_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});
```

## 🔄 마이그레이션 체크리스트

- [ ] 새 Supabase 프로젝트 정보 수집
- [ ] 모바일 앱 환경 변수 업데이트
- [ ] 백엔드 환경 변수 업데이트
- [ ] Supabase 클라이언트 설정 확인
- [ ] Storage 버킷 및 정책 설정
- [ ] 배포 플랫폼 환경 변수 업데이트
- [ ] 연결 테스트 실행
- [ ] 기능별 동작 확인
- [ ] 데이터 동기화 확인

## 🚨 주의사항

1. **환경 변수 보안**: 민감한 정보는 안전한 방법으로 관리
2. **점진적 마이그레이션**: 단계별로 진행하며 각 단계별 테스트
3. **백업**: 기존 설정을 백업하여 롤백 가능하도록 준비
4. **DNS 설정**: 도메인 사용 시 DNS 레코드 업데이트 필요
5. **캐시 무효화**: CDN이나 캐시 서비스 사용 시 무효화 실행