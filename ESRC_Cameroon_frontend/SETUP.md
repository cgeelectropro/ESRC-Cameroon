# ESRC Cameroon - Setup & Installation Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (Phase 1 - to be replaced with NestJS in Phase 2)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure Overview

- **`/app`** - Next.js App Router pages and API routes
- **`/components`** - Reusable React components
- **`/lib`** - Utilities, types, and API client
- **`/public`** - Static assets (images, icons, etc.)
- **`tailwind.config.ts`** - Tailwind CSS configuration with ESRC design tokens
- **`app/globals.css`** - Global styles and custom Tailwind components
- **`ARCHITECTURE.md`** - Detailed architecture documentation

## Key Files & Their Purpose

### Core Configuration
- **`app/layout.tsx`** - Root layout with font configuration and providers
- **`tailwind.config.ts`** - Custom colors and design tokens
- **`app/globals.css`** - Global styles and component utilities

### Types & Constants
- **`lib/types.ts`** - All TypeScript interfaces and types
- **`lib/constants.ts`** - App-wide constants and configuration
- **`lib/api-client.ts`** - Central API client for all server calls

### Layout Components
- **`components/layout/Navbar.tsx`** - Sticky navigation bar
- **`components/layout/Footer.tsx`** - Site footer
- **`components/layout/Sidebar.tsx`** - Dashboard sidebar (coming soon)

### Homepage Components
- **`components/home/HeroSection.tsx`** - Hero banner with CTA
- **`components/home/ImpactStatsBar.tsx`** - Animated impact statistics
- **`components/home/FeaturedCourses.tsx`** - Course showcase with filtering
- **`components/home/HowItWorks.tsx`** - 4-step process visualization

### Reusable Shared Components
- **`components/shared/RatingStars.tsx`** - Star rating display
- **`components/shared/Badge.tsx`** - Badge component with variants
- **`components/shared/ProgressBar.tsx`** - Progress indicator

### Course Components
- **`components/courses/CourseCard.tsx`** - Reusable course card

## API Routes

All API routes should return `Response.json()` with this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Existing Routes

- `GET /api/courses` - Fetch all courses
- `GET /api/events` - Fetch upcoming events
- `GET /api/research/publications` - Fetch research publications
- `GET /api/impact/stats` - Fetch impact statistics
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session
- `GET /api/opportunities` - Fetch job/fellowship opportunities

**Important:** All routes currently return mock data. Replace with Supabase queries in Phase 1, then NestJS calls in Phase 2.

## Development Workflow

### Creating a New Page

1. Create file in appropriate route group under `/app`
2. Import layout components (Navbar, Footer)
3. Add your content components
4. Use `apiClient` for any data fetching

Example:
```tsx
// app/(public)/about/page.tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{/* Your content */}</main>
      <Footer />
    </div>
  )
}
```

### Creating a New Component

1. Choose appropriate subdirectory in `/components`
2. Use Tailwind for styling with design tokens
3. Import types from `@/lib/types`
4. Export as named export

Example:
```tsx
// components/shared/MyComponent.tsx
import type { Course } from '@/lib/types'

interface MyComponentProps {
  course: Course
}

export function MyComponent({ course }: MyComponentProps) {
  return (
    <div className="bg-esrc-green-50 p-4 rounded-lg">
      <h3 className="font-display text-esrc-dark">{course.title}</h3>
    </div>
  )
}
```

### Creating a New API Route

1. Create file at `/app/api/[resource]/route.ts`
2. Export async functions for HTTP methods
3. Use mock data initially
4. Add to `apiClient` in `/lib/api-client.ts`

Example:
```tsx
// app/api/courses/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Replace with Supabase query
  return Response.json({
    success: true,
    data: { id: params.id, title: 'Course Title' }
  })
}
```

## Styling Guide

### Using Design Tokens

Tailwind is configured with custom colors. Use them consistently:

```tsx
// Good
<div className="bg-esrc-green-50 border border-esrc-green-200">
  <h2 className="text-esrc-dark font-display">Title</h2>
  <p className="text-esrc-mid">Description</p>
</div>

// Avoid
<div className="bg-green-50 border border-green-200">
  <h2 className="text-black">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

### Predefined Component Classes

```tsx
// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-gold">CTA</button>
<button className="btn-outline">Outline</button>

// Cards
<div className="card-hover rounded-xl bg-white shadow-sm">
  {/* Content */}
</div>

// Sections
<section className="section-padding bg-esrc-light">
  <div className="container-width">
    {/* Content */}
  </div>
</section>
```

### Responsive Design

Follow Tailwind's mobile-first approach:

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Testing Locally

### Test Different Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

Use browser DevTools to simulate different screen sizes.

### Test Dark Mode
Toggle dark mode in the navbar to ensure styles work in both light and dark modes.

### Test Language Switching
Click the language switcher to test bilingual UI (once i18n is fully implemented).

## Common Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm tsc --noEmit
```

## Troubleshooting

### Components not rendering?
- Check import paths use `@/` alias
- Verify component is exported as named export
- Check for TypeScript errors in terminal

### Styling not applying?
- Ensure Tailwind classes are spelled correctly
- Check custom colors exist in `tailwind.config.ts`
- Verify class is not scoped by CSS modules

### API calls failing?
- Check API route exists at `/app/api/[route]/route.ts`
- Verify URL in `apiClient` matches route
- Check for CORS issues in browser console

## Next Steps

1. **Set up Supabase** - Connect database for Phase 1
2. **Implement Authentication** - User login/register flows
3. **Build Remaining Pages** - Follow folder structure
4. **Add Integrations** - Payment, email, analytics
5. **Deploy to Vercel** - Production setup

## Support

For questions or issues:
- Check ARCHITECTURE.md for design patterns
- Review existing components for examples
- Refer to shadcn/ui docs for component customization
