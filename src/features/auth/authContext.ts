import { createContext } from 'react'
import type { AuthStatus, LoginRequest, User } from './types'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
