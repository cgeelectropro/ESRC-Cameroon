/**
 * Client-side auth storage (localStorage) with token expiry tracking.
 * Keys prefixed to avoid collisions.
 */

const PREFIX = 'esrc_'
export const AUTH_KEYS = {
  token: `${PREFIX}token`,
  refreshToken: `${PREFIX}refresh_token`,
  user: `${PREFIX}user`,
  tokenExpiresAt: `${PREFIX}token_expires_at`,
} as const

export type StoredUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  bio?: string
  country?: string
  city?: string
  preferredLanguage?: string
  createdAt?: string
}

/**
 * Get stored token if it exists and hasn't expired
 * @returns token string or null if expired/missing
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(AUTH_KEYS.token)
  const expiresAt = localStorage.getItem(AUTH_KEYS.tokenExpiresAt)

  if (!token) return null

  // Check expiration if we have it
  if (expiresAt) {
    const expirationTime = parseInt(expiresAt, 10)
    if (Date.now() > expirationTime) {
      // Access token expired — remove it but keep refresh token so silent refresh works
      localStorage.removeItem(AUTH_KEYS.token)
      localStorage.removeItem(AUTH_KEYS.tokenExpiresAt)
      return null
    }
  }

  return token
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_KEYS.refreshToken)
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_KEYS.user)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

/**
 * Store auth tokens and user data with expiry time
 * @param token Access token
 * @param user User data
 * @param refreshToken Refresh token (optional)
 * @param expiresIn Expiry time in seconds (default 15min)
 */
export function setAuth(
  token: string,
  user: StoredUser,
  refreshToken?: string | null,
  expiresIn = 900 // 15 minutes default
) {
  if (typeof window === 'undefined') return

  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(AUTH_KEYS.token, token)
  localStorage.setItem(AUTH_KEYS.tokenExpiresAt, expiresAt.toString())
  localStorage.setItem(AUTH_KEYS.user, JSON.stringify(user))

  if (refreshToken) {
    localStorage.setItem(AUTH_KEYS.refreshToken, refreshToken)
  } else {
    localStorage.removeItem(AUTH_KEYS.refreshToken)
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEYS.token)
  localStorage.removeItem(AUTH_KEYS.tokenExpiresAt)
  localStorage.removeItem(AUTH_KEYS.refreshToken)
  localStorage.removeItem(AUTH_KEYS.user)
}

/**
 * Check if user has a valid token stored
 */
export function isAuthValid(): boolean {
  return getStoredToken() !== null && getStoredUser() !== null
}
