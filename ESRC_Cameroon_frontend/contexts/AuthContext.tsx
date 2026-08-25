'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import {
  getStoredToken,
  getStoredUser,
  getStoredRefreshToken,
  setAuth,
  clearAuth,
  type StoredUser,
} from '@/lib/auth-storage'

type AuthState = {
  user: StoredUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

type GoogleProfile = {
  googleId: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string; pendingInstructorApproval?: boolean; role?: string }>
  loginWithGoogle: (idToken: string) => Promise<
    | { success: true; role?: string }
    | { success: true; needsProfileCompletion: true; googleProfile: GoogleProfile }
    | { success: false; error: string }
  >
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

type RegisterInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  country?: string
  city?: string
  preferredLanguage?: string
  interests?: string[]
  goals?: string
  // Instructor-specific
  instructorTitle?: string
  organization?: string
  expertise?: string[]
  phone?: string
  linkedinUrl?: string
  motivation?: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const applyAuth = useCallback(
    (user: StoredUser | null, token: string | null, refreshToken?: string | null) => {
      if (user && token) {
        setAuth(token, user, refreshToken ?? getStoredRefreshToken())
      } else {
        clearAuth()
      }
      setState({
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading: false,
      })
    },
    []
  )

  const loadFromStorage = useCallback(async () => {
    const token = getStoredToken()
    const user = getStoredUser()
    if (token && user) {
      // Token is still valid — restore session immediately
      setState((s) => ({
        ...s,
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      }))
      return
    }

    // Token missing or expired — try silent refresh using stored refresh token
    const refresh = getStoredRefreshToken()
    if (refresh) {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        })
        const refreshJson = await refreshRes.json().catch(() => ({}))
        const data = refreshJson.data ?? refreshJson
        if (data?.token && data?.user) {
          setAuth(data.token, data.user as StoredUser, data.refreshToken ?? null)
          setState((s) => ({
            ...s,
            user: data.user as StoredUser,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          }))
          return
        }
      } catch {
        // Network error — fall through to logged-out state
      }
    }

    // No valid session
    clearAuth()
    setState((s) => ({
      ...s,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }))
  }, [])

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  const refreshSession = useCallback(async () => {
    const res = await apiClient.refreshToken()
    if (res.success && res.data) {
      const { user, token, refreshToken } = res.data
      applyAuth(user as StoredUser, token, refreshToken)
    } else {
      clearAuth()
      setState((s) => ({ ...s, user: null, token: null, isAuthenticated: false }))
    }
  }, [applyAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiClient.login(email, password)
      if (res.success && res.data) {
        const { user, token, refreshToken } = res.data as {
          user: StoredUser
          token: string
          refreshToken?: string | null
        }
        applyAuth(user, token, refreshToken ?? null)
        return { success: true, role: user.role }
      }
      return { success: false, error: res.error || 'Login failed' }
    },
    [applyAuth]
  )

  const register = useCallback(
    async (data: RegisterInput) => {
      const res = await apiClient.register(data)
      if (res.success && res.data) {
        const { user, token, refreshToken } = res.data as {
          user: StoredUser
          token: string
          refreshToken?: string | null
        }
        applyAuth(user, token, refreshToken ?? null)
        return { success: true, pendingInstructorApproval: !!(res as { pendingInstructorApproval?: boolean }).pendingInstructorApproval }
      }
      return { success: false, error: res.error || 'Registration failed' }
    },
    [applyAuth]
  )

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await apiClient.loginWithGoogle(idToken)
      if (!res.success) return { success: false as const, error: res.error || 'Google login failed' }
      const data = res.data as {
        token?: string
        user?: StoredUser
        refreshToken?: string | null
        needsProfileCompletion?: boolean
        googleProfile?: GoogleProfile
      }
      if (data?.token && data?.user) {
        applyAuth(data.user, data.token, data.refreshToken ?? null)
        return { success: true as const, role: data.user.role }
      }
      if (data?.needsProfileCompletion && data?.googleProfile) {
        return { success: true as const, needsProfileCompletion: true as const, googleProfile: data.googleProfile }
      }
      return { success: false as const, error: 'Unexpected response from server' }
    },
    [applyAuth]
  )

  const logout = useCallback(async () => {
    await apiClient.logout()
    clearAuth()
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push('/')
  }, [router])

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useAuthOptional() {
  return useContext(AuthContext)
}
