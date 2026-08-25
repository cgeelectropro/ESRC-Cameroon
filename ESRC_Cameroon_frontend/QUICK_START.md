# Quick Start Guide - ESRC Cameroon

## Installation (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open browser
open http://localhost:3000
```

That's it! The app is fully functional with mock data.

---

## What You Can Do Right Now

### Explore Pages
- **Homepage**: http://localhost:3000 - Full featured with hero, stats, courses, testimonials
- **Courses**: http://localhost:3000/courses - Browse & filter courses
- **Course Detail**: http://localhost:3000/courses/1 - Full course page
- **About**: http://localhost:3000/about - Company mission & impact
- **Events**: http://localhost:3000/events - Event listings
- **Research**: http://localhost:3000/research - Publications hub
- **Opportunities**: http://localhost:3000/opportunities - Jobs & funding

### User Flows
- **Login**: http://localhost:3000/login - Fully styled login form
- **Register**: http://localhost:3000/register - Registration with country/role
- **Dashboard**: http://localhost:3000/dashboard - Main user dashboard (requires login mock)
- **My Courses**: http://localhost:3000/dashboard/my-courses - Course progress
- **Certificates**: http://localhost:3000/dashboard/certificates - Certificate display
- **Profile**: http://localhost:3000/dashboard/profile - User settings

### Features to Test
✅ **Responsive Design** - Resize browser from 320px to 1440px
✅ **Language Switcher** - Click globe icon to toggle EN/FR
✅ **Navigation** - All links work and pages load instantly
✅ **Filters** - Course catalog has working filters
✅ **Forms** - Contact, login, register forms are interactive
✅ **Components** - Cards, buttons, badges, progress bars styled

---

## File Structure Quick Reference

```
/app/[locale]              # All pages with i18n routing
  /page.tsx               # Homepage
  /(auth)                 # Authentication pages
  /(public)               # Public pages (about, courses, etc)
  /(dashboard)            # User dashboard pages

/components               # Reusable components
  /layout                 # Navbar, Footer, Sidebar
  /home                   # Homepage sections
  /courses                # Course-related components
  /shared                 # RatingStars, Badge, ProgressBar

/lib
  /api-client.ts          # Central API client (20+ methods)
  /types.ts               # All TypeScript types
  /utils.ts               # Helper functions (250+ lines)
  /constants.ts           # Site configuration

/app/api                  # API routes with mock data
  /auth/...               # Authentication endpoints
  /courses/...            # Course endpoints
  /research/...           # Research endpoints
  /user/...               # User profile endpoints

/messages                 # i18n translations
  /en.json                # English translations
  /fr.json                # French translations

/public                   # Static assets
```

---

## Making Changes

### Add a New Page
1. Create file: `/app/[locale]/(section)/page-name/page.tsx`
2. Import components from `/components`
3. Use `useTranslations()` for i18n
4. Page is auto-routed at `/{locale}/page-name`

### Add a New Component
1. Create file: `/components/section/ComponentName.tsx`
2. Export function component
3. Use Tailwind classes with ESRC colors
4. Import in page and use

### Update Translations
1. Edit `/messages/en.json` or `/messages/fr.json`
2. Add new key-value pair
3. Use in component: `const t = useTranslations('section'); t('key')`

### Connect Real Data
1. Update `/lib/api-client.ts` methods to call your backend
2. Replace mock data in `/app/api/[route]/route.ts`
3. Front components already configured to use API client!

---

## Color System Quick Ref

```css
/* Primary Green */
esrc-green-900: #1B5E20 (darkest)
esrc-green-700: #2E7D32 (primary buttons)
esrc-green-500: #4CAF50 (lighter accent)
esrc-green-100: #E8F5E9 (backgrounds)
esrc-green-50:  #F1F8E9 (subtle backgrounds)

/* Gold Accent */
esrc-gold-700: #F57F17  (darker hover)
esrc-gold-500: #F9A825 (CTA buttons)
esrc-gold-100: #FFFDE7 (light backgrounds)

/* Neutrals */
esrc-earth: #795548
esrc-dark:  #1A1A1A (body text)
esrc-mid:   #555555 (secondary text)
esrc-light: #F5F5F5 (page background)
```

### Button Variants
```jsx
// Primary (green)
<Button className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white">
  Action
</Button>

// Gold CTA
<Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-bold">
  Call to Action
</Button>

// Outline
<Button variant="outline" className="border-esrc-green-700 text-esrc-green-700 hover:bg-esrc-green-50">
  Secondary
</Button>
```

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm lint             # Check code quality

# Dependencies
pnpm add package-name     # Add package
pnpm update              # Update packages
```

---

## API Integration Ready

The entire app is structured to work with any backend:

```typescript
// Before: Mock data (current state)
GET /api/courses
→ Returns mock course array

// After: Supabase integration
GET /api/courses
→ Calls Supabase
→ Returns real data

// Later: NestJS migration
GET /api/courses
→ Calls NestJS backend
→ Returns real data

// Frontend code: UNCHANGED ✅
```

All components already use the central API client - just update `/lib/api-client.ts` and you're done!

---

## Deployment (One Click)

### To Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# View at: https://your-project.vercel.app
```

### Environment Variables in Vercel
Settings → Environment Variables → Add:
```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

---

## Next Steps

1. **Test Everything**
   - Click through all pages
   - Test filters, forms, navigation
   - Check mobile responsiveness

2. **Connect Backend**
   - Set up Supabase / NestJS
   - Update `/lib/api-client.ts`
   - Update `/app/api/` routes
   - Test with real data

3. **Add Real Functionality**
   - User authentication
   - Course enrollment
   - Payment processing
   - Email notifications

4. **Customize**
   - Update content in pages
   - Add your data
   - Adjust colors/styling
   - Configure email templates

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
pnpm dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

### TypeScript Errors
- Run `pnpm build` to see all errors
- Most are type mismatches - check `/lib/types.ts`
- ESC key to dismiss overlay

### Styling Issues
- Check if Tailwind classes exist
- Use custom colors: `text-esrc-green-700`
- Verify spacing: `px-4 py-3` not `p-[16px]`

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `/lib/api-client.ts` | All API calls |
| `/lib/types.ts` | Type definitions |
| `/lib/constants.ts` | Configuration |
| `/lib/utils.ts` | Helper functions |
| `Navbar.tsx` | Navigation bar |
| `Footer.tsx` | Footer component |
| `tailwind.config.ts` | Colors & styling |
| `/messages/*.json` | Translations |

---

## Support

- **Documentation**: See `IMPLEMENTATION_COMPLETE.md` for full details
- **Architecture**: See `ARCHITECTURE.md` for design patterns
- **Code**: All code is self-documented with comments

---

**You're all set! Start with `pnpm dev` and explore the platform! 🚀**
