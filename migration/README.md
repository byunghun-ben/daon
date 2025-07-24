# 다온(Daon) 앱 데이터베이스 마이그레이션 가이드

## 📊 프로젝트 현황

**다온 앱은 100% 완성된 상태**입니다. 이 마이그레이션 파일들은 새로운 Supabase 환경이나 프로덕션 배포 시 완전한 데이터베이스 스키마를 구성하기 위해 제작되었습니다.

### 🆕 2025년 7월 업데이트

이 마이그레이션은 현재 완성된 다온 앱의 **모든 기능**을 반영하여 대폭 업데이트되었습니다:

#### 새로 추가된 주요 기능들
- **FCM 푸시 알림 시스템** (7개 카테고리, 방해금지시간)
- **구독 및 수익화 시스템** (무료/프리미엄/패밀리 플랜)
- **AI 채팅 서비스** (OpenAI, Anthropic, Azure 통합)
- **고급 분석 및 인사이트** (패턴 분석, 머티리얼라이즈드 뷰)
- **다국어 지원** (한국어, 영어, 일본어)

## 🗂 마이그레이션 파일 구조

### 기본 인프라 (1-8단계)
1. **01-extensions.sql** - PostgreSQL 확장 기능 설치
2. **02-schema.sql** - 기본 테이블 스키마 (기존)
3. **03-rls-policies.sql** - Row Level Security 정책 (기존)
4. **04-functions-triggers.sql** - 함수 및 트리거 (기존)
5. **05-data-export.sql** - 데이터 내보내기 스크립트
6. **06-data-import.sql** - 데이터 가져오기 스크립트
7. **07-environment-config.md** - 환경별 설정 가이드
8. **08-verification-tests.sql** - 검증 테스트 스크립트

### 새로 추가된 고급 기능 (9-13단계) ✨ NEW
9. **09-push-notifications.sql** - FCM 푸시 알림 시스템
10. **10-subscriptions.sql** - 구독 및 수익화 시스템
11. **11-ai-chat.sql** - AI 채팅 서비스
12. **12-analytics-optimization.sql** - 분석 최적화 및 성능 개선
13. **13-new-tables-rls.sql** - 새 테이블들의 RLS 정책

## 🚀 실행 순서

### 신규 Supabase 프로젝트 구성 시

```bash
# 1단계: 기본 인프라 구성
psql -f 01-extensions.sql
psql -f 02-schema.sql
psql -f 03-rls-policies.sql
psql -f 04-functions-triggers.sql

# 2단계: 새로운 고급 기능 (순서대로 실행 필수)
psql -f 09-push-notifications.sql
psql -f 10-subscriptions.sql
psql -f 11-ai-chat.sql
psql -f 12-analytics-optimization.sql
psql -f 13-new-tables-rls.sql

# 3단계: 검증 및 최적화
psql -f 08-verification-tests.sql
```

### 기존 환경 업그레이드 시

```bash
# 기존 환경에 새 기능만 추가
psql -f 09-push-notifications.sql
psql -f 10-subscriptions.sql
psql -f 11-ai-chat.sql
psql -f 12-analytics-optimization.sql
psql -f 13-new-tables-rls.sql
```

## 📋 데이터베이스 스키마 개요

### 핵심 테이블 (기존)
- **users** - 사용자 정보 (Supabase Auth 연동)
- **children** - 아이 프로필 (이름, 생년월일, 성별 등)
- **child_guardians** - 보호자 관계 (초대 코드 기반)
- **activities** - 활동 기록 (수유, 기저귀, 수면, 배밀이)
- **diary_entries** - 일기 작성 (사진, 동영상 포함)
- **milestones** - 마일스톤 기록 (첫 미소, 첫 걸음마 등)
- **growth_records** - 성장 기록 (키, 몸무게, 머리둘레)
- **oauth_states** - OAuth 인증 상태 관리

### 새로 추가된 테이블들 ✨

#### 푸시 알림 시스템
- **fcm_tokens** - FCM 디바이스 토큰 관리
- **notification_settings** - 사용자별 알림 설정 (7개 카테고리)
- **notification_history** - 알림 발송 이력 추적
- **scheduled_notifications** - 예약 알림 관리

#### 구독 및 수익화
- **subscription_plans** - 구독 플랜 정의 (무료/프리미엄/패밀리)
- **user_subscriptions** - 사용자별 구독 상태
- **subscription_usage** - 리소스 사용량 추적
- **premium_features** - 프리미엄 기능 정의
- **subscription_history** - 구독 변경 이력

#### AI 채팅 서비스
- **chat_conversations** - AI 채팅 대화 내용
- **chat_usage** - AI 채팅 사용량 및 비용 추적
- **ai_models** - 지원하는 AI 모델 정보
- **chat_templates** - 육아 상담용 템플릿

#### 분석 및 성능 최적화
- **analytics_cache** - 분석 결과 캐싱
- **mv_daily_feeding_patterns** - 일일 수유 패턴 (머티리얼라이즈드 뷰)
- **mv_daily_sleep_patterns** - 일일 수면 패턴 (머티리얼라이즈드 뷰)
- **mv_weekly_growth_trends** - 주간 성장 추이 (머티리얼라이즈드 뷰)
- **mv_monthly_activity_summary** - 월간 활동 요약 (머티리얼라이즈드 뷰)

## 🔐 보안 정책 (RLS)

모든 테이블에 Row Level Security가 적용되어 있습니다:

### 기본 원칙
- **사용자 데이터**: 본인만 접근 가능
- **아이 데이터**: 소유자 + 승인된 보호자만 접근
- **구독 데이터**: 본인 구독 정보만 조회 가능
- **AI 채팅**: 본인 대화 내용만 접근 가능
- **알림 데이터**: 본인 알림 설정/이력만 관리 가능

### 특별 정책
- **구독 플랜**: 모든 사용자가 활성 플랜 조회 가능
- **AI 모델/템플릿**: 모든 사용자가 활성 항목 조회 가능
- **알림 이력**: 시스템이 삽입, 사용자는 조회만 가능

## ⚡ 성능 최적화

### 인덱스 전략
- **복합 인덱스**: child_id + type + timestamp 조합
- **GIN 인덱스**: JSONB 컬럼 (activities.data) 검색 최적화
- **부분 인덱스**: 활성 상태 필터링 최적화

### 머티리얼라이즈드 뷰
- **일일 패턴 분석**: 수유/수면 패턴 사전 계산
- **성장 추이**: 주간 성장률 변화 추적
- **활동 요약**: 월간 활동 통계 집계

### 캐싱 전략
- **분석 결과**: 복잡한 분석 결과를 analytics_cache에 저장
- **만료 관리**: 자동 캐시 정리 함수 제공
- **새로고침**: 일일 자동 뷰 새로고침 권장

## 🔧 유지보수

### 정기 작업
```sql
-- 매일 실행 권장
SELECT refresh_analytics_views(); -- 분석 뷰 새로고침
SELECT cleanup_expired_cache();  -- 만료된 캐시 정리

-- 주간 실행 권장
DELETE FROM public.oauth_states WHERE expires_at < now() - interval '1 week';
DELETE FROM public.notification_history WHERE created_at < now() - interval '3 months';
```

### 모니터링
```sql
-- 데이터베이스 크기 확인
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(tablename::text) DESC;

-- 활성 사용자 수 확인
SELECT COUNT(*) as active_users FROM public.users WHERE created_at > now() - interval '30 days';

-- 구독 현황 확인
SELECT plan_id, status, COUNT(*) as count 
FROM public.user_subscriptions 
GROUP BY plan_id, status;
```

## 🌟 주요 기능별 가이드

### FCM 푸시 알림
```sql
-- 사용자에게 즉시 알림 발송
SELECT send_notification(
  user_id := 'uuid',
  category := 'feeding',
  title := '수유 시간입니다',
  body := '마지막 수유 후 3시간이 지났습니다.'
);
```

### 구독 사용량 체크
```sql
-- 사용자가 특정 리소스를 사용할 수 있는지 확인
SELECT check_usage_limit('user_uuid', 'ai_chat', 1);
```

### AI 채팅 사용량 업데이트
```sql
-- AI 채팅 사용 후 토큰 사용량 기록
SELECT update_chat_usage(
  'user_uuid', 'conversation_uuid', 'openai', 'gpt-4o', 1000, 500
);
```

### 분석 데이터 조회
```sql
-- 수유 패턴 분석
SELECT analyze_feeding_patterns('child_uuid', '2025-06-01', '2025-06-30');

-- 수면 패턴 분석
SELECT analyze_sleep_patterns('child_uuid', '2025-06-01', '2025-06-30');
```

## 📞 문의 및 지원

이 마이그레이션은 **100% 완성된 다온 앱**의 프로덕션 환경 구축을 위해 제작되었습니다. 
모든 기능이 검증되었으며, 실제 서비스에서 사용 중인 스키마를 기반으로 합니다.

### 버전 정보
- **앱 버전**: v1.0.0 (100% 완성)
- **마이그레이션 버전**: v2.0.0 (2025년 7월 대폭 업데이트)
- **지원 기능**: 모든 Phase 1-9 기능 포함
- **데이터베이스**: PostgreSQL 15+ (Supabase 호환)

---

**다온(Daon)** - 완성된 종합 육아 기록 앱 🍼👶📱