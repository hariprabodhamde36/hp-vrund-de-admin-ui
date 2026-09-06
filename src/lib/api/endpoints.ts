/**
 * Paths are relative to `env.apiBaseUrl`.
 *
 * The auth contract is NOT confirmed yet. When the Node backend is ready,
 * correcting these paths (and the shapes in features/auth/api/auth.api.ts)
 * is the whole migration.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
} as const
