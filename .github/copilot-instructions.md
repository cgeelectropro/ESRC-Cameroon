# ESRC Cameroon – Copilot Instructions

## Project Overview

ESRC Cameroon is a **full-stack bilingual (EN/FR) learning and entrepreneurship platform** with:
- **Frontend**: Next.js 16 (App Router) with shadcn/ui, Tailwind CSS
- **Backend**: NestJS + Prisma + PostgreSQL  
- **Services**: Redis (cache), Meilisearch (search), S3 (file storage), Socket.IO (real-time)
- **Deployment**: Docker/Docker Compose, GitHub Actions CI/CD

**Key Principle**: Component → `/app/api/[route]` → NestJS Backend. Never call external services directly from components.

---

## Architecture & Data Flow

### Frontend-Backend Contract
1. **Frontend** (`/app/api/`) routes act as a **stateless proxy layer** to NestJS
2. All business logic lives in the **NestJS backend** (`/esrc-backend/src/modules/`)
3. **Why**: Enables frontend refactoring without backend changes; supports future migrations

### Critical File References
- **Frontend API Client**: `lib/api-client.ts` – All HTTP calls go through `apiClient` with built-in auth+refresh
- **Type Definitions**: `lib/types.ts` – Single source of truth for interfaces (User, Course, Event, etc.)
- **Auth Storage**: `lib/auth-storage.ts` – Token/user persistence, syncing across tabs
- **Backend Config**: `esrc-backend/src/config/` – Environment, validation schema, constants
- **Prisma Schema**: `esrc-backend/prisma/schema.prisma` – Database source of truth (update before migrations)

### Module Organization (Backend)
```
esrc-backend/src/modules/
├── auth/           # JWT, refresh, session logic
├── users/          # User profiles, dashboard
├── courses/        # Course CRUD, enrollments, completions
├── payments/       # Payment initiation, webhooks (MTN, Orange, Stripe, PayPal)
├── certificates/   # PDF generation (Puppeteer), verification
├── research/       # Publications, datasets
├── events/         # Events, registrations
├── advisory/       # Mentors, session booking
├── community/      # Forum posts/replies
├── opportunities/  # Jobs, internships, grants
├── ai/            # Chat, recommendations, business validation, quiz generation
├── search/        # Meilisearch full-text indexing
├── notifications/ # Socket.IO gateway for real-time updates
├── storage/       # S3 file uploads (abstraction)
├── analytics/     # Admin dashboards
├── impact/        # Platform-wide impact statistics
└── instructor/    # Instructor revenue, course analytics
```

### I18n Routing
- **Locales**: `en`, `fr` (in `/[locale]/` segments)
- **Routing Config**: `i18n/routing.ts` (next-intl)
- **Messages**: `messages/{en,fr}.json`
- **Middleware**: `middleware.ts` – Handles locale detection and rewriting

---

## Development Workflows

### Starting the Project

#### Backend (PowerShell)
```powershell
cd esrc-backend
docker-compose up -d              # Start PostgreSQL, Redis, Meilisearch
cp .env.example .env              # Configure DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev --name init # Apply migrations
npm run start:dev                  # Runs on localhost:4000
```

#### Frontend (PowerShell)
```powershell
cd ESRC_Cameroon_frontend
cp .env.example .env.local
# Ensure NESTJS_URL=http://localhost:4000
pnpm install
pnpm dev                           # Runs on localhost:3000
```

### Database Changes
1. **Update** `esrc-backend/prisma/schema.prisma`
2. **Run**: `npm run prisma:migrate` (creates migration file)
3. **Verify**: Check generated migration in `prisma/migrations/[timestamp]_migration_name/`
4. **Test**: Restart backend with `npm run start:dev`

### API Development
- **Add endpoint**: Create NestJS controller/service in `/modules/[feature]/`
- **Export from apiClient**: Update `lib/api-client.ts` with fetch wrapper
- **Type it**: Add interface to `lib/types.ts`
- **Consume**: Use `apiClient.methodName()` in components (never direct fetch)

### Building & Testing

#### Frontend
- **Build**: `pnpm build` (Next.js static/server optimization)
- **Lint**: `pnpm lint` (ESLint configured for TypeScript)
- **Test**: Jest tests (if present) – check `__tests__/` directories

#### Backend
- **Build**: `npm run build` (TypeScript → JavaScript)
- **Lint**: `npm run lint` (ESLint + Prettier)
- **Test**: `npm run test` (Jest unit tests)
- **Test E2E**: `npm run test:e2e` (integration tests)
- **Prisma Studio**: `npm run prisma:studio` – Visual DB browser on localhost:5555

---

## Code Patterns & Conventions

### Frontend Components
- **"use client"** – Required at top of interactive components (hooks, context consumers)
- **Server Components** – Default; fetch data in layout/page.tsx, pass as props
- **Pattern**: `components/[feature]/ComponentName.tsx` follows shadcn/ui structure
  ```tsx
  'use client'
  import { apiClient } from '@/lib/api-client'
  import { useAuth } from '@/hooks/useAuth'
  
  export function CourseCard({ course }: { course: Course }) {
    // component logic
  }
  ```

### Authentication
- **Frontend**: `useAuth()` hook or `AuthContext` (client-side)
- **Backend**: `@UseGuards(JwtGuard)` on controllers; `@CurrentUser()` decorator for user extraction
- **Token Flow**: 
  - Login returns `{ token, user, refreshToken }`
  - Stored in localStorage (via `auth-storage.ts`)
  - `apiClient` auto-injects Bearer token; auto-refreshes on 401

### Type Safety
- **Never use `any`** – Add types to `lib/types.ts`
- **Frontend types** match backend Prisma enums (e.g., `UserRole`, `CourseLevel`)
- **Shared enums**: Both frontend/backend define them (frontend for UI, backend for DB)

### API Response Format
- **Success**: `{ success: true, data: T, ... }`
- **Error**: `{ success: false, error: "message" }`
- **apiClient.handleResponse()** – Normalizes all responses into this format

### Database Constraints
- **Soft deletes**: Use `deletedAt` timestamp (query filters `WHERE deletedAt IS NULL`)
- **Indexes**: Add to `.prisma` for frequently queried fields (e.g., `courseId`, `userId`)
- **Foreign keys**: Cascade deletes set in schema (e.g., enrollments delete when course deleted)

### Real-time Features
- **WebSocket**: NestJS Socket.IO gateway at `/ws` namespace
- **Notifications**: Listen for `notification` event; emit from backend using `gateway.server.emit()`
- **Example**: Course enrollment triggers `courseEnrolled` event to student's room

### File Uploads
- **S3 Abstraction**: `StorageModule` in backend
- **Frontend**: POST multipart FormData to `/api/upload`
- **Response**: Returns signed S3 URL for direct access

---

## Common Commands & Debugging

### Docker Management
```powershell
# View running containers
docker ps

# Stop containers
docker-compose down

# View logs
docker logs esrc-backend-postgres-1
docker logs esrc-backend-redis-1

# Reset database
docker-compose down -v; docker-compose up -d; npm run prisma:migrate
```

### Inspecting Data
```bash
# View database (Prisma Studio)
npm run prisma:studio

# Check Redis
docker exec -it esrc-backend-redis-1 redis-cli ping

# Meilisearch console
# http://localhost:7700/
```

### Common Issues
- **401 Unauthorized**: Token expired or invalid – check `auth-storage.ts`, verify refresh token flow
- **CORS errors**: Ensure `FRONTEND_URL` env var matches frontend origin in backend
- **Migration failed**: Check Prisma syntax, run `npx prisma validate`
- **Component not rendering**: Check "use client" directive if using hooks/context

---

## Design System & Styling

### Color Palette
- **Primary Green**: `#1B5E20` (esrc.green-900) – Buttons, nav, headers
- **Gold Accent**: `#F9A825` (esrc.gold-500) – CTAs, highlights
- **Earth Brown**: `#795548` – Warmth/authenticity elements
- **Neutral Grays**: dark (#1A1A1A), mid (#555555), light (#F5F5F5)

### Typography
- **Display**: Playfair Display (headings, serif)
- **Body**: DM Sans (text, sans-serif)

### Component Library
- **UI**: shadcn/ui (Radix + Tailwind)
- **Icons**: lucide-react
- **Forms**: React Hook Form + Zod validation
- **Tailwind Config**: `tailwind.config.ts` extends with custom esrc colors

### Styling Approach
- **Utility-first**: Use Tailwind classes; avoid inline styles
- **Custom animations**: Defined in tailwind.config (fade-in-up, slide-in, marquee)
- **Responsive**: Mobile-first; use `sm:`, `md:`, `lg:` prefixes

---

## Deployment & Environment

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=/api        # Frontend API proxy
NESTJS_URL=http://localhost:4000 # Backend base URL
```

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://esrc_user:esrc_password@localhost:5432/esrc_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=
```

### Docker Build
- **Dockerfile**: Multi-stage build in `esrc-backend/`
- **Includes**: Chromium for Puppeteer (certificate PDF generation)
- **CI/CD**: GitHub Actions workflow at `.github/workflows/deploy.yml`

---

## Key Patterns to Follow

1. **API Layer First**: Never fetch directly from components to Supabase/external services
2. **Type Everything**: Use `lib/types.ts` for all interfaces; prefer interfaces over type unions
3. **Locale-Aware**: Always pass `locale` from URL params to components needing i18n
4. **Error Handling**: Wrap `apiClient` calls with try-catch; show user-friendly messages
5. **Re-usable Hooks**: Custom hooks in `hooks/` (useAuth, useCourses, useEnrollment, useLanguage)
6. **Modular Modules**: Backend modules are self-contained; shared services via NestJS DI
7. **Soft Deletes**: Default to soft deletes (deletedAt) for audit trails

---

## When in Doubt

- **Frontend patterns**: Check `components/courses/CourseCard.tsx` or `contexts/AuthContext.tsx`
- **Backend patterns**: Check `esrc-backend/src/modules/courses/courses.controller.ts`
- **Database schema**: Reference `esrc-backend/prisma/schema.prisma`
- **Type definitions**: Check `lib/types.ts` (should be comprehensive)
- **API integration**: See `lib/api-client.ts` for examples
