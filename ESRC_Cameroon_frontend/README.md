# ESRC Cameroon

**Unlocking Human Potential Across Africa**

A bilingual (English/French) learning and entrepreneurship ecosystem platform serving Cameroon and Central Africa. Think Udemy meets a development think-tank.

## 🌍 What is ESRC Cameroon?

The Entrepreneurship and Social Research Center-Cameroon is a comprehensive platform offering:

- **📚 Online Courses** - World-class education in entrepreneurship, policy, research, and more
- **🔬 Research Hub** - Access to publications, policy briefs, and open datasets
- **🤝 Advisory Services** - 1-on-1 mentorship from industry experts
- **💼 Entrepreneur Toolkit** - Business canvas, pitch deck builder, funding directory
- **🎯 Opportunities** - Job listings, fellowships, grants, and competitions
- **👥 Community** - Network with peers, participate in forums, attend events
- **📊 Impact Tracking** - See the difference we're making across Africa

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/esrc-cameroon/platform.git
cd platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Project Structure

```
esrc-cameroon/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (public)/          # Public pages
│   ├── (dashboard)/       # User dashboard
│   ├── (instructor)/      # Instructor portal
│   ├── (admin)/           # Admin panel
│   ├── api/               # Backend API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Navigation, footer, etc
│   ├── home/             # Homepage sections
│   ├── courses/          # Course components
│   ├── shared/           # Reusable components
│   └── ...
├── lib/
│   ├── api-client.ts     # Central API client
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # App configuration
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── ARCHITECTURE.md       # Architecture documentation
├── SETUP.md             # Setup guide
└── README.md            # This file
```

## 🎨 Design System

### Colors
- **Primary Green**: `#1B5E20` - Brand identity
- **Gold Accent**: `#F9A825` - Call-to-action
- **Earth Brown**: `#795548` - Warmth & authenticity
- **Neutrals**: Dark, mid, light grays

### Typography
- **Display Font**: Playfair Display (headings)
- **Body Font**: DM Sans (text)

### Components
All UI components use shadcn/ui with Tailwind CSS customization.

## 🏗️ Architecture

### Critical Rule: API Layer First
**Never call Supabase or any external service directly from components.**

All data flows through `/app/api/` routes:
```
Components → /app/api/[route] → Backend (Supabase → NestJS)
```

This ensures the frontend never needs rewriting during backend migration.

### Phase 1: Supabase Backend
Currently using Supabase for data persistence and authentication.

### Phase 2: NestJS Backend
API routes will be updated to call custom NestJS backend without frontend changes.

## 📦 Key Dependencies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide Icons** - Beautiful icons
- **Playfair Display & DM Sans** - Google Fonts

## 🔌 API Endpoints

### Currently Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | Fetch all courses |
| `/api/courses/[id]` | GET | Fetch single course |
| `/api/events` | GET | Fetch upcoming events |
| `/api/research/publications` | GET | Fetch research papers |
| `/api/opportunities` | GET | Fetch job opportunities |
| `/api/impact/stats` | GET | Fetch impact statistics |
| `/api/auth/login` | POST | User login |
| `/api/auth/session` | GET | Get current session |

**Note**: All endpoints currently return mock data. Replace with Supabase queries.

## 💻 Development

### Creating a New Page

```tsx
// app/(public)/my-page/page.tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function MyPage() {
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

### Creating a New Component

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

### Creating a New API Route

```typescript
// app/api/my-endpoint/route.ts
export async function GET() {
  // TODO: Replace with actual backend call
  return Response.json({
    success: true,
    data: { message: 'Hello World' }
  })
}
```

## 🎯 Core Features

### ✅ Implemented
- [x] Responsive design (mobile, tablet, desktop)
- [x] Hero section with call-to-actions
- [x] Impact statistics display
- [x] Course catalog with filtering
- [x] How-it-works section
- [x] Navigation and footer
- [x] Design system setup
- [x] API client layer
- [x] TypeScript types

### 🚧 In Progress
- [ ] User authentication
- [ ] Course enrollment
- [ ] Payment integration
- [ ] Bilingual UI (i18n)
- [ ] Dashboard pages
- [ ] Search functionality

### 📋 Planned
- [ ] Live chat support
- [ ] AI-powered course recommendations
- [ ] Video player
- [ ] Certificate generation
- [ ] Community forum
- [ ] Advisory booking system
- [ ] Analytics dashboard

## 🌐 Internationalization

The platform supports both English and French:
- UI text can be bilingual
- Content metadata includes translated fields
- Language preference stored in localStorage
- Ready for next-intl integration

## 🔐 Security

- TypeScript strict mode for type safety
- API route layer prevents direct database access
- Environment variables for sensitive config
- CORS configuration (when needed)
- Input validation on API routes

## 📱 Responsive Design

Built mobile-first with Tailwind breakpoints:
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

## 🧪 Testing

// TODO: Implement testing setup
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📊 Performance

- Image optimization with Next.js Image component
- Lazy loading for components
- Code splitting with dynamic imports
- Optimized Tailwind CSS builds
- Vercel deployment ready

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to GitHub (if using Git)
git push origin main

# Create new project on Vercel
# Connect GitHub repository
# Vercel will auto-deploy on push
```

### Environment Variables for Production

```env
NEXT_PUBLIC_SITE_URL=https://esrc.cm
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## 📚 Documentation

- **ARCHITECTURE.md** - Detailed architecture and patterns
- **SETUP.md** - Development setup and workflow
- **API Routes** - Endpoint documentation (inline)
- **Component Docs** - Storybook (coming soon)

## 🤝 Contributing

1. Follow the architecture rules (API layer first)
2. Use the design system consistently
3. Keep components small and reusable
4. Add TypeScript types for new data
5. Test responsive design on multiple screens

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: describe your changes"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
pnpm dev -p 3001
```

### Dependencies not installing?
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Styling issues?
- Check `tailwind.config.ts` for custom colors
- Verify Tailwind classes in `app/globals.css`
- Ensure PostCSS is configured correctly

### TypeScript errors?
```bash
pnpm tsc --noEmit
```

## 📞 Support

- **Documentation**: See ARCHITECTURE.md and SETUP.md
- **Issues**: Report on GitHub
- **Email**: info@esrc.cm

## 📄 License

This project is proprietary software of ESRC Cameroon.

## 🙏 Acknowledgments

Built with modern web technologies and designed for the African entrepreneurship community.

---

**ESRC Cameroon** — Unlocking Human Potential Across Africa 🌍
