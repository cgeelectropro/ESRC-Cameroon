# ESRC Cameroon Design Tokens

This document defines the design system tokens used across the ESRC Cameroon frontend. Use these tokens instead of hardcoded values to maintain consistency.

## Colors

### Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `esrc-green-900` | #1B5E20 | Dark green, primary backgrounds, hover states |
| `esrc-green-700` | #2E7D32 | Primary brand, borders, primary buttons |
| `esrc-green-600` | #388E3C | Dark mode primary |
| `esrc-green-500` | #4CAF50 | Accents, links, success states |
| `esrc-green-100` | #E8F5E9 | Light accents |
| `esrc-green-50` | #F1F8E9 | Lightest green, accent backgrounds |
| `esrc-gold-700` | #F57F17 | Gold hover, emphasis |
| `esrc-gold-600` | #F67C0F | Gold dark |
| `esrc-gold-500` | #F9A825 | Gold primary, CTAs, highlights |
| `esrc-gold-100` | #FFFDE7 | Light gold |
| `esrc-dark` | #1A1A1A | Footer, dark text |
| `esrc-mid` | #555555 | Muted text |
| `esrc-light` | #F5F5F5 | Light backgrounds |
| `esrc-earth` | #795548 | Earth tone accent |

### Semantic Tokens

| Token | Light | Dark |
|-------|-------|------|
| `primary` | esrc-green-700 | esrc-green-500 |
| `background` | #ffffff | #0f0f0f |
| `foreground` | #1A1A1A | #f5f5f5 |
| `muted` | #f5f5f5 | #262626 |
| `muted-foreground` | #555555 | #b0b0b0 |
| `accent` | #F1F8E9 | #1f3d20 |
| `border` | #e5e7eb | #404040 |
| `ring` | esrc-green-700 | esrc-green-500 |

## Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-display` | Playfair Display | Headings (h1–h6) |
| `font-body` | DM Sans | Body text, UI |

### Heading Scale

| Element | Base | md (768px+) | lg (1024px+) |
|---------|------|-------------|--------------|
| h1 | 3rem | 3.75rem | 4.5rem |
| h2 | 2.25rem | 3rem | — |
| h3 | 1.875rem | 2.25rem | — |

### Font Weights

- Headings: 600 (semibold)
- h1 override: 700 (bold) where needed
- Body: 400 (normal)
- Buttons: 500–700

### Line Height

- Body: 1.625
- Headings: default (tight)

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `section-padding` | 1rem (mobile) → 2rem (md) → 3rem (lg) | Section vertical/horizontal padding |
| `container-width` | max-width: 80rem | Content container |
| Button padding | 0.75rem 1.5rem | Primary buttons |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 0.25rem | Small elements |
| `rounded-lg` | 0.5rem | Buttons, inputs |
| `rounded-xl` | 0.75rem | Cards |
| `rounded-2xl` | 1rem | Large cards |
| `rounded-full` | 9999px | Pills, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Cards at rest |
| `shadow-md` | 0 4px 6px -1px rgba(0,0,0,0.1) | Navbar scrolled |
| `shadow-lg` | 0 10px 15px -3px rgba(0,0,0,0.1) | Cards hover |
| `card-hover` | translateY(-0.25rem) + shadow-lg | Interactive cards |

## Animations

| Token | Duration | Usage |
|-------|----------|-------|
| `animate-fade-in-up` | 0.8s | Section entrance |
| `animate-slide-in` | 0.3s | Mobile nav |
| `animate-count-up` | 2s | Number counters |
| `transition` | 200ms | Buttons, links |

**Note:** All animations respect `prefers-reduced-motion: reduce` and are minimized for users who prefer reduced motion.

## Usage

- Use Tailwind classes: `bg-esrc-green-700`, `text-esrc-gold-500`, etc.
- Use CSS variables: `var(--primary)`, `var(--esrc-green-900)`
- Never hardcode hex values in components
