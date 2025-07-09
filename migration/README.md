# Supabase 마이그레이션 가이드

## 📋 개요

다온(Daon) 프로젝트의 Supabase 데이터베이스를 새로운 계정으로 마이그레이션하는 단계별 가이드입니다.

## 🗄️ 현재 데이터베이스 구조

### 테이블 목록
- **users**: 사용자 정보 (OAuth 지원)
- **children**: 아이 프로필 정보
- **child_guardians**: 아이-보호자 관계 테이블
- **activities**: 활동 기록 (수유, 기저귀, 수면 등)
- **diary_entries**: 일기 엔트리
- **milestones**: 마일스톤 기록
- **growth_records**: 성장 기록
- **oauth_states**: OAuth 상태 관리

### 설치된 확장 기능
- **uuid-ossp**: UUID 생성
- **pgcrypto**: 암호화 기능
- **pg_stat_statements**: 쿼리 통계
- **pg_graphql**: GraphQL 지원
- **supabase_vault**: Vault 확장

## 🚀 마이그레이션 단계

### 1단계: 새 Supabase 프로젝트 설정
### 2단계: 확장 기능 설치
### 3단계: 스키마 생성
### 4단계: RLS 정책 설정
### 5단계: 데이터 마이그레이션 (선택사항)
### 6단계: 환경 변수 업데이트

각 단계별 상세 가이드는 개별 파일에서 확인하세요.