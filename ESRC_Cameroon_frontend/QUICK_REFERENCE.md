# ESRC Cameroon - Quick Reference Guide

## 🚀 30-Second Start

```bash
pnpm install          # Install dependencies
cp .env.example .env.local  # Set up env
pnpm dev              # Start server at http://localhost:3000
```

---

## 📁 Where Things Are

| What | Where |
|------|-------|
| Homepage | `/app/page.tsx` |
| Navigation | `components/layout/Navbar.tsx` |
| Footer | `components/layout/Footer.tsx` |
| API Calls | `lib/api-client.ts` |
| Data Types | `lib/types.ts` |
| Styles/Colors | `tailwind.config.ts` + `app/globals.css` |
| Constants | `lib/constants.ts` |
| Utilities | `lib/utils.ts` |
| API Endpoints | `app/api/[resource]/route.ts` |

---

## 🎨 Design Tokens

### Colors (Use These!)
```tailwind
bg-esrc-green-900     /* Deep green */
bg-esrc-green-700     /* Medium green */
bg-esrc-gold-500      /* Gold accent */
text-esrc-dark        /* Body text */
text-esrc-mid         /* Secondary text */
```

### Button Classes
```tailwind
.btn-primary    /* Green button */
.btn-gold       /* Gold CTA button */
.btn-outline    /* Outline button */
```

### Spacing
```tailwind
.section-padding      /* Standard section padding */
.container-width      /* Max-width container */
.card-hover           /* Card hover effect */
```

---

## ⚡ Common Tasks

### Create a New Page
```tsx
// app/(public)/my-page/page.tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function MyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Content here */}
      </main>
      <Footer />
    </div>
  )
}
```

### Create a Component
```tsx
// components/my-component/MyComponent.tsx
interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="bg-esrc-green-50 p-4 rounded-xl">
      <h2 className="font-display text-esrc-dark">{title}</h2>
    </div>
  )
}
```

### Create an API Route
```typescript
// app/api/my-endpoint/route.ts
export async function GET() {
  // TODO: Add Supabase query
  return Response.json({
    success: true,
    data: { message: 'Hello' }
  })
}
```

### Fetch Data
```tsx
import { apiClient } from '@/lib/api-client'

const result = await apiClient.getCourses()
if (result.success) {
  console.log(result.data)  // Array of courses
}
```

### Use Utilities
```tsx
import { formatCurrency, formatDate, truncateText } from '@/lib/utils'

formatCurrency(15000, 'XAF')           // "FCFA 15,000.00"
formatDate('2024-03-15')               // "Mar 15, 2024"
truncateText('Long text...', 10)       // "Long text..."
```

---

## 📝 TypeScript Types

```tsx
import type { 
  Course, 
  User, 
  Event, 
  Publication,
  CourseLevel,
  Currency 
} from '@/lib/types'

// Example
const course: Course = {
  id: '1',
  title: 'My Course',
  // ... other fields
}
```

---

## 🧩 Common Components

### RatingStars
```tsx
<RatingStars rating={4.5} size={16} showLabel={true} />
```

### Badge
```tsx
<Badge variant="primary" size="md">New</Badge>
```

### ProgressBar
```tsx
<ProgressBar value={67} color="green" showLabel={true} />
```

### CourseCard
```tsx
<CourseCard course={courseData} />
```

---

## 🔌 API Endpoints

### Current Endpoints
```
GET  /api/courses                     # All courses
GET  /api/courses/[id]                # Single course
GET  /api/events                      # All events
GET  /api/research/publications       # Publications
GET  /api/opportunities               # Opportunities
GET  /api/impact/stats                # Impact stats
POST /api/auth/login                  # Login
GET  /api/auth/session                # Get session
```

### Usage
```tsx
const result = await apiClient.getCourses()
const result = await apiClient.login('email@example.com', 'password')
```

---

## 🎯 Component Structure

### Layout Pattern
```tsx
export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Your content */}
      </main>
      <Footer />
    </div>
  )
}
```

### Section Pattern
```tsx
<section className="section-padding bg-esrc-light">
  <div className="container-width">
    <h2 className="font-display text-4xl mb-6">Section Title</h2>
    {/* Content */}
  </div>
</section>
```

### Grid Pattern
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-xl p-4 card-hover">
      {/* Card content */}
    </div>
  ))}
</div>
```

---

## 🎨 Responsive Breakpoints

```tailwind
/* Mobile First */
text-base           /* Default (mobile) */
md:text-lg          /* Tablet (768px+) */
lg:text-xl          /* Desktop (1024px+) */

/* Common sizes */
grid-cols-1         /* 1 column mobile */
md:grid-cols-2      /* 2 columns tablet */
lg:grid-cols-3      /* 3 columns desktop */
```

---

## 🔍 Debugging

### Check for Errors
```bash
pnpm tsc --noEmit    # TypeScript errors
pnpm lint            # Linting issues
```

### Browser DevTools
- F12 to open DevTools
- Console tab for errors
- Network tab for API calls
- Elements tab for DOM structure

### Common Issues

| Issue | Solution |
|-------|----------|
| Styles not applying | Check class spelling, verify color token exists |
| Import fails | Use `@/` alias, check file path |
| API call fails | Check route exists, verify URL matches |
| Component not rendering | Check export, verify import path |

---

## 📚 Documentation Files

1. **README.md** - Project overview
2. **ARCHITECTURE.md** - Design patterns (282 lines)
3. **SETUP.md** - Development setup (288 lines)
4. **DEVELOPER_CHECKLIST.md** - Tasks to complete (349 lines)
5. **BUILD_SUMMARY.md** - What's been built (348 lines)
6. **QUICK_REFERENCE.md** - This file

---

## 🚀 Next Immediate Steps

1. ✅ **Read docs** - Start with ARCHITECTURE.md (5 mins)
2. ✅ **Set up** - Run `pnpm install && pnpm dev` (2 mins)
3. 🔄 **Verify** - Check homepage at http://localhost:3000 (1 min)
4. 📝 **Understand** - Review homepage code in `/app/page.tsx` (10 mins)
5. 🏗️ **Build** - Start with authentication pages (per DEVELOPER_CHECKLIST.md)

---

## 💡 Pro Tips

- Use `apiClient` for all data fetching (never direct DB access)
- Apply design tokens consistently (no hardcoded colors)
- Test responsive design at 375px, 768px, 1440px
- Keep components reusable and small
- Use TypeScript interfaces for all data
- Reference existing components for patterns

---

## 🆘 Quick Help

**Can't find something?**
- Check `/app` for pages
- Check `/components` for UI components
- Check `/lib` for utilities and types
- Check `/app/api` for backend routes

**Need design colors?**
- Open `tailwind.config.ts` and look at colors
- Or check `app/globals.css` for tokens

**Forgot API structure?**
- Check `lib/api-client.ts` for methods
- Check `lib/types.ts` for data types

**Want component example?**
- Look at `components/courses/CourseCard.tsx`
- Or `components/home/HeroSection.tsx`

---

## 📞 File Quick Links

**When you need to...**
| Need | File |
|------|------|
| Add a page | Create in `/app/(route)/page.tsx` |
| Add a component | Create in `/components/(category)/FileName.tsx` |
| Add an API | Create in `/app/api/resource/route.ts` |
| Add a type | Edit `/lib/types.ts` |
| Add a constant | Edit `/lib/constants.ts` |
| Add a utility | Edit `/lib/utils.ts` |
| Update styles | Edit `app/globals.css` or `tailwind.config.ts` |

---

**Built with ❤️ for ESRC Cameroon**

Ready to code? Start with `pnpm dev`! 🚀
