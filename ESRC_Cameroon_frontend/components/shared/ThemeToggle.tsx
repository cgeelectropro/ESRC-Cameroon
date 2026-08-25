'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  size?: number
}

export function ThemeToggle({ className = '', size = 20 }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`p-2 hover:bg-esrc-green-50 dark:hover:bg-esrc-green-900/50 rounded-lg transition-colors ${className}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={size} className="text-esrc-gold-500" />
      ) : (
        <Moon size={size} className="text-esrc-dark" />
      )}
    </button>
  )
}
