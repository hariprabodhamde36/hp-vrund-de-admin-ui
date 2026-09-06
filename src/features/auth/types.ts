export interface User {
  id: string
  email: string
  name?: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
