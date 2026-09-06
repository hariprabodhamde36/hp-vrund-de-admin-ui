import { api } from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/errors'
import { env } from '@/lib/env'
import type { LoginRequest, LoginResponse, User } from '../types'

// ---------------------------------------------------------------------------
// DEVELOPMENT STUB — active only when VITE_AUTH_MODE=stub.
// Delete this block and the `env.authMode` checks below once the real Node
// backend exposes the auth endpoints. It stores no token, only a marker.
// ---------------------------------------------------------------------------
const STUB_USER: User = {
  id: 'stub-user-1',
  email: 'admin@example.com',
  name: 'Stub Admin',
  role: 'admin',
}
const STUB_MARKER_KEY = 'admin-ui-stub-session'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const stubApi = {
  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    await wait(400)
    if (!email.includes('@') || password.length < 4) {
      throw new ApiError(401, 'Invalid email or password.')
    }
    sessionStorage.setItem(STUB_MARKER_KEY, email)
    return { user: { ...STUB_USER, email } }
  },
  async logout(): Promise<void> {
    await wait(150)
    sessionStorage.removeItem(STUB_MARKER_KEY)
  },
  async me(): Promise<LoginResponse> {
    await wait(150)
    const email = sessionStorage.getItem(STUB_MARKER_KEY)
    if (!email) {
      throw new ApiError(401, 'Not authenticated.')
    }
    return { user: { ...STUB_USER, email } }
  },
}
// --------------------------------- END STUB --------------------------------

export const authApi = {
  /** `skipUnauthorizedHandler` so a rejected login shows a form error, not a redirect. */
  login(credentials: LoginRequest): Promise<LoginResponse> {
    if (env.authMode === 'stub') {
      return stubApi.login(credentials)
    }
    return api.post<LoginResponse>(ENDPOINTS.auth.login, credentials, {
      skipUnauthorizedHandler: true,
    })
  },

  logout(): Promise<void> {
    if (env.authMode === 'stub') {
      return stubApi.logout()
    }
    return api.post<void>(ENDPOINTS.auth.logout)
  },

  /** `skipUnauthorizedHandler` so the boot-time 401 is a normal "logged out" answer. */
  me(): Promise<LoginResponse> {
    if (env.authMode === 'stub') {
      return stubApi.me()
    }
    return api.get<LoginResponse>(ENDPOINTS.auth.me, { skipUnauthorizedHandler: true })
  },
}
