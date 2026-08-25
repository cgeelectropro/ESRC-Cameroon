# LMS Engine — Standalone E-Learning Microservice Design

**Date**: 2026-08-10
**Status**: Approved for implementation planning
**Author**: Design session with Claude Code

## Purpose

Extract the "e-learning platform" capability into a standalone, reusable microservice — inspired by Tutor LMS (WordPress) for the instructor/course-management/monetization feature set, and by Udemy for marketplace/consumption UX patterns (preview lessons, Q&A, wishlist/cart, coupons, progress resume).

The goal: every future school/education project can get a full-featured LMS backend by pointing at this service and building only its own UI, instead of rebuilding course/quiz/certificate/payment logic each time.

## Hard Constraints

- **Built in a brand-new, independent git repository** — `lms-engine`, sibling to the ESRC Cameroon project folder.
- **The existing ESRC Cameroon codebase (frontend and backend) is not modified, read into the new repo, or coupled to it in any way.** Patterns are reused conceptually; no files or code are copied across. ESRC's live functionality must remain completely unaffected.
- Consumed purely over HTTP (REST + webhooks) so any frontend or backend technology (Next.js, Flutter, WordPress/PHP, plain HTML) can integrate.

## Tech Stack

- **NestJS** (module system suits many independent LMS feature domains cleanly)
- **Prisma** + **PostgreSQL** (migration safety for a schema that will grow significantly over time)
- **Redis + BullMQ** (webhook retry queue, background jobs: certificate PDF generation, video processing hooks)
- Deployed via Dockerfile to Railway or Render, same pragmatic pattern as the current ESRC backend

## Module Breakdown

| Module | Responsibility |
|---|---|
| `tenancy` | `Tenant` record; `tenantId` auto-scoping via Prisma Client Extension on every query |
| `auth` | Registration/login, JWT issue + refresh, role system (SUPER_ADMIN/ADMIN/INSTRUCTOR/STUDENT); pluggable `AuthTokenVerifier` strategy so a host app's externally-issued tokens can be trusted later without rework |
| `users` | Profiles for admins/instructors/students |
| `courses` | Courses, categories, sections, lessons (video/text/doc), drip-content scheduling, preview lessons, course versioning ("content updated" flag) |
| `enrollment` | Enrollment records, per-lesson progress (percentage/seconds watched, resume position), completion state |
| `quizzes` | Quiz + question bank (MCQ, true/false, short answer, matching), timed attempts, auto-grading |
| `assignments` | File-upload assignments, manual grading queue, gradebook |
| `certificates` | Certificate templates, PDF generation + issuance record |
| `reviews` | Course ratings/reviews |
| `qna` | Lesson-level Q&A threads (distinct from course reviews), upvoting |
| `commerce` | Wishlist, cart, coupons (percent/fixed, expiry, usage limits, per-course or platform-wide), orders |
| `payments` | Stripe + Flutterwave checkout integration, webhook verification, `PaymentProvider` interface |
| `commissions` | Instructor revenue-split ledger, payout requests, admin payout approval, earnings/enrollment reporting endpoints |
| `notifications` | Internal event bus (`enrollment.created`, `certificate.issued`, `payment.succeeded`, etc.) → pluggable `NotificationAdapter` (email/webhook/log) |
| `storage` | `StorageProvider` interface — S3/R2/local adapters for lesson media, certificates, assignment uploads |
| `audit` | Generic `AuditLog` (actor, action, entity, before/after, timestamp) + interceptor on sensitive mutations |
| `admin` | Instructor approval workflow, platform-wide settings |

Every module depends on external services only through interfaces (`PaymentProvider`, `NotificationAdapter`, `StorageProvider`, `AuthTokenVerifier`) so a consuming deployment can swap implementations via configuration alone.

## Data Model (Prisma, grouped)

- **Tenancy & Identity**: `Tenant`, `User` (role, tenantId), `InstructorProfile`, `InstructorApprovalRequest`
- **Catalog**: `Course` (with `updatedAt`-driven content-refresh flag), `CourseCategory`, `Section`, `Lesson` (type: VIDEO/TEXT/DOC; `isPreviewable`; drip fields `availableAfterDays`/`availableAt`)
- **Learning**: `Enrollment`, `LessonProgress` (percentage/seconds watched, last position, completion state), `LessonNote`, `Review`
- **Engagement**: `LessonQuestion`, `LessonAnswer` (Udemy-style per-lesson Q&A)
- **Assessment**: `Quiz`, `Question` (MCQ/TRUE_FALSE/SHORT_ANSWER/MATCHING), `QuizAttempt`, `Assignment`, `AssignmentSubmission`, `Grade`
- **Certification**: `CertificateTemplate`, `Certificate`
- **Commerce**: `Wishlist`, `Cart`, `Coupon`, `Order`, `Payment` (provider: STRIPE/FLUTTERWAVE), `CommissionLedgerEntry`, `PayoutRequest`
- **Ops**: `AuditLog`, `WebhookEndpoint`, `WebhookDeliveryAttempt`, `NotificationEvent`

All tenant-scoped models carry `tenantId` with a composite index. A Prisma Client Extension injects the `tenantId` filter automatically from request-scoped context, eliminating manual per-query filtering as a source of cross-tenant data leaks.

## API & Integration Shape

- REST, `/api/v1/...`, resources nested logically (`/courses/:id/sections/:id/lessons`)
- Consistent response envelope: `{ success, data, timestamp }` (same pattern validated in ESRC's backend)
- Swagger/OpenAPI auto-generated from decorators; exported as static `openapi.json`
- Two credential types per tenant: server-to-server **API key** (privileged/provisioning calls) and end-user **JWT** (issued after login/register, used directly by frontends)
- **Webhooks out**: HMAC-signed `POST` to registered `WebhookEndpoint` URLs on domain events, exponential-backoff retry via BullMQ, every attempt recorded in `WebhookDeliveryAttempt`

## Deployment Model

Single codebase supports two deployment shapes without code changes:
- **Multi-tenant shared instance** — one deployment serves many projects/schools, tenancy tables actively partition data
- **Single-tenant dedicated instance** — one deployment per project, tenancy tables present but effectively single-row

Environment-specific config (Stripe/Flutterwave keys, storage credentials, JWT secrets, webhook signing secret) lives in `.env`, validated at boot via schema so misconfiguration fails fast.

## Testing Strategy

- Jest unit tests per service, prioritizing business logic with silent-failure risk: grading rules, commission math, tenancy scoping
- `jest-e2e` integration tests against a Dockerized test Postgres for critical flows: enroll → complete lessons → pass quiz → issue certificate; purchase → webhook → commission ledger entry
- Dedicated multi-tenant isolation test suite: create two tenants, assert zero cross-tenant visibility anywhere in the API

## Docs & SDK

- Swagger UI at `/api/docs` + exported `openapi.json`
- Generated TypeScript client SDK (via `openapi-typescript` + thin fetch wrapper), published as a local/private package, mirroring the `apiClient` pattern from ESRC's frontend
- Plain-HTTP quickstart README (env setup, tenant provisioning, webhook registration) for non-TypeScript consumers (WordPress/PHP, Flutter, etc.)

## Explicitly Out of Scope for v1

Subscription/recurring billing, live/scheduled cohort classes, native mobile push notifications (webhooks can trigger these downstream), AI features. None of these require breaking changes to the module boundaries above when added later.
