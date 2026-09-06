export type AuthMode = 'api' | 'stub'

function readString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

const rawAuthMode = readString(import.meta.env.VITE_AUTH_MODE, 'api')
if (rawAuthMode !== 'api' && rawAuthMode !== 'stub') {
  throw new Error(`Invalid VITE_AUTH_MODE: "${rawAuthMode}". Expected "api" or "stub".`)
}

if (import.meta.env.PROD && rawAuthMode === 'stub') {
  throw new Error('VITE_AUTH_MODE=stub cannot be used in a production build.')
}

export const env = {
  /** Backend base URL. Trailing slash stripped so paths concatenate cleanly. */
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, '/api').replace(/\/+$/, ''),
  appName: readString(import.meta.env.VITE_APP_NAME, 'Admin UI'),
  authMode: rawAuthMode as AuthMode,
} as const
