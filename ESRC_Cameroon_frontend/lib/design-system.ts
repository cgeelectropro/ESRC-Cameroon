/**
 * ESRC Cameroon Design System Tokens
 * Single source of truth for all design values
 * Import and use in components via: import { COLORS, TYPOGRAPHY, SPACING, etc } from '@/lib/design-system'
 */

export const COLORS = {
  // Primary Brand Colors
  brand: {
    900: '#1B5E20',   // Dark green
    800: '#166534',
    700: '#2E7D32',   // Primary button color
    600: '#388E3C',
    500: '#4CAF50',   // Accent green
    100: '#E8F5E9',
    50: '#F1F8E9',
  },

  // Call-to-Action Gold
  accent: {
    900: '#F57F17',
    700: '#F57F17',   // Gold hover
    600: '#F67C0F',
    500: '#F9A825',   // Primary gold
    400: '#FBC02D',
    100: '#FFFDE7',
  },

  // Earth/Brown (Trust)
  earth: {
    900: '#6D4C41',
    700: '#795548',
    500: '#A1887F',
    100: '#EFEBE9',
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',      // Green
    warning: '#FF9800',      // Orange
    danger: '#F44336',       // Red
    error: '#DC2626',        // Deep red
    info: '#2196F3',         // Blue
  },

  // Neutral Grays
  neutral: {
    900: '#1A1A1A',   // Dark text
    800: '#2E2E2E',
    700: '#404040',   // Body text
    600: '#555555',   // Secondary text (mid)
    500: '#757575',
    400: '#9E9E9E',
    300: '#BDBDBD',   // Light borders
    200: '#E0E0E0',   // Lighter borders
    100: '#F5F5F5',   // Light backgrounds
    50: '#FAFAFA',    // Very light
  },

  // Legacy (backward compatibility)
  dark: '#1A1A1A',
  mid: '#555555',
  light: '#F5F5F5',
} as const

export const TYPOGRAPHY = {
  fonts: {
    display: 'var(--font-display), serif',    // Playfair Display
    body: 'var(--font-body), sans-serif',     // DM Sans
  },

  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const

export const SPACING = {
  0: '0px',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px

  section: '3rem',      // Between sections (48px)
  container: '2rem',    // Inside containers (32px)
  component: '1rem',    // Inside components (16px)
  gap: '1rem',          // Gap between items (16px)
} as const

export const RADIUS = {
  none: '0px',
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',   // Pill/circle
} as const

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  brand: {
    light: '0 2px 8px rgba(27, 94, 32, 0.12)',
    medium: '0 4px 12px rgba(27, 94, 32, 0.15)',
    dark: '0 8px 24px rgba(27, 94, 32, 0.2)',
  },
} as const

export const TRANSITIONS = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slowest: '500ms',

  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Component-specific token bundles
 * Use for consistent styling across component variations
 */

export const COMPONENT_STYLES = {
  button: {
    base: {
      padding: `${SPACING[2]} ${SPACING[4]}`,
      borderRadius: RADIUS.md,
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: TYPOGRAPHY.weights.semibold,
      transition: `all ${TRANSITIONS.base} ${TRANSITIONS.easing.ease}`,
    },
    sizes: {
      sm: { padding: `${SPACING[1]} ${SPACING[3]}`, fontSize: TYPOGRAPHY.sizes.xs },
      md: { padding: `${SPACING[2]} ${SPACING[4]}`, fontSize: TYPOGRAPHY.sizes.sm },
      lg: { padding: `${SPACING[3]} ${SPACING[6]}`, fontSize: TYPOGRAPHY.sizes.base },
    },
    variants: {
      primary: {
        bg: COLORS.brand[700],
        text: '#FFFFFF',
        hover: COLORS.brand[800],
        focus: COLORS.accent[500],
      },
      secondary: {
        bg: COLORS.neutral[100],
        text: COLORS.neutral[900],
        hover: COLORS.neutral[200],
        focus: COLORS.accent[500],
      },
      ghost: {
        bg: 'transparent',
        text: COLORS.brand[700],
        hover: COLORS.neutral[100],
        focus: COLORS.accent[500],
      },
    },
  },

  card: {
    base: {
      borderRadius: RADIUS.lg,
      padding: SPACING.container,
      boxShadow: SHADOWS.sm,
      transition: `box-shadow ${TRANSITIONS.base} ${TRANSITIONS.easing.ease}`,
    },
    variants: {
      elevated: {
        boxShadow: SHADOWS.md,
        hover: SHADOWS.lg,
      },
      flat: {
        boxShadow: SHADOWS.none,
        border: `1px solid ${COLORS.neutral[200]}`,
      },
    },
  },

  input: {
    base: {
      padding: `${SPACING[2]} ${SPACING[3]}`,
      borderRadius: RADIUS.md,
      fontSize: TYPOGRAPHY.sizes.base,
      border: `1px solid ${COLORS.neutral[300]}`,
      transition: `all ${TRANSITIONS.base} ${TRANSITIONS.easing.ease}`,
    },
    focus: {
      outline: 'none',
      boxShadow: `0 0 0 3px ${COLORS.accent[500]}40`,
      borderColor: COLORS.accent[500],
    },
    error: {
      borderColor: COLORS.semantic.error,
      boxShadow: `0 0 0 3px ${COLORS.semantic.error}40`,
    },
  },
} as const
