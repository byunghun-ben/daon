# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

다온(Daon) is a Korean parenting app for recording children's activities, growth, and development. It's a pnpm monorepo with:
- **Expo mobile app** (`apps/mobile`) - Main mobile application with Expo Router
- **Node.js backend** (`apps/backend`) - Express.js API server with Supabase
- **Shared TypeScript libraries** (`packages/shared`) - Zod schemas and shared types

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

### Mobile App Commands (from apps/mobile)
```bash
# Start Expo development server
pnpm start

# Run on specific platforms
pnpm android            # Android
pnpm ios               # iOS
pnpm web               # Web browser

# Build and deployment commands
pnpm prebuild          # Generate native code
pnpm build:development  # Development build
pnpm build:preview     # Preview build for testing
pnpm build:production  # Production build
pnpm build:all         # Build for all platforms
pnpm update           # Deploy OTA update
pnpm submit:ios       # Submit to App Store
pnpm submit:android   # Submit to Google Play
```

### Backend Commands (from apps/backend)
```bash
# Start development server with hot reload
pnpm dev

# Build and production
pnpm build             # Compile TypeScript
pnpm start             # Run production build

# Database and Supabase management
pnpm db:types          # Generate TypeScript types from Supabase schema
pnpm db:push           # Push schema changes
pnpm db:pull           # Pull schema changes
pnpm db:diff           # Show schema differences
pnpm supabase:start    # Start local Supabase instance
pnpm supabase:stop     # Stop local Supabase
pnpm supabase:reset    # Reset local database
pnpm supabase:seed     # Seed database with sample data
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
- **apps/mobile**: Expo app with Expo Router v5 and FSD-inspired architecture
- **apps/backend**: Node.js Express API server with Supabase integration
- **packages/shared**: Zod schemas and shared TypeScript types
- Uses **pnpm workspaces** with **Turborepo** for build orchestration

### Mobile App Architecture (apps/mobile)

The mobile app uses **Expo Router v5** with file-based routing combined with **Feature-Sliced Design (FSD)** principles:

**File-based Routing** (`app/`):
- `app/(tabs)/` - Main tab navigation (index, record, diary, growth, settings)
- `app/(auth)/` - Authentication screens (sign-in, sign-up)
- `app/(onboarding)/` - Onboarding flow (child-setup, permissions)
- `app/children/` - Child management screens
- `app/record/` - Activity recording screens
- Other feature-specific routes

**FSD-Inspired Organization**:
- **Features** (`features/`): Business logic components (auth forms, etc.)
- **Widgets** (`widgets/`): Complex UI compositions (ChildSelector, QuickActions, etc.)
- **Entities** (`entities/`): Domain models (activity, child, diary-entry, growth-record)
- **Shared** (`shared/`): Reusable resources

**Shared Resources** (`shared/`):
- `api/`: HTTP client, API hooks, TanStack Query configuration
- `ui/`: Design system components (Button, Card, Input, etc.)
- `store/`: Zustand stores for global state management
- `hooks/`: Custom React hooks
- `lib/`: Utilities, permissions, storage, sync managers
- `types/`: TypeScript type definitions and form schemas
- `config/`: Theme and app configuration
- `constants/`: App constants and query keys

### Key Technical Patterns

**Server State Management**: TanStack Query for caching, synchronization, and API state
- Query hooks in `shared/api/hooks/`
- Centralized query key management in `shared/constants/`
- Automatic cache invalidation after mutations

**HTTP Client**: Axios with interceptors for authentication
- Base client in `apps/mobile/shared/api/client.ts`
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
- Authentication context and protected routing with Expo Router
- Token management with automatic refresh
- Onboarding flow for new users

**UI Components**: Custom design system with theming
- Theme configuration in `apps/mobile/shared/config/`
- Reusable components in `apps/mobile/shared/ui/`
- Consistent styling patterns with React Native StyleSheet

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
- Create API hooks in `apps/mobile/shared/api/hooks/`
- Use TanStack Query for all server state
- Follow established patterns for mutations and cache invalidation
- API services organized by domain (activities, auth, children, etc.)

### Component Development
- Follow FSD layer rules: higher layers can import from lower layers only
- Place components in appropriate layers (features, widgets, shared/ui)
- Use design system components from `apps/mobile/shared/ui/`
- Leverage Expo Router for navigation and file-based routing

### Database
- **Supabase** is the primary database (PostgreSQL + real-time features)
- Use `pnpm db:types` to regenerate types after schema changes
- Test with local Supabase instance using `pnpm supabase:start`

### Mobile Deployment
- Use **EAS (Expo Application Services)** for building and deployment
- **EAS Build** profiles: development, preview, production, all platforms
- **OTA updates** available for JavaScript-only changes
- **Web support** via Metro bundler for cross-platform development
- **Prebuild** workflow for customizing native code when needed

### Documentation
- Update **README.md** and **PROJECT_SPEC.md** after completing work
- Reference relevant documentation for complex features

## Common Issues & Solutions

### Monorepo Setup
- Project uses `node-linker=hoisted` in `.pnpmrc` for React Native compatibility
- Run `pnpm install` from root to ensure proper workspace linking
- Turborepo orchestrates builds with proper dependency management

### Metro Bundler and Expo
- Metro is configured for monorepo with workspace root watching
- Clear Metro cache with `expo start --clear` if experiencing module resolution issues
- Web support available for cross-platform development and testing

### EAS Build Issues
- `gradle-wrapper.jar` is git-tracked (excluded from `.gitignore` blanket `*.jar` rule)
- Gradle version is locked for EAS compatibility
- Use `--clear-cache` flag if builds fail unexpectedly
- Prebuild generates native code when needed

### Type Checking
- Run `pnpm type-check` before committing
- Shared package must be built before mobile/backend can type-check successfully
- Use `pnpm build` in packages/shared after schema changes