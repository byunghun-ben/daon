# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

다온(Daon) is a Korean parenting app for recording children's activities, growth, and development. It's a pnpm monorepo with:

- **Expo mobile app** (`apps/mobile`) - Main mobile application with Expo Router v5
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

- `app/(tabs)/` - Main tab navigation
  - `index.tsx` - Home dashboard with real-time activity summary
  - `record.tsx` - Activity recording hub with quick actions
  - `diary.tsx` - Diary entries list with photo previews
  - `growth.tsx` - Growth charts with metric tabs
  - `settings.tsx` - Settings with profile and app info
- `app/(auth)/` - Authentication screens (sign-in, sign-up)
- `app/(onboarding)/` - Onboarding flow with welcome page and child setup
- `app/children/` - Child management screens
- `app/activities/[id].tsx` - Activity detail view with edit/delete
- `app/diary/[id].tsx` - Diary detail view with photo galleries
- `app/growth/[id].tsx` - Growth record detail view
- `app/record/` - Activity recording forms (feeding, diaper, sleep, tummy-time)

**FSD-Inspired Organization**:

- **Features** (`features/`): Business logic components
  - `auth/` - Authentication forms and flows
  - `activities/` - Activity recording forms (CreateActivityForm, etc.)
  - `diary/` - Diary creation forms with image upload
  - `growth/` - Growth record forms
  - `children/` - Child management forms (CreateChildForm, JoinChildForm)
- **Widgets** (`widgets/`): Complex UI compositions (ChildSelector, QuickActions, etc.)
- **Entities** (`entities/`): Domain models
  - `activity/ActivityCard.tsx` - Activity display component
  - `child/ChildCard.tsx` - Child profile component
  - `diary-entry/DiaryEntryCard.tsx` - Diary entry component
  - `growth-record/GrowthRecordCard.tsx` - Growth record component
- **Shared** (`shared/`): Reusable resources

**Shared Resources** (`shared/`):

- `api/`: HTTP client, API hooks, TanStack Query configuration
  - `client.ts` - Axios client with auth interceptors
  - `hooks/` - TanStack Query hooks by domain
  - `activities/`, `diary/`, `growth/`, `children/` - Domain-specific API hooks
- `ui/`: Design system components
  - `Button.tsx`, `Input.tsx`, `Card.tsx`, `ImageUploader.tsx`
  - All styled with theme system
- `store/`: Zustand stores for global state management
- `hooks/`: Custom React hooks
  - `useActiveChild.tsx` - Child selection management
  - `useTheme.tsx` - Theme utilities
- `lib/`: Utilities, permissions, storage, sync managers
  - `imagePicker.ts` - Camera/gallery image picker
  - `permissions.ts` - Device permissions management
- `types/`: TypeScript type definitions and form schemas
- `config/`: Theme and app configuration
  - `theme.ts` - Complete design system (colors, typography, spacing)
- `constants/`: App constants and query keys

### Key Technical Patterns

**Server State Management**: TanStack Query for caching, synchronization, and API state

- Query hooks in `shared/api/hooks/` organized by domain
- Centralized query key management in `shared/constants/`
- Automatic cache invalidation after mutations
- Optimistic updates for better UX
- Pull-to-refresh and real-time synchronization

**HTTP Client**: Axios with interceptors for authentication

- Base client in `apps/mobile/shared/api/client.ts`
- Automatic JWT token injection and refresh
- Request/response error handling
- Interceptors for authentication state management

**Type Safety**: Zod-first approach with 100% type safety

- Define Zod schemas in `packages/shared/src/schemas/`
- Infer TypeScript types using `z.infer<>`
- Runtime validation for API responses and form data
- No `any` types or type assertions used

**Form Handling**: react-hook-form + Zod validation

- Form components in appropriate FSD layers
- Zod resolvers for validation
- Generic form handling with proper typing

**Authentication**: JWT-based with Supabase Auth + Social Login

- Kakao OAuth integration
- Email/password authentication
- Authentication context and protected routing with Expo Router
- Token management with automatic refresh
- Complete onboarding flow for new users

**UI Components**: Custom design system with comprehensive theming

- Theme configuration in `apps/mobile/shared/config/theme.ts`
- Reusable components in `apps/mobile/shared/ui/`
- Consistent styling patterns with React Native StyleSheet
- Typography system with h1, h2, h3, body1, body2, caption
- Color palette with semantic naming
- Spacing and border radius system

**Image Handling**: Complete photo/video upload system

- `ImageUploader` component with camera/gallery selection
- Permission handling for camera and media library
- Multiple image selection support
- Proper error handling and user feedback

## Current Implementation Status

### ✅ Completed Features

**Core Functionality (100% Complete)**
- ✅ Activity tracking (feeding, diaper, sleep, tummy time, custom)
- ✅ Diary entries with photos and milestones
- ✅ Growth records (weight, height, head circumference)
- ✅ Child management with multiple guardians
- ✅ Complete authentication system

**Technical Implementation (100% Complete)**
- ✅ Full CRUD operations for all entities
- ✅ Real-time data synchronization with TanStack Query
- ✅ Image upload and gallery functionality
- ✅ Form validation with Zod schemas
- ✅ Error handling and user feedback
- ✅ Navigation with Expo Router v5
- ✅ Type-safe API integration
- ✅ Custom design system implementation

**User Experience (100% Complete)**
- ✅ Onboarding flow with welcome page
- ✅ Two-way child registration (create new / join existing)
- ✅ Real-time home dashboard
- ✅ Pull-to-refresh functionality
- ✅ Detailed view screens for all entities
- ✅ Edit/delete functionality
- ✅ Photo galleries in diary entries

**Data Management (100% Complete)**
- ✅ Caching and offline-first approach
- ✅ Optimistic updates
- ✅ Automatic cache invalidation
- ✅ Real-time UI updates
- ✅ Data consistency across screens

## Development Guidelines

### Code Style

- Use **double quotes** for strings
- Follow existing **TypeScript strict** configuration
- Use **pnpm** for package management
- No `any` types or type assertions allowed
- Consistent component naming and file organization

### Type Definitions

- Always define **Zod schemas first** in `packages/shared/src/schemas/`
- Use `z.infer<>` to derive TypeScript types
- Never use `any` or type assertions (`as`)
- All API responses must have corresponding Zod schemas

### API Integration

- Create API hooks in `apps/mobile/shared/api/hooks/` organized by domain
- Use TanStack Query for all server state management
- Follow established patterns for mutations and cache invalidation
- API services organized by domain (activities, auth, children, diary, growth)
- Always handle loading, error, and success states

### Component Development

- Follow FSD layer rules: higher layers can import from lower layers only
- Place components in appropriate layers (features, widgets, shared/ui)
- Use design system components from `apps/mobile/shared/ui/`
- Leverage Expo Router for navigation and file-based routing
- Use proper TypeScript types for all props and state

### Form Implementation

- Use react-hook-form with Zod resolvers
- Define form schemas in `packages/shared`
- Handle form submission with proper error handling
- Use `form.handleSubmit()` pattern for type safety

### Database Integration

- **Supabase** is the primary database (PostgreSQL + real-time features)
- Use `pnpm db:types` to regenerate types after schema changes
- Test with local Supabase instance using `pnpm supabase:start`
- All database schemas defined in Supabase migrations

### Mobile Deployment

- Use **EAS (Expo Application Services)** for building and deployment
- **EAS Build** profiles: development, preview, production, all platforms
- **OTA updates** available for JavaScript-only changes
- **Web support** via Metro bundler for cross-platform development
- **Prebuild** workflow for customizing native code when needed

### Testing & Quality Assurance

- Run `pnpm type-check` before committing (all packages must pass)
- Run `pnpm lint` to ensure code quality
- Build system verified with `pnpm build`
- All TypeScript errors must be resolved before deployment

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
- All type errors must be resolved - the project maintains 100% type safety

### API Data Handling

- API hooks return wrapped objects (e.g., `{ activity }`, `{ diaryEntry }`)
- Always destructure API responses properly:
  ```typescript
  const { data: activityData } = useActivity(id);
  const activity = activityData?.activity;
  ```
- Use proper error boundaries and loading states

### Form Type Safety

- Remove explicit generic types from useForm calls:
  ```typescript
  // ❌ Wrong
  const form = useForm<CreateDiaryEntryRequest>({
  
  // ✅ Correct
  const form = useForm({
    resolver: zodResolver(CreateDiaryEntryRequestSchema),
  ```
- Use `form.handleSubmit()` pattern for proper type inference

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the gemini command:

### Examples

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```

**Multiple files:**
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```

**Entire directory:**
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```

**Multiple directories:**
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```

**Current directory and subdirectories:**
```bash
gemini -p "@./ Give me an overview of this entire project"
# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"
```

### Implementation Verification Examples

**Check if a feature is implemented:**
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```

**Verify authentication implementation:**
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```

**Check for specific patterns:**
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```

**Verify error handling:**
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```

**Check for rate limiting:**
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```

**Verify caching strategy:**
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```

**Check for specific security measures:**
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```

**Verify test coverage for features:**
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```

## When to Use Gemini CLI

Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

## Important Notes

- Paths in `@` syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for `--yolo` flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

# Important Instructions

## Current Status
The Daon app is **100% complete** with all core features implemented and working:
- All CRUD operations for activities, diary, growth records, and children
- Complete UI/UX with proper navigation and user feedback
- Full type safety with Zod schemas and TypeScript
- Real-time data synchronization with TanStack Query
- Authentication with Supabase Auth and Kakao OAuth
- Image upload and gallery functionality
- Comprehensive error handling and loading states

## Quality Standards
- **No `any` types**: The codebase maintains 100% type safety
- **No type assertions**: All types are properly inferred
- **Zod-first approach**: All data validation through Zod schemas
- **Error handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized with caching, memoization, and proper state management

## Development Rules
1. Always run `pnpm type-check` before considering work complete
2. Follow FSD architecture principles strictly
3. Use established patterns for new features
4. Maintain design system consistency
5. Test all user flows before marking features complete

When working on this codebase, prioritize maintaining the high quality standards and comprehensive feature set that has already been established.