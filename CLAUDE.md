# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESRC Cameroon is a full-stack bilingual (EN/FR) learning and entrepreneurship platform. Two separate codebases live in this monorepo:

- **Frontend**: `ESRC_Cameroon_frontend/` — Next.js 16 (App Router), React 19, shadcn/ui, Tailwind CSS 4, next-intl
- **Backend**: `esrc-backend/` — NestJS 10, Prisma 5, PostgreSQL, Redis, Socket.IO, BullMQ

## Commands

### Frontend (`ESRC_Cameroon_frontend/`)

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on localhost:3000 (uses --webpack flag)
pnpm build            # Production build
pnpm lint             # ESLint
```

### Backend (`esrc-backend/`)

```bash
npm install           # Install dependencies
npm run start:dev     # Dev server on localhost:4000 (watch mode)
npm run start:debug   # Dev server with debugger attached
npm run build         # TypeScript compile (tsc)
npm run start:prod    # Run compiled JS from dist/
npm run lint          # ESLint + Prettier (auto-fix)
npm run test          # Jest unit tests
npm run test:watch    # Jest watch mode
npm run test:cov      # Jest with coverage
npm run test:e2e      # Integration tests (jest-e2e config)
npx jest path/to/file.spec.ts  # Run a single test file
```

### Database (from `esrc-backend/`)

```bash
npm run prisma:migrate   # Create and apply migration (prisma migrate dev)
npm run prisma:deploy    # Apply migrations in production
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:studio    # Visual DB browser on localhost:5555
npm run prisma:seed      # Seed database (ts-node prisma/seed.ts)
npx prisma validate      # Validate schema syntax
```

### Docker (from `esrc-backend/`)

```bash
docker-compose up -d     # Start PostgreSQL, Redis, Meilisearch
docker-compose down      # Stop containers
docker-compose down -v   # Stop + remove volumes (resets DB)
```

## Architecture

### Key Principle
**Component -> `/app/api/[route]` -> NestJS Backend.** Never call external services directly from components. Frontend API routes act as a stateless proxy to NestJS. This enables frontend refactoring without backend changes. Some routes (e.g., courses) have a Supabase fallback when NestJS is unavailable — this is legacy and should not be expanded.

### Request Flow

```
React Component
  → apiClient (lib/api-client.ts, auto-injects Bearer token)
  → Next.js API route (app/api/[route]/route.ts)
  → proxyToNest() (lib/nest-proxy.ts, forwards auth headers)
  → NestJS at {NESTJS_URL}/api/v1/{path}
```

The backend uses a global prefix (`/api`) and URI versioning (`/v1`), so all backend endpoints are at `/api/v1/...`. The `nest-proxy.ts` utility appends `/api/v1` automatically.

### Frontend Structure (`ESRC_Cameroon_frontend/`)
- `app/[locale]/` — i18n-aware pages with route groups: `(public)`, `(auth)`, `(dashboard)`, `(admin)`, `(instructor)`
- `app/api/` — Next.js API routes that proxy to NestJS backend using `proxyGet`/`proxyPost`/etc. from `lib/nest-proxy.ts`
- `components/ui/` — shadcn/ui primitives (Radix + Tailwind)
- `components/[feature]/` — Feature-specific components
- `contexts/AuthContext.tsx` — Client-side auth state
- `lib/api-client.ts` — Central HTTP client with auto auth token injection and 401 refresh
- `lib/types.ts` — Single source of truth for TypeScript interfaces (User, Course, Event, etc.)
- `lib/auth-storage.ts` — Token/user persistence, cross-tab sync
- `lib/nest-proxy.ts` — Proxy utility for API routes to NestJS
- `messages/{en,fr}.json` — i18n translation files (next-intl)
- `proxy.ts` — Locale detection and URL rewriting (Next.js 16 renamed `middleware.ts` to `proxy.ts`; still exports `next-intl/middleware`)
- `i18n/routing.ts` — next-intl routing config (locales `en`/`fr`, `localePrefix: 'always'`)

### Backend Structure (`esrc-backend/src/`)
- `modules/` — Self-contained NestJS modules: auth, users, courses, payments, certificates, research, events, advisory, community, opportunities, ai, search, notifications, storage, analytics, impact, instructor, blog, content, health, email
- `config/` — Environment config and validation
- `common/` — Shared guards, decorators, filters, pipes, interceptors
- `prisma/` — Prisma service wrapper
- `main.ts` — App bootstrap (port 4000), Swagger setup, global pipes/filters/interceptors
- Database schema: `esrc-backend/prisma/schema.prisma`
- Swagger API docs: `http://localhost:4000/api/docs` (auto-generated from decorators)

### Backend Global Middleware (configured in `main.ts`)
- **ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — DTOs auto-strip unknown fields and reject extra properties
- **HttpExceptionFilter**: Standardizes error responses
- **ResponseInterceptor**: Wraps all responses in `{ success, data, timestamp }` format
- **LoggingInterceptor**: Logs request/response timing
- **Helmet**: Security headers
- **Compression**: Response compression
- **CORS**: Allows `FRONTEND_URL` origins and any `*.vercel.app`
- **Stripe raw body**: Preserves raw body on requests with `stripe-signature` header
- **Rate limiting** (ThrottlerModule): auth 10 req/min, payment 20 req/min, default 100 req/min

## Code Patterns

### Frontend
- **"use client"** directive required for components using hooks or context
- Import API client as `import { apiClient } from '@/lib/api-client'` — never use direct fetch
- Forms use React Hook Form + Zod validation
- All types go in `lib/types.ts`; never use `any`
- Styling: Tailwind utility classes, mobile-first (`sm:`, `md:`, `lg:`)
- Icons: lucide-react
- Toast notifications: sonner
- Charts: recharts
- Package manager: **pnpm** locally (pinned `pnpm@9.15.4`), **npm** on Vercel (pnpm + Node 24 is incompatible on Vercel)

### Backend
- Auth: `@UseGuards(JwtGuard)` + `@CurrentUser()` decorator for protected routes
- Public routes: `@Public()` decorator to bypass JWT guard
- Role-based access: `@Roles('ADMIN')` + `@UseGuards(RolesGuard)`
- Validation: class-validator decorators on DTO classes (auto-validated by global ValidationPipe)
- API responses: automatically wrapped by `ResponseInterceptor` into `{ success: true, data: T, timestamp }` or `{ success: false, error: "message", statusCode, timestamp }`
- Path alias: `@/*` maps to `src/*` in tsconfig — use `@/` imports, not relative paths
- Database: soft deletes with `deletedAt` timestamp; bilingual fields use parallel columns (`titleEn`/`titleFr`, `descriptionEn`/`descriptionFr`) with a Language enum (EN, FR, BOTH)
- Password hashing: argon2 (primary), bcrypt (legacy)
- Package manager: **npm**

### Adding a New API Endpoint (Full Flow)
1. **Backend**: Create controller/service/DTOs in `esrc-backend/src/modules/[feature]/`
2. **Frontend proxy**: Add `app/api/[feature]/route.ts` using `proxyGet`/`proxyPost` from `lib/nest-proxy.ts`
3. **Types**: Add interface to `lib/types.ts`
4. **Consume**: Call via `apiClient` in components — never use direct fetch

### Authentication Flow
Login returns `{ token, user, refreshToken }` -> stored in localStorage via `auth-storage.ts` -> `apiClient` auto-injects Bearer token and auto-refreshes on 401. Google OAuth is also supported via passport-google-oauth20.

### Instructor Approval Workflow

Users registering as instructors are stored with LEARNER role. An `InstructorApprovalRequest` (PENDING) is created and admin is notified. Admin approves/rejects, then user role is updated to INSTRUCTOR.

### i18n
Locales: `en`, `fr`. All pages under `app/[locale]/`. Always pass `locale` from URL params to components needing translation.

### Real-time Features
Socket.IO gateway in the backend (`/ws` namespace) with WebSocket auth guard (`ws-auth.guard.ts`). Frontend connects via `socket.io-client`.

### Certificate Generation
Puppeteer generates PDF certificates server-side. On Railway, the Dockerfile must NOT install Chromium (uses bundled Puppeteer).

### Payments
Stripe (international), PayPal, MTN Mobile Money, Orange Money, Flutterwave. Stripe webhooks use raw body verification (handled in `main.ts`). Set `PAYMENT_SANDBOX=true` in `.env` to enable sandbox mode for payment testing.

## Environment Variables

### Frontend (`.env.local`)
- `NEXT_PUBLIC_API_URL=/api` — Frontend API proxy path
- `NESTJS_URL=http://localhost:4000` — Backend URL (server-side only, used by nest-proxy.ts)

### Backend (`.env`)
- `PORT=4000`, `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN=7d`
- `FRONTEND_URL=http://localhost:3000` — For CORS (comma-separated for multiple origins)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET` — File storage
- `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` — Search
- `HUGGINGFACE_API_KEY` — AI features

## Deployment

- **Frontend**: Vercel — must use `npm install --legacy-peer-deps` (not pnpm) due to Node 24 incompatibility. Build command: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- **Backend**: Railway — Dockerfile-based, runs on port 4000
- **Database**: Railway PostgreSQL
- Vercel env var `NESTJS_URL` must point to the Railway backend URL

## Design System

- **Primary Green**: `#1B5E20` — Buttons, nav, headers
- **Gold Accent**: `#F9A825` — CTAs, highlights
- **Earth Brown**: `#795548` — Warmth elements
- **Display font**: Playfair Display (headings)
- **Body font**: DM Sans (text)
- Custom colors defined as `esrc.*` in `tailwind.config.ts`
