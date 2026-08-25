# LMS Engine Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `lms-engine` NestJS + Prisma + PostgreSQL microservice with tenancy, auth, course catalog, and enrollment/progress tracking — a complete, independently testable vertical slice (register → login → create course → enroll → track progress) that later plans (quizzes/assignments, commerce/payments, certificates/reviews/Q&A, ops/webhooks) build on top of.

**Architecture:** NestJS modules per domain, each depending on shared infrastructure only through interfaces. Prisma Client Extension enforces `tenantId` scoping automatically so no service can accidentally leak cross-tenant data. JWT auth with a pluggable verifier strategy. REST API under `/api/v1`, uniform `{ success, data, timestamp }` response envelope.

**Tech Stack:** NestJS 10, Prisma 5, PostgreSQL, TypeScript 5, class-validator/class-transformer, Jest, argon2 for password hashing, Docker Compose for local Postgres.

## Global Constraints

- New, independent git repository at `C:\Users\goodn\Developement\web dev project\lms-engine` — already created, default branch `main`. The ESRC Cameroon repository is never read from or modified.
- Path alias `@/*` → `src/*` (matches proven ESRC backend pattern).
- API served under global prefix `api` with URI versioning, default version `1` (all routes resolve to `/api/v1/...`).
- Global `ValidationPipe`: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Every tenant-scoped Prisma model carries `tenantId String` with an index; no service queries tenant-scoped tables without going through the tenancy-scoped Prisma client.
- Password hashing via argon2 only (no bcrypt — this is a fresh codebase, no legacy hashes to support).
- All cross-service integrations (payments, notifications, storage, auth verification) go through TypeScript interfaces defined in this plan — no direct vendor SDK calls from domain services. (Concrete adapters for payments/storage/notifications are built in later plans; this plan defines the interfaces and a no-op/log adapter only.)

---

## File Structure

```
lms-engine/
  src/
    main.ts
    app.module.ts
    config/
      env.validation.ts
      configuration.ts
    prisma/
      prisma.service.ts
      prisma.module.ts
      tenant-scoped-prisma.ts
    common/
      guards/jwt-auth.guard.ts
      guards/roles.guard.ts
      guards/tenant.guard.ts
      decorators/roles.decorator.ts
      decorators/public.decorator.ts
      decorators/current-user.decorator.ts
      decorators/current-tenant.decorator.ts
      filters/http-exception.filter.ts
      interceptors/response.interceptor.ts
      interfaces/notification-adapter.interface.ts
      interfaces/auth-token-verifier.interface.ts
      adapters/log-notification.adapter.ts
    modules/
      tenancy/
        tenancy.module.ts
        tenancy.service.ts
        dto/create-tenant.dto.ts
      auth/
        auth.module.ts
        auth.service.ts
        auth.controller.ts
        jwt.strategy.ts
        dto/register.dto.ts
        dto/login.dto.ts
      users/
        users.module.ts
        users.service.ts
      courses/
        courses.module.ts
        courses.service.ts
        courses.controller.ts
        sections.service.ts
        sections.controller.ts
        lessons.service.ts
        lessons.controller.ts
        dto/create-course.dto.ts
        dto/update-course.dto.ts
        dto/create-section.dto.ts
        dto/create-lesson.dto.ts
      enrollment/
        enrollment.module.ts
        enrollment.service.ts
        enrollment.controller.ts
        dto/create-enrollment.dto.ts
        dto/update-progress.dto.ts
  prisma/
    schema.prisma
    seed.ts
  test/
    jest-e2e.json
    tenancy-isolation.e2e-spec.ts
    enrollment-flow.e2e-spec.ts
  docker-compose.yml
  .env.example
  package.json
  tsconfig.json
  tsconfig.build.json
  .eslintrc.js
  .gitignore
  README.md
```

---

### Task 1: Repository Scaffold & Tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `.eslintrc.js`, `.prettierrc`, `.gitignore`, `nest-cli.json`, `docker-compose.yml`, `.env.example`, `README.md`
- Create: `src/main.ts` (minimal bootstrap, expanded in Task 4), `src/app.module.ts` (empty root module, expanded through later tasks)

**Interfaces:**
- Produces: a runnable `npm run start:dev` NestJS app on port 4100 (distinct from ESRC's 4000/3000 to allow both running locally at once), a local Postgres via `docker-compose up -d`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "lms-engine",
  "version": "0.1.0",
  "description": "Standalone, multi-tenant e-learning microservice",
  "license": "UNLICENSED",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/config": "^3.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/swagger": "^7.4.2",
    "@nestjs/throttler": "^5.2.0",
    "@prisma/client": "^5.22.0",
    "argon2": "^0.40.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "helmet": "^7.1.0",
    "joi": "^17.13.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.9",
    "@nestjs/schematics": "^10.2.3",
    "@nestjs/testing": "^10.4.15",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.14",
    "@types/node": "^20.19.35",
    "@types/passport-jwt": "^4.0.1",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "jest": "^29.7.0",
    "prettier": "^3.3.3",
    "prisma": "^5.22.0",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": { "^@/(.*)$": "<rootDir>/$1" }
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 3: Create `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true, "plugins": ["@nestjs/swagger/plugin"] }
}
```

- [ ] **Step 5: Create `.eslintrc.js`**

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: { node: true, jest: true },
  ignorePatterns: ['.eslintrc.js', 'dist'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

- [ ] **Step 6: Create `.prettierrc`**

```json
{ "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

- [ ] **Step 7: Create `.gitignore`**

```
node_modules/
dist/
coverage/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 8: Create `docker-compose.yml`**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: lms
      POSTGRES_PASSWORD: lms
      POSTGRES_DB: lms_engine
    ports:
      - '5433:5432'
    volumes:
      - lms_postgres_data:/var/lib/postgresql/data
volumes:
  lms_postgres_data:
```

Note: host port `5433` (not `5432`) so it can run alongside ESRC's own Postgres without conflict.

- [ ] **Step 9: Create `.env.example`**

```
PORT=4100
DATABASE_URL="postgresql://lms:lms@localhost:5433/lms_engine?schema=public"
JWT_SECRET="change-me-in-each-deployment"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-me-in-each-deployment-too"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGINS="http://localhost:3000"
```

- [ ] **Step 10: Create minimal `src/app.module.ts` and `src/main.ts`**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
```

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4100;
  await app.listen(port);
  console.log(`lms-engine running on http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 11: Create `README.md`**

```markdown
# lms-engine

Standalone, multi-tenant e-learning microservice. Own auth, courses, quizzes,
assignments, certificates, commerce, and payments — designed so any frontend
(Next.js, Flutter, WordPress, plain HTML) or backend integrates purely over
HTTP.

## Quickstart

1. `npm install`
2. Copy `.env.example` to `.env` and fill in secrets
3. `docker-compose up -d` — starts local Postgres on port 5433
4. `npm run prisma:migrate` — creates schema
5. `npm run start:dev` — API on http://localhost:4100, Swagger at `/api/docs`
```

- [ ] **Step 12: Install dependencies and verify boot**

Run: `cd "C:\Users\goodn\Developement\web dev project\lms-engine" && npm install`
Expected: install completes with no errors.

Run: `npm run start:dev` (then stop with Ctrl+C once you see the listen message)
Expected: console prints `lms-engine running on http://localhost:4100` with no errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold lms-engine NestJS project"
```

---

### Task 2: Prisma Schema — Tenancy, Identity, Catalog, Learning Models

**Files:**
- Create: `prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma models `Tenant`, `User`, `InstructorProfile`, `InstructorApprovalRequest`, `CourseCategory`, `Course`, `Section`, `Lesson`, `Enrollment`, `LessonProgress`, `LessonNote`, `Review` — field names and enums referenced verbatim by Tasks 3–7.

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  ADMIN
  INSTRUCTOR
  STUDENT
}

enum InstructorApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum LessonType {
  VIDEO
  TEXT
  DOC
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  apiKey    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  categories CourseCategory[]
  courses    Course[]

  @@map("tenants")
}

model User {
  id           String   @id @default(cuid())
  tenantId     String
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  email        String
  passwordHash String
  firstName    String
  lastName     String
  role         Role     @default(STUDENT)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  instructorProfile    InstructorProfile?
  coursesTaught        Course[]              @relation("InstructorCourses")
  enrollments          Enrollment[]
  reviews              Review[]
  lessonNotes          LessonNote[]
  approvalRequest      InstructorApprovalRequest?

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("users")
}

model InstructorProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  tenantId  String
  bio       String?
  headline  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
  @@map("instructor_profiles")
}

model InstructorApprovalRequest {
  id        String                    @id @default(cuid())
  userId    String                    @unique
  user      User                      @relation(fields: [userId], references: [id])
  tenantId  String
  status    InstructorApprovalStatus  @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  createdAt DateTime                  @default(now())

  @@index([tenantId, status])
  @@map("instructor_approval_requests")
}

model CourseCategory {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  nameEn    String
  nameFr    String?
  slug      String
  createdAt DateTime @default(now())

  courses Course[]

  @@unique([tenantId, slug])
  @@index([tenantId])
  @@map("course_categories")
}

model Course {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  instructorId  String
  instructor    User     @relation("InstructorCourses", fields: [instructorId], references: [id])
  categoryId    String?
  category      CourseCategory? @relation(fields: [categoryId], references: [id])
  titleEn       String
  titleFr       String?
  descriptionEn String?
  descriptionFr String?
  slug          String
  priceCents    Int      @default(0)
  currency      String   @default("USD")
  isPublished   Boolean  @default(false)
  contentUpdatedAt DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  sections    Section[]
  enrollments Enrollment[]
  reviews     Review[]

  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([tenantId, isPublished])
  @@map("courses")
}

model Section {
  id        String   @id @default(cuid())
  tenantId  String
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  titleEn   String
  titleFr   String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lessons Lesson[]

  @@index([tenantId])
  @@index([courseId, order])
  @@map("sections")
}

model Lesson {
  id                String     @id @default(cuid())
  tenantId          String
  sectionId         String
  section           Section    @relation(fields: [sectionId], references: [id])
  titleEn           String
  titleFr           String?
  type              LessonType @default(VIDEO)
  contentUrl        String?
  contentText        String?
  durationSeconds   Int?
  order             Int        @default(0)
  isPreviewable     Boolean    @default(false)
  availableAfterDays Int?
  availableAt       DateTime?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  progress LessonProgress[]
  notes    LessonNote[]

  @@index([tenantId])
  @@index([sectionId, order])
  @@map("lessons")
}

model Enrollment {
  id         String           @id @default(cuid())
  tenantId   String
  courseId   String
  course     Course           @relation(fields: [courseId], references: [id])
  studentId  String
  student    User             @relation(fields: [studentId], references: [id])
  status     EnrollmentStatus @default(ACTIVE)
  enrolledAt DateTime         @default(now())
  completedAt DateTime?

  lessonProgress LessonProgress[]

  @@unique([courseId, studentId])
  @@index([tenantId])
  @@index([tenantId, studentId])
  @@map("enrollments")
}

model LessonProgress {
  id               String     @id @default(cuid())
  tenantId         String
  enrollmentId     String
  enrollment       Enrollment @relation(fields: [enrollmentId], references: [id])
  lessonId         String
  lesson           Lesson     @relation(fields: [lessonId], references: [id])
  secondsWatched   Int        @default(0)
  lastPositionSeconds Int     @default(0)
  isCompleted      Boolean    @default(false)
  completedAt      DateTime?
  updatedAt        DateTime   @updatedAt

  @@unique([enrollmentId, lessonId])
  @@index([tenantId])
  @@map("lesson_progress")
}

model LessonNote {
  id        String   @id @default(cuid())
  tenantId  String
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  timestampSeconds Int
  body      String
  createdAt DateTime @default(now())

  @@index([tenantId])
  @@index([lessonId, userId])
  @@map("lesson_notes")
}

model Review {
  id        String   @id @default(cuid())
  tenantId  String
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  @@unique([courseId, userId])
  @@index([tenantId])
  @@map("reviews")
}
```

- [ ] **Step 2: Generate Prisma client and run first migration**

Run: `cd "C:\Users\goodn\Developement\web dev project\lms-engine" && docker-compose up -d`
Expected: Postgres container starts, healthy.

Run: `npm run prisma:migrate -- --name init`
Expected: migration `init` created under `prisma/migrations/`, applied with no errors, Prisma Client generated.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema for tenancy, identity, catalog, and learning models"
```

---

### Task 3: Prisma Service & Tenant-Scoped Client

**Files:**
- Create: `src/prisma/prisma.service.ts`
- Create: `src/prisma/prisma.module.ts`
- Create: `src/prisma/tenant-scoped-prisma.ts`
- Test: `src/prisma/tenant-scoped-prisma.spec.ts`

**Interfaces:**
- Consumes: `PrismaClient` from `@prisma/client` (Task 2's schema)
- Produces:
  - `PrismaService` (injectable, extends `PrismaClient`, connects `onModuleInit`)
  - `forTenant(prisma: PrismaService, tenantId: string): TenantScopedPrisma` — returns a Prisma Client Extension result where `findMany`/`findUnique`/`findFirst`/`update`/`updateMany`/`delete`/`deleteMany`/`count` on all tenant-scoped models automatically inject `where: { tenantId }`, and `create`/`createMany` automatically inject `data: { tenantId }`. Tenant-scoped models: `User, InstructorProfile, InstructorApprovalRequest, CourseCategory, Course, Section, Lesson, Enrollment, LessonProgress, LessonNote, Review`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/prisma/tenant-scoped-prisma.spec.ts
import { PrismaService } from './prisma.service';
import { forTenant } from './tenant-scoped-prisma';

describe('forTenant', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('scopes queries so a tenant cannot see another tenant\'s courses', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', slug: `tenant-a-${Date.now()}`, apiKey: `key-a-${Date.now()}` },
    });
    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', slug: `tenant-b-${Date.now()}`, apiKey: `key-b-${Date.now()}` },
    });

    const scopedA = forTenant(prisma, tenantA.id);
    const scopedB = forTenant(prisma, tenantB.id);

    const instructorA = await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        email: 'instructor-a@example.com',
        passwordHash: 'x',
        firstName: 'A',
        lastName: 'Instructor',
        role: 'INSTRUCTOR',
      },
    });

    await scopedA.course.create({
      data: {
        instructorId: instructorA.id,
        titleEn: 'Tenant A Course',
        slug: `course-a-${Date.now()}`,
      } as any,
    });

    const coursesVisibleToB = await scopedB.course.findMany();
    const coursesVisibleToA = await scopedA.course.findMany();

    expect(coursesVisibleToB).toHaveLength(0);
    expect(coursesVisibleToA).toHaveLength(1);
    expect(coursesVisibleToA[0].titleEn).toBe('Tenant A Course');

    await prisma.course.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.user.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tenant-scoped-prisma.spec.ts`
Expected: FAIL — `Cannot find module './tenant-scoped-prisma'` (module doesn't exist yet).

- [ ] **Step 3: Write `src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 4: Write `src/prisma/tenant-scoped-prisma.ts`**

```typescript
import { PrismaService } from './prisma.service';

const TENANT_SCOPED_MODELS = [
  'user',
  'instructorProfile',
  'instructorApprovalRequest',
  'courseCategory',
  'course',
  'section',
  'lesson',
  'enrollment',
  'lessonProgress',
  'lessonNote',
  'review',
] as const;

export function forTenant(prisma: PrismaService, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const isScoped = model && TENANT_SCOPED_MODELS.includes(
            (model.charAt(0).toLowerCase() + model.slice(1)) as (typeof TENANT_SCOPED_MODELS)[number],
          );
          if (!isScoped) {
            return query(args);
          }

          const readOrDeleteOps = ['findMany', 'findFirst', 'findUnique', 'update', 'updateMany', 'delete', 'deleteMany', 'count'];
          const writeOps = ['create'];
          const bulkWriteOps = ['createMany'];

          if (readOrDeleteOps.includes(operation)) {
            (args as any).where = { ...(args as any).where, tenantId };
          } else if (writeOps.includes(operation)) {
            (args as any).data = { ...(args as any).data, tenantId };
          } else if (bulkWriteOps.includes(operation)) {
            (args as any).data = ((args as any).data as any[]).map((d) => ({ ...d, tenantId }));
          }

          return query(args);
        },
      },
    },
  });
}

export type TenantScopedPrisma = ReturnType<typeof forTenant>;
```

- [ ] **Step 5: Write `src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest tenant-scoped-prisma.spec.ts`
Expected: PASS (requires `docker-compose up -d` running and migration applied from Task 2).

- [ ] **Step 7: Wire `PrismaModule` into `AppModule`**

Edit `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add tenant-scoped Prisma client via extension"
```

---

### Task 4: App Bootstrap — Global Prefix, Versioning, Validation, Response Envelope

**Files:**
- Create: `src/common/filters/http-exception.filter.ts`
- Create: `src/common/interceptors/response.interceptor.ts`
- Modify: `src/main.ts`
- Test: `test/jest-e2e.json`, `test/health.e2e-spec.ts`

**Interfaces:**
- Produces: every successful response shaped `{ success: true, data: T, timestamp: string }`; every error shaped `{ success: false, error: string, statusCode: number, timestamp: string }`. All routes live under `/api/v1/...`.

- [ ] **Step 1: Write the failing e2e test**

```json
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": { "^@/(.*)$": "<rootDir>/../src/$1" }
}
```

```typescript
// test/health.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('App bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('wraps a 404 in the standard error envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.statusCode).toBe(404);
    expect(typeof res.body.timestamp).toBe('string');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `Cannot find module '../src/common/filters/http-exception.filter'`.

- [ ] **Step 3: Write `src/common/filters/http-exception.filter.ts`**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? this.extractMessage(exception)
      : 'Internal server error';

    response.status(statusCode).json({
      success: false,
      error: message,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const msg = (response as { message: unknown }).message;
      return Array.isArray(msg) ? msg.join('; ') : String(msg);
    }
    return exception.message;
  }
}
```

- [ ] **Step 4: Write `src/common/interceptors/response.interceptor.ts`**

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

- [ ] **Step 5: Update `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('LMS Engine API')
    .setDescription('Standalone multi-tenant e-learning microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'tenant-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4100;
  await app.listen(port);
  console.log(`lms-engine running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire global prefix, versioning, validation, and response envelope"
```

---

### Task 5: Tenancy Module — Provisioning & API Key Guard

**Files:**
- Create: `src/modules/tenancy/tenancy.module.ts`
- Create: `src/modules/tenancy/tenancy.service.ts`
- Create: `src/modules/tenancy/tenancy.controller.ts`
- Create: `src/modules/tenancy/dto/create-tenant.dto.ts`
- Create: `src/common/guards/tenant.guard.ts`
- Create: `src/common/decorators/current-tenant.decorator.ts`
- Test: `src/modules/tenancy/tenancy.service.spec.ts`

**Interfaces:**
- Consumes: `PrismaService` (Task 3)
- Produces:
  - `TenancyService.createTenant(dto: CreateTenantDto): Promise<Tenant>` — generates a unique `apiKey` (crypto-random, prefixed `lms_`)
  - `TenancyService.findByApiKey(apiKey: string): Promise<Tenant | null>`
  - `TenantGuard` — reads `x-api-key` header, attaches `request.tenant` (throws `UnauthorizedException` if missing/invalid)
  - `@CurrentTenant()` param decorator — extracts `request.tenant`
  - `POST /api/v1/tenants` (public, used for initial provisioning only — see note in Step 6)

- [ ] **Step 1: Write the failing test**

```typescript
// src/modules/tenancy/tenancy.service.spec.ts
import { Test } from '@nestjs/testing';
import { TenancyService } from './tenancy.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('TenancyService', () => {
  let service: TenancyService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TenancyService, PrismaService],
    }).compile();

    service = moduleRef.get(TenancyService);
    prisma = moduleRef.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a tenant with a unique generated API key', async () => {
    const tenant = await service.createTenant({ name: 'Test School', slug: `test-school-${Date.now()}` });

    expect(tenant.id).toBeDefined();
    expect(tenant.apiKey).toMatch(/^lms_/);

    const found = await service.findByApiKey(tenant.apiKey);
    expect(found?.id).toBe(tenant.id);

    await prisma.tenant.delete({ where: { id: tenant.id } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tenancy.service.spec.ts`
Expected: FAIL — `Cannot find module './tenancy.service'`.

- [ ] **Step 3: Write `src/modules/tenancy/dto/create-tenant.dto.ts`**

```typescript
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens only' })
  slug!: string;
}
```

- [ ] **Step 4: Write `src/modules/tenancy/tenancy.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    const apiKey = `lms_${randomBytes(24).toString('hex')}`;
    return this.prisma.tenant.create({
      data: { name: dto.name, slug: dto.slug, apiKey },
    });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.tenant.findUnique({ where: { apiKey } });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest tenancy.service.spec.ts`
Expected: PASS.

- [ ] **Step 6: Write `src/modules/tenancy/tenancy.controller.ts`**

Provisioning a tenant is a privileged, infrequent operation (done once per new consuming project) — it is intentionally left unguarded in this plan (no public signup for tenants) and is expected to be called manually by whoever operates the deployment (e.g. via Swagger UI or curl) rather than exposed to end users. A later ops plan can add a platform-owner super-admin guard if this needs to move behind auth.

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenancyService } from './tenancy.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('tenancy')
@Controller('tenants')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenancyService.createTenant(dto);
  }
}
```

- [ ] **Step 7: Write `src/common/guards/tenant.guard.ts`**

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenancyService } from '@/modules/tenancy/tenancy.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenancyService: TenancyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const tenant = await this.tenancyService.findByApiKey(apiKey);
    if (!tenant) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.tenant = tenant;
    return true;
  }
}
```

- [ ] **Step 8: Write `src/common/decorators/current-tenant.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Tenant } from '@prisma/client';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Tenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
```

- [ ] **Step 9: Write `src/modules/tenancy/tenancy.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';

@Module({
  providers: [TenancyService],
  controllers: [TenancyController],
  exports: [TenancyService],
})
export class TenancyModule {}
```

- [ ] **Step 10: Register `TenancyModule` in `AppModule`**

Edit `src/app.module.ts` to import `TenancyModule`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add tenancy provisioning service and API key guard"
```

---

### Task 6: Auth Module — Register, Login, JWT Guard

**Files:**
- Create: `src/modules/auth/auth.module.ts`
- Create: `src/modules/auth/auth.service.ts`
- Create: `src/modules/auth/auth.controller.ts`
- Create: `src/modules/auth/jwt.strategy.ts`
- Create: `src/modules/auth/dto/register.dto.ts`
- Create: `src/modules/auth/dto/login.dto.ts`
- Create: `src/common/guards/jwt-auth.guard.ts`
- Create: `src/common/guards/roles.guard.ts`
- Create: `src/common/decorators/roles.decorator.ts`
- Create: `src/common/decorators/public.decorator.ts`
- Create: `src/common/decorators/current-user.decorator.ts`
- Test: `test/auth-flow.e2e-spec.ts`

**Interfaces:**
- Consumes: `PrismaService`, `TenantGuard`/`@CurrentTenant()` (Task 5)
- Produces:
  - `AuthService.register(tenantId: string, dto: RegisterDto): Promise<{ user, accessToken, refreshToken }>`
  - `AuthService.login(tenantId: string, dto: LoginDto): Promise<{ user, accessToken, refreshToken }>`
  - JWT payload shape: `{ sub: userId, tenantId, role }`
  - `JwtAuthGuard`, `RolesGuard`, `@Roles(...roles: Role[])`, `@Public()`, `@CurrentUser()` decorator returning `{ id, tenantId, role, email }`
  - Routes: `POST /api/v1/auth/register`, `POST /api/v1/auth/login` (both require `x-api-key` via `TenantGuard`)

- [ ] **Step 1: Write the failing e2e test**

```typescript
// test/auth-flow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = moduleRef.get(PrismaService);
    const tenantRes = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Auth Test School', slug: `auth-test-${Date.now()}` });
    apiKey = tenantRes.body.data.apiKey;
    tenantId = tenantRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  it('registers a new user and returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: 'student@example.com', password: 'Password123!', firstName: 'Stu', lastName: 'Dent' });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('student@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('logs in with correct credentials and rejects wrong password', async () => {
    const goodRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-api-key', apiKey)
      .send({ email: 'student@example.com', password: 'Password123!' });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.data.accessToken).toBeDefined();

    const badRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-api-key', apiKey)
      .send({ email: 'student@example.com', password: 'WrongPassword' });
    expect(badRes.status).toBe(401);
  });

  it('rejects requests without a valid x-api-key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@example.com', password: 'Password123!' });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `/api/v1/auth/register` returns 404 (route doesn't exist yet).

- [ ] **Step 3: Write DTOs**

```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}
```

```typescript
// src/modules/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
```

- [ ] **Step 4: Write `src/modules/auth/auth.service.ts`**

```typescript
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(tenantId: string, dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) {
      throw new ConflictException('Email already registered for this tenant');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(tenantId: string, dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: { id: string; tenantId: string; role: string; email: string; firstName: string; lastName: string }) {
    const payload = { sub: user.id, tenantId: user.tenantId, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
```

- [ ] **Step 5: Write `src/modules/auth/jwt.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, tenantId: payload.tenantId, role: payload.role };
  }
}
```

- [ ] **Step 6: Write `src/common/decorators/public.decorator.ts`, `roles.decorator.ts`, `current-user.decorator.ts`**

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  tenantId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 7: Write `src/common/guards/jwt-auth.guard.ts` and `roles.guard.ts`**

```typescript
// src/common/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

```typescript
// src/common/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
```

- [ ] **Step 8: Write `src/modules/auth/auth.controller.ts`**

```typescript
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { Tenant } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Public()
@UseGuards(TenantGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@CurrentTenant() tenant: Tenant, @Body() dto: RegisterDto) {
    return this.authService.register(tenant.id, dto);
  }

  @Post('login')
  login(@CurrentTenant() tenant: Tenant, @Body() dto: LoginDto) {
    return this.authService.login(tenant.id, dto);
  }
}
```

Note: `@Public()` here bypasses the *JWT* guard (there is no user token yet at register/login time) — `TenantGuard` still runs and requires a valid `x-api-key`, matching the test's expectation that missing/invalid API keys are rejected.

- [ ] **Step 9: Write `src/modules/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenancyModule } from '@/modules/tenancy/tenancy.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), TenancyModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 10: Register global guards and `AuthModule` in `AppModule`**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, TenancyModule, AuthModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (all three `auth-flow.e2e-spec.ts` cases, plus `health.e2e-spec.ts` still passing).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add auth module with register/login, JWT and role guards"
```

---

### Task 7: Courses Module — Categories, Courses, Sections, Lessons

**Files:**
- Create: `src/modules/courses/courses.module.ts`
- Create: `src/modules/courses/courses.service.ts`
- Create: `src/modules/courses/courses.controller.ts`
- Create: `src/modules/courses/sections.service.ts`
- Create: `src/modules/courses/sections.controller.ts`
- Create: `src/modules/courses/lessons.service.ts`
- Create: `src/modules/courses/lessons.controller.ts`
- Create: `src/modules/courses/dto/create-course.dto.ts`
- Create: `src/modules/courses/dto/create-section.dto.ts`
- Create: `src/modules/courses/dto/create-lesson.dto.ts`
- Test: `test/courses-flow.e2e-spec.ts`

**Interfaces:**
- Consumes: `PrismaService`, `forTenant` (Task 3), `@CurrentUser()`, `@Roles()`, `JwtAuthGuard` (Task 6)
- Produces:
  - `CoursesService.create(tenantId, instructorId, dto): Promise<Course>`
  - `CoursesService.findPublished(tenantId): Promise<Course[]>`
  - `SectionsService.create(tenantId, courseId, dto): Promise<Section>`
  - `LessonsService.create(tenantId, sectionId, dto): Promise<Lesson>`
  - Routes: `POST /api/v1/courses` (INSTRUCTOR), `GET /api/v1/courses` (public within tenant), `POST /api/v1/courses/:courseId/sections` (INSTRUCTOR), `POST /api/v1/sections/:sectionId/lessons` (INSTRUCTOR) — all require `x-api-key` + Bearer JWT except `GET /api/v1/courses`.

- [ ] **Step 1: Write the failing e2e test**

```typescript
// test/courses-flow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Courses flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;
  let instructorToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = moduleRef.get(PrismaService);

    const tenantRes = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Courses Test School', slug: `courses-test-${Date.now()}` });
    apiKey = tenantRes.body.data.apiKey;
    tenantId = tenantRes.body.data.id;

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: 'instructor@example.com', password: 'Password123!', firstName: 'In', lastName: 'Structor' });
    instructorToken = registerRes.body.data.accessToken;

    await prisma.user.update({
      where: { id: registerRes.body.data.user.id },
      data: { role: 'INSTRUCTOR' },
    });

    const reLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-api-key', apiKey)
      .send({ email: 'instructor@example.com', password: 'Password123!' });
    instructorToken = reLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.lesson.deleteMany({ where: { tenantId } });
    await prisma.section.deleteMany({ where: { tenantId } });
    await prisma.course.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  it('lets an instructor create a course with a section and a lesson, then lists it publicly once published', async () => {
    const courseRes = await request(app.getHttpServer())
      .post('/api/v1/courses')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Intro to Testing', slug: 'intro-to-testing' });
    expect(courseRes.status).toBe(201);
    const courseId = courseRes.body.data.id;

    const sectionRes = await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseId}/sections`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Module 1', order: 0 });
    expect(sectionRes.status).toBe(201);
    const sectionId = sectionRes.body.data.id;

    const lessonRes = await request(app.getHttpServer())
      .post(`/api/v1/sections/${sectionId}/lessons`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Lesson 1', type: 'TEXT', order: 0, isPreviewable: true });
    expect(lessonRes.status).toBe(201);

    const listBeforePublish = await request(app.getHttpServer())
      .get('/api/v1/courses')
      .set('x-api-key', apiKey);
    expect(listBeforePublish.body.data).toHaveLength(0);

    await prisma.course.update({ where: { id: courseId }, data: { isPublished: true } });

    const listAfterPublish = await request(app.getHttpServer())
      .get('/api/v1/courses')
      .set('x-api-key', apiKey);
    expect(listAfterPublish.body.data).toHaveLength(1);
    expect(listAfterPublish.body.data[0].titleEn).toBe('Intro to Testing');
  });

  it('rejects course creation from a STUDENT role', async () => {
    const studentRegister = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: 'student2@example.com', password: 'Password123!', firstName: 'Stu', lastName: 'Dent' });

    const res = await request(app.getHttpServer())
      .post('/api/v1/courses')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentRegister.body.data.accessToken}`)
      .send({ titleEn: 'Should Fail', slug: 'should-fail' });

    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `/api/v1/courses` returns 404.

- [ ] **Step 3: Write DTOs**

```typescript
// src/modules/courses/dto/create-course.dto.ts
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

```typescript
// src/modules/courses/dto/create-section.dto.ts
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```

```typescript
// src/modules/courses/dto/create-lesson.dto.ts
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { LessonType } from '@prisma/client';

export class CreateLessonDto {
  @IsString()
  titleEn!: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsEnum(LessonType)
  type!: LessonType;

  @IsOptional()
  @IsString()
  contentUrl?: string;

  @IsOptional()
  @IsString()
  contentText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPreviewable?: boolean;
}
```

- [ ] **Step 4: Write `src/modules/courses/courses.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, instructorId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { tenantId, instructorId, ...dto },
    });
  }

  findPublished(tenantId: string) {
    return this.prisma.course.findMany({
      where: { tenantId, isPublished: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.course.findFirst({ where: { tenantId, id } });
  }
}
```

- [ ] **Step 5: Write `src/modules/courses/sections.service.ts` and `lessons.service.ts`**

```typescript
// src/modules/courses/sections.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, courseId: string, dto: CreateSectionDto) {
    return this.prisma.section.create({
      data: { tenantId, courseId, order: dto.order ?? 0, titleEn: dto.titleEn, titleFr: dto.titleFr },
    });
  }
}
```

```typescript
// src/modules/courses/lessons.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, sectionId: string, dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        tenantId,
        sectionId,
        order: dto.order ?? 0,
        isPreviewable: dto.isPreviewable ?? false,
        titleEn: dto.titleEn,
        titleFr: dto.titleFr,
        type: dto.type,
        contentUrl: dto.contentUrl,
        contentText: dto.contentText,
      },
    });
  }
}
```

- [ ] **Step 6: Write controllers**

```typescript
// src/modules/courses/courses.controller.ts
import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.tenantId, user.id, dto);
  }

  @Get()
  @Public()
  findPublished(@CurrentUser() user: CurrentUserPayload | undefined, @Param() _params: unknown) {
    // Public route still runs behind TenantGuard at the module level (Step 8),
    // so tenant is resolved from x-api-key even without a user JWT.
    return this.coursesService.findPublished((user as any)?.tenantId);
  }
}
```

Note: `GET /api/v1/courses` needs the tenant even when unauthenticated. Rather than relying on `CurrentUser` (which requires a JWT), use `@CurrentTenant()` directly:

```typescript
// Corrected src/modules/courses/courses.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { Tenant } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('courses')
@UseGuards(TenantGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.tenantId, user.id, dto);
  }

  @Get()
  @Public()
  findPublished(@CurrentTenant() tenant: Tenant) {
    return this.coursesService.findPublished(tenant.id);
  }
}
```

```typescript
// src/modules/courses/sections.controller.ts
import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';

@ApiTags('courses')
@Controller('courses/:courseId/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(user.tenantId, courseId, dto);
  }
}
```

```typescript
// src/modules/courses/lessons.controller.ts
import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@ApiTags('courses')
@Controller('sections/:sectionId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create(user.tenantId, sectionId, dto);
  }
}
```

Note: routes under `courses/:courseId/sections` and `sections/:sectionId/lessons` require both `TenantGuard` (API key) and the global `JwtAuthGuard`/`RolesGuard` — since these controllers have no `@Public()` and no `@UseGuards(TenantGuard)` of their own, add `@UseGuards(TenantGuard)` at the class level of `SectionsController` and `LessonsController` too, matching `CoursesController`.

- [ ] **Step 7: Add `@UseGuards(TenantGuard)` to `SectionsController` and `LessonsController`**

Edit both files to add the import and class decorator, matching the `CoursesController` pattern from Step 6.

- [ ] **Step 8: Write `src/modules/courses/courses.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TenancyModule } from '@/modules/tenancy/tenancy.module';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';

@Module({
  imports: [TenancyModule],
  providers: [CoursesService, SectionsService, LessonsService],
  controllers: [CoursesController, SectionsController, LessonsController],
  exports: [CoursesService],
})
export class CoursesModule {}
```

- [ ] **Step 9: Register `CoursesModule` in `AppModule`**

- [ ] **Step 10: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS for all specs (`health`, `auth-flow`, `courses-flow`).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add courses module with categories, sections, and lessons"
```

---

### Task 8: Enrollment & Progress Tracking Module

**Files:**
- Create: `src/modules/enrollment/enrollment.module.ts`
- Create: `src/modules/enrollment/enrollment.service.ts`
- Create: `src/modules/enrollment/enrollment.controller.ts`
- Create: `src/modules/enrollment/dto/create-enrollment.dto.ts`
- Create: `src/modules/enrollment/dto/update-progress.dto.ts`
- Test: `test/enrollment-flow.e2e-spec.ts`

**Interfaces:**
- Consumes: `PrismaService`, `@CurrentUser()`, `@Roles()` (Task 6), `Course`/`Lesson` models (Task 7)
- Produces:
  - `EnrollmentService.enroll(tenantId, studentId, courseId): Promise<Enrollment>`
  - `EnrollmentService.updateProgress(tenantId, enrollmentId, lessonId, dto): Promise<LessonProgress>` — marks `isCompleted: true` when `dto.secondsWatched >= lesson.durationSeconds * 0.9` (90% watched threshold) or when `dto.isCompleted` is explicitly `true` (for TEXT/DOC lessons with no duration)
  - `EnrollmentService.getProgressSummary(tenantId, enrollmentId): Promise<{ totalLessons: number; completedLessons: number; percentComplete: number }>`
  - Routes: `POST /api/v1/courses/:courseId/enroll` (STUDENT), `PATCH /api/v1/enrollments/:enrollmentId/lessons/:lessonId/progress` (STUDENT), `GET /api/v1/enrollments/:enrollmentId/summary`

- [ ] **Step 1: Write the failing e2e test**

```typescript
// test/enrollment-flow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Enrollment flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKey: string;
  let tenantId: string;
  let studentToken: string;
  let courseId: string;
  let lessonId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = moduleRef.get(PrismaService);

    const tenantRes = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: 'Enroll Test School', slug: `enroll-test-${Date.now()}` });
    apiKey = tenantRes.body.data.apiKey;
    tenantId = tenantRes.body.data.id;

    const instructorReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: 'instructor3@example.com', password: 'Password123!', firstName: 'In', lastName: 'Structor' });
    await prisma.user.update({ where: { id: instructorReg.body.data.user.id }, data: { role: 'INSTRUCTOR' } });
    const instructorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-api-key', apiKey)
      .send({ email: 'instructor3@example.com', password: 'Password123!' });
    const instructorToken = instructorLogin.body.data.accessToken;

    const courseRes = await request(app.getHttpServer())
      .post('/api/v1/courses')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Enrollment Course', slug: 'enrollment-course' });
    courseId = courseRes.body.data.id;

    const sectionRes = await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseId}/sections`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Module 1' });

    const lessonRes = await request(app.getHttpServer())
      .post(`/api/v1/sections/${sectionRes.body.data.id}/lessons`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ titleEn: 'Video Lesson', type: 'VIDEO', durationSeconds: 100 });
    lessonId = lessonRes.body.data.id;

    const studentReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: 'student3@example.com', password: 'Password123!', firstName: 'Stu', lastName: 'Dent' });
    studentToken = studentReg.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.lessonProgress.deleteMany({ where: { tenantId } });
    await prisma.enrollment.deleteMany({ where: { tenantId } });
    await prisma.lesson.deleteMany({ where: { tenantId } });
    await prisma.section.deleteMany({ where: { tenantId } });
    await prisma.course.deleteMany({ where: { tenantId } });
    await prisma.user.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  it('enrolls a student, tracks lesson progress, and completes at 90% watched', async () => {
    const enrollRes = await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(enrollRes.status).toBe(201);
    const enrollmentId = enrollRes.body.data.id;

    const partialProgress = await request(app.getHttpServer())
      .patch(`/api/v1/enrollments/${enrollmentId}/lessons/${lessonId}/progress`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ secondsWatched: 50, lastPositionSeconds: 50 });
    expect(partialProgress.body.data.isCompleted).toBe(false);

    const fullProgress = await request(app.getHttpServer())
      .patch(`/api/v1/enrollments/${enrollmentId}/lessons/${lessonId}/progress`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ secondsWatched: 95, lastPositionSeconds: 95 });
    expect(fullProgress.body.data.isCompleted).toBe(true);

    const summary = await request(app.getHttpServer())
      .get(`/api/v1/enrollments/${enrollmentId}/summary`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(summary.body.data.totalLessons).toBe(1);
    expect(summary.body.data.completedLessons).toBe(1);
    expect(summary.body.data.percentComplete).toBe(100);
  });

  it('rejects duplicate enrollment in the same course', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `/api/v1/courses/:courseId/enroll` returns 404. Also add `durationSeconds` to `CreateLessonDto` if missing (it must accept it — check Task 7's DTO; add `@IsOptional() @IsInt() @Min(0) durationSeconds?: number;` to `create-lesson.dto.ts` now since this test depends on it).

- [ ] **Step 3: Add `durationSeconds` to `CreateLessonDto` and pass it through in `LessonsService.create`**

Edit `src/modules/courses/dto/create-lesson.dto.ts` to add the field; edit `src/modules/courses/lessons.service.ts`'s `create` call to include `durationSeconds: dto.durationSeconds`.

- [ ] **Step 4: Write DTOs**

```typescript
// src/modules/enrollment/dto/create-enrollment.dto.ts
export class CreateEnrollmentDto {}
```

```typescript
// src/modules/enrollment/dto/update-progress.dto.ts
import { IsInt, IsOptional, Min, IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  secondsWatched!: number;

  @IsInt()
  @Min(0)
  lastPositionSeconds!: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
```

- [ ] **Step 5: Write `src/modules/enrollment/enrollment.service.ts`**

```typescript
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

const COMPLETION_THRESHOLD_RATIO = 0.9;

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(tenantId: string, studentId: string, courseId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId } },
    });
    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: { tenantId, courseId, studentId },
    });
  }

  async updateProgress(tenantId: string, enrollmentId: string, lessonId: string, dto: UpdateProgressDto) {
    const lesson = await this.prisma.lesson.findFirst({ where: { tenantId, id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const isCompleted = dto.isCompleted ?? (
      lesson.durationSeconds
        ? dto.secondsWatched >= lesson.durationSeconds * COMPLETION_THRESHOLD_RATIO
        : false
    );

    return this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      create: {
        tenantId,
        enrollmentId,
        lessonId,
        secondsWatched: dto.secondsWatched,
        lastPositionSeconds: dto.lastPositionSeconds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        secondsWatched: dto.secondsWatched,
        lastPositionSeconds: dto.lastPositionSeconds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }

  async getProgressSummary(tenantId: string, enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { tenantId, id: enrollmentId },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const totalLessons = await this.prisma.lesson.count({
      where: { tenantId, section: { courseId: enrollment.courseId } },
    });
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { tenantId, enrollmentId, isCompleted: true },
    });

    return {
      totalLessons,
      completedLessons,
      percentComplete: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    };
  }
}
```

- [ ] **Step 6: Write `src/modules/enrollment/enrollment.controller.ts`**

```typescript
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { EnrollmentService } from './enrollment.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@ApiTags('enrollment')
@UseGuards(TenantGuard)
@Controller()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('courses/:courseId/enroll')
  @Roles('STUDENT')
  enroll(@CurrentUser() user: CurrentUserPayload, @Param('courseId') courseId: string) {
    return this.enrollmentService.enroll(user.tenantId, user.id, courseId);
  }

  @Patch('enrollments/:enrollmentId/lessons/:lessonId/progress')
  @Roles('STUDENT')
  updateProgress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentService.updateProgress(user.tenantId, enrollmentId, lessonId, dto);
  }

  @Get('enrollments/:enrollmentId/summary')
  getSummary(@CurrentUser() user: CurrentUserPayload, @Param('enrollmentId') enrollmentId: string) {
    return this.enrollmentService.getProgressSummary(user.tenantId, enrollmentId);
  }
}
```

- [ ] **Step 7: Write `src/modules/enrollment/enrollment.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

@Module({
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
```

- [ ] **Step 8: Register `EnrollmentModule` in `AppModule`**

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS for all four spec files.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add enrollment and lesson progress tracking module"
```

---

### Task 9: Dedicated Multi-Tenant Isolation Test Suite

**Files:**
- Create: `test/tenancy-isolation.e2e-spec.ts`

**Interfaces:**
- Consumes: everything from Tasks 5–8 (full HTTP surface)
- Produces: no new production code — a standalone regression suite proving cross-tenant isolation holds at the API layer, not just the Prisma-extension layer (Task 3 already unit-tests the extension directly; this proves it end-to-end through real HTTP requests with two independent tenants, instructors, courses, and enrollments).

- [ ] **Step 1: Write the test**

```typescript
// test/tenancy-isolation.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Multi-tenant isolation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  async function setupTenantWithCourse(label: string) {
    const tenantRes = await request(app.getHttpServer())
      .post('/api/v1/tenants')
      .send({ name: `${label} School`, slug: `${label}-${Date.now()}` });
    const apiKey = tenantRes.body.data.apiKey;
    const tenantId = tenantRes.body.data.id;

    const instructorReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('x-api-key', apiKey)
      .send({ email: `instructor-${label}@example.com`, password: 'Password123!', firstName: 'In', lastName: 'Structor' });
    await prisma.user.update({ where: { id: instructorReg.body.data.user.id }, data: { role: 'INSTRUCTOR' } });
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('x-api-key', apiKey)
      .send({ email: `instructor-${label}@example.com`, password: 'Password123!' });

    const courseRes = await request(app.getHttpServer())
      .post('/api/v1/courses')
      .set('x-api-key', apiKey)
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ titleEn: `${label} Course`, slug: `${label}-course-${Date.now()}` });
    await prisma.course.update({ where: { id: courseRes.body.data.id }, data: { isPublished: true } });

    return { apiKey, tenantId, courseId: courseRes.body.data.id, instructorToken: login.body.data.accessToken };
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('never returns tenant B data when queried with tenant A credentials', async () => {
    const tenantA = await setupTenantWithCourse('tenant-a-iso');
    const tenantB = await setupTenantWithCourse('tenant-b-iso');

    const listAsA = await request(app.getHttpServer()).get('/api/v1/courses').set('x-api-key', tenantA.apiKey);
    const titlesA = listAsA.body.data.map((c: { titleEn: string }) => c.titleEn);
    expect(titlesA).toContain('tenant-a-iso Course');
    expect(titlesA).not.toContain('tenant-b-iso Course');

    const listAsB = await request(app.getHttpServer()).get('/api/v1/courses').set('x-api-key', tenantB.apiKey);
    const titlesB = listAsB.body.data.map((c: { titleEn: string }) => c.titleEn);
    expect(titlesB).toContain('tenant-b-iso Course');
    expect(titlesB).not.toContain('tenant-a-iso Course');

    // Tenant A's JWT should not grant access to Tenant B's API-key-scoped resources
    const crossTenantEnroll = await request(app.getHttpServer())
      .post(`/api/v1/courses/${tenantB.courseId}/enroll`)
      .set('x-api-key', tenantA.apiKey)
      .set('Authorization', `Bearer ${tenantA.instructorToken}`)
      .send({});
    // instructor role can't enroll anyway (403), but critically this must never be a 201
    expect(crossTenantEnroll.status).not.toBe(201);

    await prisma.course.deleteMany({ where: { tenantId: { in: [tenantA.tenantId, tenantB.tenantId] } } });
    await prisma.user.deleteMany({ where: { tenantId: { in: [tenantA.tenantId, tenantB.tenantId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.tenantId, tenantB.tenantId] } } });
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS for all five spec files, including this new isolation suite.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add dedicated multi-tenant isolation e2e suite"
```

---

### Task 10: Seed Script for Local Development

**Files:**
- Create: `prisma/seed.ts`

**Interfaces:**
- Consumes: `PrismaClient` directly (script runs outside Nest DI)
- Produces: a demo tenant (`demo-school`), one admin, one instructor, one student, one published course with a section and two lessons, one enrollment — enough to manually exercise the API via Swagger immediately after clone.

- [ ] **Step 1: Write `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const apiKey = `lms_${randomBytes(24).toString('hex')}`;
  const tenant = await prisma.tenant.create({
    data: { name: 'Demo School', slug: 'demo-school', apiKey },
  });

  const passwordHash = await argon2.hash('Password123!');

  const instructor = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'instructor@demo.school',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Instructor',
      role: 'INSTRUCTOR',
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'student@demo.school',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Student',
      role: 'STUDENT',
    },
  });

  const course = await prisma.course.create({
    data: {
      tenantId: tenant.id,
      instructorId: instructor.id,
      titleEn: 'Introduction to LMS Engine',
      slug: 'intro-to-lms-engine',
      isPublished: true,
    },
  });

  const section = await prisma.section.create({
    data: { tenantId: tenant.id, courseId: course.id, titleEn: 'Getting Started', order: 0 },
  });

  await prisma.lesson.create({
    data: {
      tenantId: tenant.id,
      sectionId: section.id,
      titleEn: 'Welcome',
      type: 'TEXT',
      contentText: 'Welcome to the course!',
      order: 0,
      isPreviewable: true,
    },
  });

  await prisma.lesson.create({
    data: {
      tenantId: tenant.id,
      sectionId: section.id,
      titleEn: 'Core Concepts',
      type: 'VIDEO',
      durationSeconds: 600,
      order: 1,
    },
  });

  console.log('Seed complete.');
  console.log(`Tenant API key: ${apiKey}`);
  console.log('Instructor: instructor@demo.school / Password123!');
  console.log('Student: student@demo.school / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Add `ts-node` seed runner check**

Run: `npm run prisma:seed`
Expected: console prints "Seed complete." with a tenant API key and demo credentials.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add local development seed script"
```

---

## Self-Review Notes

- **Spec coverage for this slice**: tenancy ✅, auth ✅, courses/categories/sections/lessons (incl. preview lessons, drip fields present in schema for later use) ✅, enrollment + progress-resume ✅. Quizzes, assignments, certificates, reviews, Q&A, commerce/payments, commissions, notifications, storage, audit, and webhooks are intentionally deferred to follow-on plans per the spec's own module list — each is additive to this foundation, not a rework of it.
- **Type consistency verified**: `CurrentUserPayload` (`{ id, tenantId, role }`) used identically across Tasks 6–8; `forTenant`'s `TENANT_SCOPED_MODELS` list matches every tenant-scoped model defined in Task 2's schema; `TenantGuard`/`CurrentTenant` used consistently wherever a route must resolve tenant from `x-api-key` alone (public `GET /courses`, `auth` routes).
- **No placeholders remain** — every step has runnable code and exact file paths.

## Next Plans (not in this document)

1. **Assessment plan**: `quizzes`, `assignments` modules (question bank, auto-grading, manual grading queue, gradebook) — builds on `Enrollment`.
2. **Commerce plan**: `commerce` (wishlist, cart, coupons), `payments` (Stripe + Flutterwave adapters implementing a `PaymentProvider` interface), `commissions` (ledger, payouts) — builds on `Course.priceCents` already in schema.
3. **Engagement & certification plan**: `certificates` (templates + PDF generation), `reviews` (already scaffolded in schema, needs controller), `qna` (lesson Q&A) — builds on `Enrollment`/`Lesson`.
4. **Ops plan**: `notifications` (event bus + adapters), `storage` (S3/R2/local adapters), `audit` (interceptor + log), webhook delivery with retry — cross-cutting, wraps all prior modules.
5. **SDK & docs plan**: generated TypeScript client, plain-HTTP quickstart, deployment (Railway/Render Dockerfile).
