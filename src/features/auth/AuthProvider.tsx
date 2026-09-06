import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '@/lib/api/apiClient'
import { authApi } from './api/auth.api'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AuthStatus, LoginRequest, User } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const queryClient = useQueryClient()

  const clearSession = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
    queryClient.clear()
  }, [queryClient])

  // Restore the session once on boot. Status stays 'loading' until this settles,
  // which is what prevents a flash of the login page on reload.
  useEffect(() => {
    let active = true
    authApi
      .me()
      .then(({ user: restored }) => {
        if (!active) return
        setUser(restored)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setStatus('unauthenticated')
      })
    return () => {
      active = false
    }
  }, [])

  // Any 401 from any request drops the session exactly once, here.
  useEffect(() => {
    setUnauthorizedHandler(clearSession)
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const { user: loggedIn } = await authApi.login(credentials)
    setUser(loggedIn)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
