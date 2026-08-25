# ESRC Cameroon - Developer Checklist

## 🚀 Getting Started

### Initial Setup
- [ ] Read `ARCHITECTURE.md` to understand the design patterns
- [ ] Read `SETUP.md` for detailed setup instructions
- [ ] Review `BUILD_SUMMARY.md` to understand what's been built
- [ ] Run `pnpm install` to install dependencies
- [ ] Create `.env.local` with required environment variables
- [ ] Run `pnpm dev` and verify homepage loads at http://localhost:3000

### Verify Current State
- [ ] Homepage loads with all sections (Hero, Stats, Courses, HowItWorks)
- [ ] Navbar is sticky and responsive
- [ ] Footer displays properly
- [ ] Mobile menu works in Navbar
- [ ] Impact stats animate when scrolling
- [ ] Course cards display in grid (responsive columns)
- [ ] Dark mode toggle works
- [ ] No console errors

---

## 📋 Short-Term Tasks (Week 1-2)

### Phase 1A: Auth System
- [ ] Create `/app/(auth)/login/page.tsx`
  - [ ] Email/password form
  - [ ] Form validation
  - [ ] Connect to `/api/auth/login`
  - [ ] Show success/error messages
- [ ] Create `/app/(auth)/register/page.tsx`
  - [ ] Multi-field form
  - [ ] Password strength indicator
  - [ ] Terms acceptance checkbox
  - [ ] Connect to `/api/auth/register`
- [ ] Create `/app/(auth)/forgot-password/page.tsx`
- [ ] Update Navbar to show user state (logged in/out)
- [ ] Add logout functionality

### Phase 1B: Course Pages
- [ ] Create `/app/(public)/courses/page.tsx`
  - [ ] Display all courses in grid
  - [ ] Filter by category
  - [ ] Search functionality
  - [ ] Pagination
- [ ] Create `/app/(public)/courses/[id]/page.tsx`
  - [ ] Display full course details
  - [ ] Show curriculum/lessons
  - [ ] Display instructor profile
  - [ ] Enroll button

### Phase 1C: API Integration
- [ ] Replace mock data in `/api/courses/route.ts` with Supabase
- [ ] Replace mock data in `/api/events/route.ts` with Supabase
- [ ] Replace mock data in `/api/research/publications/route.ts` with Supabase
- [ ] Test all API calls work with real data

---

## 📋 Medium-Term Tasks (Week 3-4)

### Phase 2A: Additional Homepage Sections
- [ ] Create `Testimonials.tsx` component
  - [ ] Carousel of 5+ testimonials
  - [ ] Auto-advance every 5 seconds
  - [ ] Manual dot navigation
  - [ ] Mobile responsive
- [ ] Create `PartnersSection.tsx` component
  - [ ] Scrolling marquee of partner logos
  - [ ] Grayscale to color on hover
- [ ] Create `UpcomingEvents.tsx` component
  - [ ] Show 3 featured events
  - [ ] Event cards with details
  - [ ] Register button
- [ ] Update homepage with new sections

### Phase 2B: Dashboard Pages
- [ ] Create sidebar component
- [ ] Create `/app/(dashboard)/dashboard/page.tsx`
  - [ ] Welcome message
  - [ ] Stats overview
  - [ ] Recent activity
  - [ ] Quick links
- [ ] Create `/app/(dashboard)/dashboard/my-courses/page.tsx`
  - [ ] List enrolled courses
  - [ ] Progress bars
  - [ ] Continue learning button
- [ ] Create `/app/(dashboard)/dashboard/learning-path/page.tsx`
  - [ ] Visual learning path
  - [ ] Milestone tracker
  - [ ] Recommendations

### Phase 2C: Additional Public Pages
- [ ] Create `/app/(public)/events/page.tsx` - Events listing
- [ ] Create `/app/(public)/research/page.tsx` - Research hub
- [ ] Create `/app/(public)/advisory/page.tsx` - Advisory booking
- [ ] Create `/app/(public)/opportunities/page.tsx` - Job listings
- [ ] Create `/app/(public)/community/page.tsx` - Community forum
- [ ] Create `/app/(public)/impact/page.tsx` - Impact dashboard

---

## 📋 Long-Term Tasks (Month 2+)

### Phase 3A: Advanced Features
- [ ] Implement payment system (MTN MoMo, Orange Money)
- [ ] Add certificate generation
- [ ] Implement live sessions
- [ ] Add search with filters
- [ ] Community forum system
- [ ] Advisory booking system

### Phase 3B: Internationalization (i18n)
- [ ] Set up next-intl
- [ ] Extract all UI text to translation files
- [ ] Create EN and FR translation files
- [ ] Test language switching
- [ ] Verify RTL readiness (future)

### Phase 3C: Analytics & Monitoring
- [ ] Set up Google Analytics
- [ ] Add error tracking (Sentry)
- [ ] Implement user behavior tracking
- [ ] Create analytics dashboard

### Phase 3D: Testing
- [ ] Set up Jest + React Testing Library
- [ ] Write component tests
- [ ] Write E2E tests with Playwright
- [ ] Achieve 80%+ code coverage

---

## 🗂️ File Structure Completion Checklist

### Pages to Create
- [ ] `/app/(auth)/login/page.tsx`
- [ ] `/app/(auth)/register/page.tsx`
- [ ] `/app/(auth)/forgot-password/page.tsx`
- [ ] `/app/(public)/about/page.tsx`
- [ ] `/app/(public)/courses/page.tsx`
- [ ] `/app/(public)/courses/[id]/page.tsx`
- [ ] `/app/(public)/research/page.tsx`
- [ ] `/app/(public)/research/[id]/page.tsx`
- [ ] `/app/(public)/events/page.tsx`
- [ ] `/app/(public)/events/[id]/page.tsx`
- [ ] `/app/(public)/advisory/page.tsx`
- [ ] `/app/(public)/community/page.tsx`
- [ ] `/app/(public)/opportunities/page.tsx`
- [ ] `/app/(public)/impact/page.tsx`
- [ ] `/app/(public)/blog/page.tsx`
- [ ] `/app/(public)/blog/[slug]/page.tsx`
- [ ] `/app/(public)/partners/page.tsx`
- [ ] `/app/(public)/contact/page.tsx`
- [ ] `/app/(dashboard)/dashboard/page.tsx`
- [ ] `/app/(dashboard)/dashboard/my-courses/page.tsx`
- [ ] `/app/(dashboard)/dashboard/learning-path/page.tsx`
- [ ] `/app/(dashboard)/dashboard/certificates/page.tsx`
- [ ] `/app/(dashboard)/dashboard/toolkit/page.tsx`
- [ ] `/app/(dashboard)/dashboard/advisory/page.tsx`
- [ ] `/app/(dashboard)/dashboard/community/page.tsx`
- [ ] `/app/(dashboard)/dashboard/opportunities/page.tsx`
- [ ] `/app/(dashboard)/dashboard/profile/page.tsx`
- [ ] `/app/(instructor)/instructor/dashboard/page.tsx`
- [ ] `/app/(instructor)/instructor/courses/page.tsx`
- [ ] `/app/(instructor)/instructor/courses/new/page.tsx`
- [ ] `/app/(instructor)/instructor/analytics/page.tsx`
- [ ] `/app/(admin)/admin/dashboard/page.tsx`
- [ ] `/app/(admin)/admin/users/page.tsx`
- [ ] `/app/(admin)/admin/courses/page.tsx`

### Components to Create
- [ ] `components/layout/Sidebar.tsx`
- [ ] `components/layout/MobileNav.tsx`
- [ ] `components/home/Testimonials.tsx`
- [ ] `components/home/PartnersSection.tsx`
- [ ] `components/home/UpcomingEvents.tsx`
- [ ] `components/home/CTASection.tsx`
- [ ] `components/home/NewsSection.tsx`
- [ ] `components/courses/CourseGrid.tsx`
- [ ] `components/courses/CourseFilters.tsx`
- [ ] `components/courses/CourseCatalog.tsx`
- [ ] `components/courses/CourseHero.tsx`
- [ ] `components/courses/CourseCurriculum.tsx`
- [ ] `components/courses/InstructorCard.tsx`
- [ ] `components/courses/ReviewCard.tsx`
- [ ] `components/courses/EnrollButton.tsx`
- [ ] `components/courses/VideoPlayer.tsx`
- [ ] `components/courses/LessonSidebar.tsx`
- [ ] `components/research/PublicationCard.tsx`
- [ ] `components/research/ResearchFilters.tsx`
- [ ] `components/research/DatasetCard.tsx`
- [ ] `components/events/EventCard.tsx`
- [ ] `components/events/EventCalendar.tsx`
- [ ] `components/events/EventRegistration.tsx`
- [ ] `components/dashboard/ProgressCard.tsx`
- [ ] `components/dashboard/CertificateCard.tsx`
- [ ] `components/dashboard/LearningPathMap.tsx`
- [ ] `components/dashboard/ActivityFeed.tsx`
- [ ] `components/dashboard/StatsGrid.tsx`
- [ ] `components/toolkit/BusinessCanvas.tsx`
- [ ] `components/toolkit/PitchDeckBuilder.tsx`
- [ ] `components/toolkit/FundingDirectory.tsx`
- [ ] `components/toolkit/RegistrationWizard.tsx`
- [ ] `components/community/ForumPost.tsx`
- [ ] `components/community/MemberCard.tsx`
- [ ] `components/community/DiscussionThread.tsx`
- [ ] `components/advisory/AdvisoryBooking.tsx`
- [ ] `components/advisory/MentorCard.tsx`
- [ ] `components/advisory/SessionCard.tsx`
- [ ] `components/opportunities/OpportunityCard.tsx`
- [ ] `components/opportunities/ApplicationTracker.tsx`
- [ ] `components/impact/ImpactMap.tsx`
- [ ] `components/impact/SDGTracker.tsx`
- [ ] `components/impact/StatCounter.tsx`
- [ ] `components/shared/LanguageSwitcher.tsx`
- [ ] `components/shared/ThemeToggle.tsx`
- [ ] `components/shared/SearchBar.tsx`
- [ ] `components/shared/Avatar.tsx`
- [ ] `components/shared/EmptyState.tsx`
- [ ] `components/shared/LoadingSkeleton.tsx`
- [ ] `components/shared/PaymentModal.tsx`
- [ ] `components/shared/AIAssistantChat.tsx`

### API Routes to Create/Update
- [ ] `/api/auth/register/route.ts`
- [ ] `/api/auth/logout/route.ts`
- [ ] `/api/courses/[id]/route.ts`
- [ ] `/api/courses/[id]/enroll/route.ts`
- [ ] `/api/events/[id]/register/route.ts`
- [ ] `/api/user/profile/route.ts`
- [ ] `/api/user/dashboard/route.ts`
- [ ] `/api/advisory/book/route.ts`
- [ ] `/api/payments/initiate/route.ts`
- [ ] `/api/payments/webhook/route.ts`

---

## 🎨 Design System Verification

Before any major changes, verify:
- [ ] All colors use `esrc-*` tokens from `tailwind.config.ts`
- [ ] Fonts use `font-display` (Playfair) or `font-body` (DM Sans)
- [ ] Buttons use `.btn-primary`, `.btn-gold`, or `.btn-outline` classes
- [ ] Cards use `.card-hover` class
- [ ] Sections use `.section-padding` class
- [ ] Containers use `.container-width` class
- [ ] No hardcoded colors (e.g., `text-black`, `bg-white`)
- [ ] Responsive design tested on mobile (375px), tablet (768px), desktop (1440px)

---

## 🧪 Quality Checklist

Before committing code:
- [ ] No TypeScript errors: `pnpm tsc --noEmit`
- [ ] No console errors or warnings
- [ ] ESLint passes: `pnpm lint`
- [ ] Component works responsively on all breakpoints
- [ ] Dark mode styling works
- [ ] Accessibility: semantic HTML, ARIA labels where needed
- [ ] Performance: images optimized, no unnecessary re-renders
- [ ] Code follows existing patterns in codebase

---

## 📚 Key Files to Reference

When building anything new, check these files first:
1. **ARCHITECTURE.md** - Understand the pattern
2. **SETUP.md** - Development workflow
3. **lib/api-client.ts** - How to make API calls
4. **lib/types.ts** - Data structure definitions
5. **lib/constants.ts** - App configuration
6. **lib/utils.ts** - Helper functions
7. **app/page.tsx** - Homepage as example
8. **components/layout/Navbar.tsx** - Component example
9. **tailwind.config.ts** - Design tokens

---

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] All environment variables set in Vercel
- [ ] Supabase connected and tested
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Google Analytics) set up
- [ ] Performance optimized (images, code splitting)
- [ ] SEO meta tags added
- [ ] 404 and error pages created
- [ ] User privacy policy created
- [ ] Terms of service created
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented on API routes
- [ ] Backups configured

---

## 📞 Helpful Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Check code style
pnpm tsc --noEmit       # Type check

# Cleanup
rm -rf .next            # Remove build cache
rm -rf node_modules     # Remove dependencies (then pnpm install)

# Database (when Supabase is connected)
pnpm supabase:gen:types # Generate types from Supabase schema
```

---

## 🎓 Learning Path

1. **Week 1**: Understand architecture (read docs), set up environment, run dev server
2. **Week 2**: Build authentication system
3. **Week 3**: Build course pages
4. **Week 4**: Connect Supabase
5. **Week 5**: Build dashboard pages
6. **Week 6**: Add payment system
7. **Week 7**: Implement i18n
8. **Week 8**: Testing & optimization

---

## ✅ Current Status

**Foundation**: ✅ Complete
**Homepage**: ✅ Complete
**API Layer**: ✅ Set up
**Design System**: ✅ Complete
**Documentation**: ✅ Complete

**Next**: Authentication system

---

**Ready to build? Start with Week 1 setup tasks above!** 🚀
