# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

다온(Daon) is a Korean parenting app for recording children's activities, growth, and development. It's a pnpm monorepo with:
- **New Expo mobile app** (`apps/mobile`) - Currently in development
- **Legacy React Native app** (`packages/mobile`) - Previous FSD implementation
- **Node.js backend** (`apps/backend`) 
- **Shared TypeScript libraries** (`packages/shared`)

## Essential Development Commands

### Monorepo Commands (from root)
```bash
# Install dependencies
pnpm install

# Start all development services
pnpm dev

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

### Mobile App Commands

#### New Expo App (from apps/mobile)
```bash
# Start Expo development server
pnpm start

# Run on specific platforms
pnpm android            # Android
pnpm ios               # iOS
pnpm web               # Web browser

# EAS Build commands
pnpm build:development  # Development build
pnpm build:preview     # Preview build for testing
pnpm build:production  # Production build
pnpm update           # Deploy OTA update
pnpm submit:ios       # Submit to App Store
pnpm submit:android   # Submit to Google Play
```

#### Legacy React Native App (from packages/mobile)
```bash
# Start Metro bundler
pnpm dev

# Run on platforms
pnpm ios               # iOS simulator
pnpm android          # Android emulator
pnpm pod-install      # Install iOS dependencies
```

### Backend Commands (from apps/backend)
```bash
# Start development server
pnpm dev

# Generate Supabase types
pnpm db:types

# Database management
pnpm db:push            # Push schema changes
pnpm db:pull            # Pull schema changes
pnpm supabase:start     # Start local Supabase
pnpm supabase:reset     # Reset local database
```

### Shared Package Commands (from packages/shared)
```bash
# Build shared types and utilities
pnpm build

# Watch mode for development
pnpm dev
```

## Architecture & Code Organization

### Monorepo Structure
- **apps/mobile**: New Expo app with Expo Router (현재 개발 중)
- **apps/backend**: Node.js Express API server
- **packages/mobile**: Legacy React Native app with FSD architecture (레거시)
- **packages/shared**: Zod schemas and shared TypeScript types
- Uses **pnpm workspaces** with **Turborepo** for build orchestration

### Mobile App Architectures

#### New Expo App (apps/mobile)
Uses **Expo Router v5** with file-based routing:
- `app/(tabs)/` - Tab-based navigation screens
- `components/` - Reusable UI components
- `constants/` - App constants and themes
- `hooks/` - Custom React hooks
- Expo SDK 53 with React Native New Architecture enabled

#### Legacy React Native App (packages/mobile)
Follows **Feature-Sliced Design (FSD)** with these layers:

**App Layer** (`src/app/`): Navigation configuration and app-level setup
- Main navigation with authentication context
- Onboarding flow navigation

**Pages Layer** (`src/pages/`): Screen components organized by domain
- `auth/`: Sign in/up screens
- `children/`: Child management screens
- `home/`: Dashboard screen
- `record/`: Activity recording screens
- `diary/`: Diary writing and viewing
- `growth/`: Growth tracking screens
- `settings/`: App settings

**Widgets Layer** (`src/widgets/`): Complex UI compositions
- `ChildSelector/`: Child selection component
- `create-child/`: Child registration widgets
- `home/`: Home dashboard widgets (QuickActions, RecentActivities, TodaySummary)
- `quick-record/`: Quick activity recording widget

**Features Layer** (`src/features/`): Business logic features
- Currently only `auth/` is implemented with SignInForm/SignUpForm
- Other directories (record-activity, track-growth, write-diary) need implementation

**Entities Layer** (`src/entities/`): Domain models and business logic
- Currently empty - needs implementation for activity, child, diary-entry, growth-record

**Shared Layer** (`src/shared/`): Reusable resources
- `api/`: HTTP client, API hooks, TanStack Query configuration
- `ui/`: Design system components (Button, Card, Input, etc.)
- `store/`: Zustand stores for global state
- `hooks/`: Shared React hooks
- `lib/`: Utilities and helper functions
- `types/`: TypeScript type definitions

### Key Technical Patterns

**Server State Management**: TanStack Query for caching, synchronization, and API state
- Query hooks in `shared/api/hooks/`
- Centralized query key management in `shared/constants/`
- Automatic cache invalidation after mutations

**HTTP Client**: Axios with interceptors for authentication
- Base client in `shared/api/client.ts`
- Automatic token injection and refresh
- Request/response error handling

**Type Safety**: Zod-first approach
- Define Zod schemas in `packages/shared`
- Infer TypeScript types using `z.infer<>`
- Runtime validation for API responses and form data

**Form Handling**: react-hook-form + Zod validation
- Form components in appropriate FSD layers
- Zod resolvers for validation

**Authentication**: JWT-based with Supabase Auth
- Authentication context in app layer
- Token management with automatic refresh
- Protected route handling

**UI Components**: Custom design system with theming
- Theme configuration in `shared/config/`
- Reusable components in `shared/ui/`
- Consistent styling patterns

## Development Guidelines

### Code Style
- Use **double quotes** for strings
- Follow existing **TypeScript strict** configuration
- Use **pnpm** for package management

### Type Definitions
- Always define **Zod schemas first** in `packages/shared`
- Use `z.infer<>` to derive TypeScript types
- Never use `any` or type assertions (`as`)

### API Integration
- Create API hooks in `shared/api/hooks/`
- Use TanStack Query for all server state
- Follow established patterns for mutations and cache invalidation

### Component Development
- Follow FSD layer rules: higher layers can import from lower layers only
- Place components in appropriate FSD layers based on their scope
- Use design system components from `shared/ui/`

### Database
- **Supabase** is the primary database (PostgreSQL + real-time features)
- Use `pnpm db:types` to regenerate types after schema changes
- Test with local Supabase instance using `pnpm supabase:start`

### Mobile Deployment
- **New Expo App**: Use **EAS (Expo Application Services)** for building and deployment
- **EAS Build** profiles: development, preview, production
- **OTA updates** available for JavaScript-only changes
- **Web support** via Metro bundler for cross-platform development
- **Legacy App**: Requires manual build process with React Native CLI

### Documentation
- Update **README.md** and **PROJECT_SPEC.md** after completing work
- Reference relevant documentation for complex features

## Common Issues & Solutions

### Monorepo Setup
- Project uses `node-linker=hoisted` in `.pnpmrc` for React Native compatibility
- Run `pnpm install` from root to ensure proper workspace linking

### Metro Bundler
- Metro is configured for monorepo with workspace root watching
- Clear Metro cache if experiencing module resolution issues

### EAS Build Issues
- `gradle-wrapper.jar` is git-tracked (excluded from `.gitignore` blanket `*.jar` rule)
- Gradle version is locked to 7.4 for EAS compatibility
- Use `--clear-cache` flag if builds fail unexpectedly

### Type Checking
- Run `pnpm type-check` before committing
- Shared package must be built before mobile/backend can type-check successfully