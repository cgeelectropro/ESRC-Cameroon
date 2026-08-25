# Quick Reference Card - Production Patterns

**Print this or save to your IDE favorites**

---

## 🎨 Design System Usage

### Import Design Tokens
```typescript
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/lib/design-system'
```

### Common Usage Patterns

**Colors**:
```typescript
// Brand primary
bg-[${COLORS.brand[700]}]        // Dark green
// Accent/CTA
bg-[${COLORS.accent[500]}]       // Gold
// Semantic
text-[${COLORS.semantic.error}]  // Red for errors
// Neutral
text-[${COLORS.neutral[600]}]    // Mid gray
```

**Spacing**:
```typescript
p-[${SPACING[4]}]                // Padding 16px
m-[${SPACING[3]}]                // Margin 12px
gap-[${SPACING[2]}]              // Gap 8px
```

**Border Radius**:
```typescript
rounded-[${RADIUS.md}]           // 12px radius
rounded-[${RADIUS.lg}]           // 16px radius
rounded-[${RADIUS.full}]         // Pill/circle
```

**Shadows**:
```typescript
shadow-[${SHADOWS.md}]           // Medium elevation
shadow-[${SHADOWS.lg}]           // Large elevation
hover:shadow-[${SHADOWS.xl}]     // Elevation on hover
```

**Transitions**:
```typescript
transition-all duration-[${TRANSITIONS.base}] ease-[${TRANSITIONS.easing.ease}]
```

---

## 🖼️ Image Service Usage

### Import Image Service
```typescript
import { getCourseImage, getAvatarImage, getEventImage, getImageSizes, handleImageError } from '@/lib/image-service'
```

### Render Course Image
```typescript
'use client'
import Image from 'next/image'
import { getCourseImage, getImageSizes, handleImageError } from '@/lib/image-service'

export function CourseCard({ course }) {
  const image = getCourseImage(course.id, course.thumbnail)
  
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={getImageSizes('course')}
      onError={(e) => handleImageError(e, image.blurPlaceholder)}
    />
  )
}
```

### Render User Avatar
```typescript
const avatarImage = getAvatarImage(userId, user.avatar, user.name)

<Image
  src={avatarImage.src}
  alt={avatarImage.alt}
  width={avatarImage.width}
  height={avatarImage.height}
  onError={(e) => handleImageError(e, avatarImage.blurPlaceholder)}
/>
```

### Render Event Image
```typescript
const eventImage = getEventImage(eventId, event.thumbnail)

<Image
  src={eventImage.src}
  alt={eventImage.alt}
  fill
  sizes={getImageSizes('event')}
  onError={(e) => handleImageError(e, eventImage.blurPlaceholder)}
/>
```

---

## ⚠️ Error Boundary Usage

### Import Error Boundary
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'
```

### Wrap Page
```typescript
<ErrorBoundary level="page" onError={(err) => console.error(err)}>
  <PageContent />
</ErrorBoundary>
```

### Wrap Section
```typescript
<ErrorBoundary level="section">
  <DataHeavyComponent />
</ErrorBoundary>
```

### With Custom Fallback
```typescript
<ErrorBoundary 
  level="component"
  fallback={(error, retry) => (
    <div className="p-4 bg-red-50 rounded-lg">
      <h3>Error: {error.message}</h3>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

---

## ⏳ Skeleton Loading

### Import Skeleton
```typescript
import { Skeleton } from '@/components/ui/skeleton'
```

### Create Loading State
```typescript
export function CourseCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-video rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
```

### Use in Grid
```typescript
export function CourseGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

---

## 🔍 Common Commands

```powershell
# Type check
pnpm tsc --noEmit

# Lint code
pnpm lint

# Build production
pnpm build

# Start dev server
pnpm dev

# Format code
pnpm format
```

---

## 🚫 NEVER DO THIS

```typescript
// ❌ Hardcoded image URLs
<Image src="https://images.unsplash.com/..." />

// ❌ Magic numbers
className="p-4 gap-3 rounded-md"

// ❌ Inline colors
className="bg-[#1B5E20] text-[#F9A825]"

// ❌ No error handling
<DataComponent /> // What if it errors?

// ❌ No image fallback
<Image src={dynamic_url} /> // What if URL breaks?

// ❌ TypeScript any
const data: any = fetchData() // FORBIDDEN
```

---

## ✅ DO THIS INSTEAD

```typescript
// ✅ Use image service
const image = getCourseImage(courseId, url)
<Image src={image.src} onError={...} />

// ✅ Use design system
className={`p-[${SPACING[4]}] gap-[${SPACING[3]}]`}

// ✅ Use design tokens
className={`bg-[${COLORS.brand[700]}] text-[${COLORS.accent[500]}]`}

// ✅ Wrap in error boundary
<ErrorBoundary level="section">
  <DataComponent />
</ErrorBoundary>

// ✅ Use typed imports
const data: APIResponse = await apiClient.fetch(...)

// ✅ Always provide fallback
<Image src={image.src} onError={(e) => handleImageError(e)} />
```

---

## 📦 File Structure Reference

```
lib/
├── design-system.ts      ← Design tokens (COLORS, SPACING, etc.)
├── image-service.ts      ← Image handling (getCourseImage, etc.)
├── api-client.ts         ← HTTP requests (apiClient.*)
├── types.ts              ← TypeScript interfaces (Course, User, etc.)
├── utils.ts              ← Utility functions (cn, formatDate, etc.)
└── auth-storage.ts       ← Token persistence

components/
├── ErrorBoundary.tsx     ← Error handling wrapper
├── ui/
│   ├── skeleton.tsx       ← Loading state
│   ├── button.tsx         ← Button component
│   └── ...
├── courses/
│   ├── CourseCard.tsx     ← Course preview (uses image service)
│   └── CourseGrid.tsx     ← Course grid
└── ...

public/
└── images/
    ├── placeholders/      ← SVG fallbacks
    │   ├── course-default.svg
    │   ├── avatar-default.svg
    │   ├── event-default.svg
    │   ├── thumbnail-default.svg
    │   └── profile-default.svg
    ├── backgrounds/       ← Background images
    └── icons/             ← Brand icons
```

---

## 🎯 Refactoring Checklist

When refactoring a component:

- [ ] Replace hardcoded URLs with image service
- [ ] Replace magic numbers with SPACING/RADIUS
- [ ] Replace hardcoded colors with COLORS
- [ ] Add loading state (skeleton)
- [ ] Wrap in ErrorBoundary if needed
- [ ] Test on mobile (320px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1440px)
- [ ] Test dark mode
- [ ] Run TypeScript check
- [ ] Run linter

---

## 📖 Documentation Files

**For detailed reference**:
- `PRODUCTION_DESIGN_SYSTEM.md` - Complete design guide
- `IMPLEMENTATION_GUIDE.md` - Code examples
- `PRODUCTION_DEPLOYMENT_ROADMAP.md` - Implementation timeline
- `lib/design-system.ts` - Token definitions
- `lib/image-service.ts` - Image service API

---

## 🆘 Help & Support

**Need help?**
1. Check the relevant documentation file
2. Look at existing implementations in components/
3. Review the imports and types in lib/
4. Run `pnpm tsc --noEmit` to check for errors
5. Check browser console for runtime errors

**Found a bug?**
1. Create minimal reproducible example
2. Check if error boundary caught it
3. Enable error logging to Sentry
4. File issue with reproduction steps

---

**Last Updated**: March 6, 2026  
**Status**: Production Ready ✅
