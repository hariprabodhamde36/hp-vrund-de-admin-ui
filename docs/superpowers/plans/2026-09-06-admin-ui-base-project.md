# Admin UI Base Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a React admin UI — Vite, TypeScript, MUI, TanStack Query — with a login page, cookie-based session handling through a Node.js backend, an app shell, and a first Video Upload page that future media features are modelled on.

**Architecture:** Feature-sliced `src/` layout. Each feature owns its pages, components, API calls, and types; shared machinery lives in `lib/` and `components/`. Authentication state lives in a single `AuthProvider` backed by an httpOnly cookie the backend sets; the UI never handles tokens. Every backend URL is declared in one file so the unconfirmed auth contract stays cheap to change.

**Tech Stack:** Vite 7, React 19, TypeScript 5, MUI 7 (+ Emotion, MUI Icons), React Router 7, TanStack Query 5, ESLint 9 flat config, Prettier 3, husky + lint-staged, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-06-admin-ui-base-project-design.md`

## Global Constraints

- **No tests.** The user explicitly deferred testing. Do not add Vitest, React Testing Library, MSW, a `test` script, or any `*.test.*` file. Verification in this plan is `pnpm lint`, `pnpm build`, and named manual browser checks.
- **No Supabase client in the frontend.** Never install `@supabase/supabase-js`. Supabase is reached only through the Node backend.
- **Package manager is pnpm.** Never run `npm install` or `yarn`.
- **Desktop only.** Minimum supported width ~1280px. No mobile breakpoints, no temporary/collapsing drawer.
- **Cookie session.** Every request sends `credentials: 'include'`. No token is ever written to `localStorage` or `sessionStorage` (the dev stub's marker flag is the sole exception, and it holds no token).
- **No git operations.** Do not run `git add`, `git commit`, `git checkout`, or any other git command. The user handles version control themselves.
- **MUI v9 note:** the installed MUI major is 9.x, where `Stack` no longer accepts `alignItems` / `justifyContent` as direct props — they belong in `sx`. The code in this plan already reflects that. Every other MUI pattern used here was verified to compile against v9.
- **Import alias:** `@/` resolves to `src/`. Use it for all cross-folder imports; relative imports only within the same folder.
- **Feature isolation:** a feature never imports another feature's internals. Shared code is promoted to `lib/` or `components/`.
- **Env var names, verbatim:** `VITE_API_BASE_URL` (default `/api`), `VITE_APP_NAME` (default `Admin UI`), `VITE_AUTH_MODE` (`api` | `stub`, default `api`).
- **Assumed auth contract:** `POST /auth/login` → `{ user }`; `POST /auth/logout` → 204; `GET /auth/me` → `{ user }` or 401. Paths are relative to `VITE_API_BASE_URL`.

---

### Task 1: Project Scaffold and Tooling

**Files:**

- Create: `package.json`, `pnpm-workspace.yaml` is NOT needed — skip it
- Create: `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitignore`, `.env.example`, `.husky/pre-commit`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Test: none (see Global Constraints)

**Interfaces:**

- Consumes: nothing.
- Produces: a runnable Vite app; the `@/` alias; scripts `dev`, `build`, `preview`, `lint`, `format`, `prepare`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "hp-vrund-de-admin-ui",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\" \"*.{ts,json,md}\"",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add react react-dom react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled @tanstack/react-query
pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/node eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier eslint-config-prettier husky lint-staged
```

Expected: both commands succeed, `node_modules/` and `pnpm-lock.yaml` appear.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": false,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client", "node"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

The `/api` proxy is what keeps the session cookie same-origin in development.

```ts
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin UI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_AUTH_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 7: Create `src/App.tsx` and `src/main.tsx`**

`App.tsx` is a placeholder that later tasks replace.

```tsx
export default function App() {
  return <h1>Admin UI</h1>
}
```

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element #root was not found in index.html.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 8: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
)
```

- [ ] **Step 9: Create `.prettierrc` and `.prettierignore`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

`.prettierignore`:

```
dist
node_modules
pnpm-lock.yaml
```

- [ ] **Step 10: Create `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
.env
.env.*
!.env.example
.DS_Store
*.log
.vite
```

- [ ] **Step 11: Create `.env.example`**

```
# Backend base URL. The Vite dev proxy forwards /api to http://localhost:3000,
# so the default works locally with no extra configuration.
VITE_API_BASE_URL=/api

# Shown in the top bar and the document title.
VITE_APP_NAME=Admin UI

# "api"  - call the real backend auth endpoints
# "stub" - use the in-browser development stub (no backend required)
VITE_AUTH_MODE=stub
```

- [ ] **Step 12: Set up husky**

```bash
pnpm exec husky init
printf 'pnpm exec lint-staged\n' > .husky/pre-commit
```

Expected: `.husky/pre-commit` contains the lint-staged call, and `package.json` already has the `prepare` script from Step 1.

- [ ] **Step 13: Verify the scaffold**

```bash
pnpm lint && pnpm build
```

Expected: both pass with no errors.

```bash
pnpm dev
```

Expected: the dev server starts and `http://localhost:5173` shows the "Admin UI" heading. Stop the server afterwards.

---

### Task 2: Theme and Color Mode

**Files:**

- Create: `src/app/theme/palette.ts`, `src/app/theme/components.ts`, `src/app/theme/index.ts`, `src/app/theme/colorModeContext.ts`, `src/app/theme/ColorModeProvider.tsx`, `src/app/theme/useColorMode.ts`
- Create: `src/app/providers.tsx`
- Modify: `src/App.tsx`
- Test: none

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
  - `buildTheme(mode: ColorMode): Theme` and `type ColorMode = 'light' | 'dark'` from `@/app/theme`
  - `<ColorModeProvider>` (renders MUI `ThemeProvider` + `CssBaseline` internally)
  - `useColorMode(): { mode: ColorMode; toggle: () => void }`
  - `<AppProviders>` from `@/app/providers` — later tasks nest more providers inside it

Context, provider, and hook are three files on purpose: it keeps `react-refresh/only-export-components` satisfied. Every context in this project follows the same split.

- [ ] **Step 1: Create `src/app/theme/palette.ts`**

```ts
import type { PaletteOptions } from '@mui/material'

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: { main: '#2563eb' },
  secondary: { main: '#7c3aed' },
  success: { main: '#16a34a' },
  warning: { main: '#d97706' },
  error: { main: '#dc2626' },
  background: { default: '#f4f6f8', paper: '#ffffff' },
  divider: 'rgba(15, 23, 42, 0.12)',
}

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: { main: '#60a5fa' },
  secondary: { main: '#a78bfa' },
  success: { main: '#4ade80' },
  warning: { main: '#fbbf24' },
  error: { main: '#f87171' },
  background: { default: '#0f1319', paper: '#161b23' },
  divider: 'rgba(148, 163, 184, 0.18)',
}
```

- [ ] **Step 2: Create `src/app/theme/components.ts`**

Defaults live here so pages stay free of one-off `sx` styling.

```ts
import type { Components, Theme } from '@mui/material'

export const componentOverrides: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600 },
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'inherit' },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
}
```

- [ ] **Step 3: Create `src/app/theme/index.ts`**

```ts
import { createTheme, type Theme } from '@mui/material/styles'
import { componentOverrides } from './components'
import { darkPalette, lightPalette } from './palette'

export type ColorMode = 'light' | 'dark'

export function buildTheme(mode: ColorMode): Theme {
  return createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600 },
    },
    components: componentOverrides,
  })
}
```

- [ ] **Step 4: Create `src/app/theme/colorModeContext.ts`**

```ts
import { createContext } from 'react'
import type { ColorMode } from './index'

export interface ColorModeContextValue {
  mode: ColorMode
  toggle: () => void
}

export const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined)
```

- [ ] **Step 5: Create `src/app/theme/ColorModeProvider.tsx`**

```tsx
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ColorModeContext, type ColorModeContextValue } from './colorModeContext'
import { buildTheme, type ColorMode } from './index'

const STORAGE_KEY = 'admin-ui-color-mode'

function readStoredMode(): ColorMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Fall through.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(readStoredMode)

  const toggle = useCallback(() => {
    setMode((current) => {
      const next: ColorMode = current === 'light' ? 'dark' : 'light'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Persisting the preference is best-effort.
      }
      return next
    })
  }, [])

  const theme = useMemo(() => buildTheme(mode), [mode])
  const value = useMemo<ColorModeContextValue>(() => ({ mode, toggle }), [mode, toggle])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
```

- [ ] **Step 6: Create `src/app/theme/useColorMode.ts`**

```ts
import { useContext } from 'react'
import { ColorModeContext, type ColorModeContextValue } from './colorModeContext'

export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used inside <ColorModeProvider>.')
  }
  return context
}
```

- [ ] **Step 7: Create `src/app/providers.tsx`**

Later tasks nest additional providers here. Keep this ordering.

```tsx
import type { ReactNode } from 'react'
import { ColorModeProvider } from './theme/ColorModeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return <ColorModeProvider>{children}</ColorModeProvider>
}
```

- [ ] **Step 8: Replace `src/App.tsx` with a themed placeholder**

```tsx
import { Box, Button, Stack, Typography } from '@mui/material'
import { AppProviders } from '@/app/providers'
import { useColorMode } from '@/app/theme/useColorMode'

function ThemePreview() {
  const { mode, toggle } = useColorMode()
  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h5">Admin UI</Typography>
        <Typography color="text.secondary">Current mode: {mode}</Typography>
        <Button variant="contained" onClick={toggle}>
          Toggle theme
        </Button>
      </Stack>
    </Box>
  )
}

export default function App() {
  return (
    <AppProviders>
      <ThemePreview />
    </AppProviders>
  )
}
```

- [ ] **Step 9: Verify**

```bash
pnpm lint && pnpm build
```

Expected: both pass.

```bash
pnpm dev
```

Manual checks at `http://localhost:5173`:

1. The page renders with the Inter font and a light background.
2. Clicking "Toggle theme" switches to dark and the label updates to `dark`.
3. Reloading the page keeps dark mode.

---

### Task 3: Environment Config and API Client

**Files:**

- Create: `src/lib/env.ts`, `src/lib/api/errors.ts`, `src/lib/api/endpoints.ts`, `src/lib/api/apiClient.ts`
- Create: `src/types/common.ts`
- Test: none

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
  - `env` — `{ apiBaseUrl: string; appName: string; authMode: 'api' | 'stub' }`
  - `ApiError` (class with `status: number`, `message: string`, `fieldErrors?: Record<string, string>`), `isApiError(e): e is ApiError`, `toDisplayMessage(e: unknown): string`
  - `ENDPOINTS.auth.login | logout | me`
  - `api.get<T> / api.post<T> / api.put<T> / api.patch<T> / api.del<T>`, each `(path: string, body?, options?: RequestOptions) => Promise<T>`
  - `setUnauthorizedHandler(handler: (() => void) | null): void`
  - `RequestOptions` — `{ signal?: AbortSignal; skipUnauthorizedHandler?: boolean }`
  - `Paginated<T>`, `ApiResponse<T>`, `ID` from `@/types/common`

- [ ] **Step 1: Create `src/lib/env.ts`**

Fails fast at startup rather than producing a confusing failure later.

```ts
export type AuthMode = 'api' | 'stub'

function readString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

const rawAuthMode = readString(import.meta.env.VITE_AUTH_MODE, 'api')
if (rawAuthMode !== 'api' && rawAuthMode !== 'stub') {
  throw new Error(`Invalid VITE_AUTH_MODE: "${rawAuthMode}". Expected "api" or "stub".`)
}

export const env = {
  /** Backend base URL. Trailing slash stripped so paths concatenate cleanly. */
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, '/api').replace(/\/+$/, ''),
  appName: readString(import.meta.env.VITE_APP_NAME, 'Admin UI'),
  authMode: rawAuthMode as AuthMode,
} as const
```

- [ ] **Step 2: Create `src/lib/api/errors.ts`**

The payload readers are deliberately tolerant: the backend's error shape is not confirmed yet.

```ts
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  409: 'That conflicts with something that already exists.',
  413: 'That file is too large.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on the server.',
}

/** Reads a human message out of an unknown error payload shape. */
export function messageFromPayload(status: number, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error
    }
    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message
      }
    }
  }
  if (typeof payload === 'string' && payload.trim() && payload.length < 200) {
    return payload
  }
  return DEFAULT_MESSAGES[status] ?? `Request failed with status ${status}.`
}

/** Reads `{ errors: { field: message | [message] } }` when the backend sends it. */
export function fieldErrorsFromPayload(payload: unknown): Record<string, string> | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }
  const errors = (payload as Record<string, unknown>).errors
  if (!errors || typeof errors !== 'object') {
    return undefined
  }
  const result: Record<string, string> = {}
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    if (typeof value === 'string') {
      result[field] = value
    } else if (Array.isArray(value) && typeof value[0] === 'string') {
      result[field] = value[0]
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function toDisplayMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
```

- [ ] **Step 3: Create `src/lib/api/endpoints.ts`**

Every backend path in the project lives here. Nothing else hardcodes a URL.

```ts
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
```

- [ ] **Step 4: Create `src/lib/api/apiClient.ts`**

```ts
import { env } from '@/lib/env'
import { ApiError, fieldErrorsFromPayload, messageFromPayload } from './errors'

export interface RequestOptions {
  signal?: AbortSignal
  /**
   * Skips the global 401 handler. Used by auth calls that legitimately expect
   * a 401 (session bootstrap, failed login) and must not trigger a redirect.
   */
  skipUnauthorizedHandler?: boolean
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

let unauthorizedHandler: (() => void) | null = null

/** Registered once by AuthProvider so any 401 clears the session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const hasBody = body !== undefined
  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: hasBody
        ? { Accept: 'application/json', 'Content-Type': 'application/json' }
        : { Accept: 'application/json' },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: options.signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }
    throw new ApiError(0, messageFromPayload(0, null))
  }

  const payload = await parsePayload(response)

  if (!response.ok) {
    if (response.status === 401 && !options.skipUnauthorizedHandler) {
      unauthorizedHandler?.()
    }
    throw new ApiError(
      response.status,
      messageFromPayload(response.status, payload),
      fieldErrorsFromPayload(payload),
    )
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
}
```

- [ ] **Step 5: Create `src/types/common.ts`**

```ts
export type ID = string

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  data: T
}
```

- [ ] **Step 6: Verify**

```bash
pnpm lint && pnpm build
```

Expected: both pass. Nothing imports these modules yet, so there is no browser check for this task.

---

### Task 4: Shared UI Primitives

**Files:**

- Create: `src/components/common/FullPageLoader.tsx`, `src/components/common/ErrorBoundary.tsx`, `src/components/common/notificationContext.ts`, `src/components/common/NotificationProvider.tsx`, `src/components/common/useNotify.ts`
- Modify: `src/app/providers.tsx`
- Test: none

**Interfaces:**

- Consumes: `<ColorModeProvider>` from Task 2.
- Produces:
  - `<FullPageLoader />` — centered spinner filling the viewport
  - `<ErrorBoundary>` — catches render errors, shows a recovery screen
  - `<NotificationProvider>` and `useNotify(): { notify: (message: string, severity?: NotifySeverity) => void }`
  - `type NotifySeverity = 'success' | 'info' | 'warning' | 'error'`

- [ ] **Step 1: Create `src/components/common/FullPageLoader.tsx`**

```tsx
import { Box, CircularProgress } from '@mui/material'

export default function FullPageLoader() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
```

- [ ] **Step 2: Create `src/components/common/ErrorBoundary.tsx`**

A class component because React has no hook equivalent for `componentDidCatch`.

```tsx
import { Box, Button, Stack, Typography } from '@mui/material'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.assign('/')
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 520, textAlign: 'center' }}>
          <Typography variant="h5">Something went wrong</Typography>
          <Typography color="text.secondary">{error.message}</Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Reload the app
          </Button>
        </Stack>
      </Box>
    )
  }
}
```

- [ ] **Step 3: Create `src/components/common/notificationContext.ts`**

```ts
import { createContext } from 'react'

export type NotifySeverity = 'success' | 'info' | 'warning' | 'error'

export interface NotificationContextValue {
  notify: (message: string, severity?: NotifySeverity) => void
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)
```

- [ ] **Step 4: Create `src/components/common/NotificationProvider.tsx`**

```tsx
import { Alert, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  NotificationContext,
  type NotificationContextValue,
  type NotifySeverity,
} from './notificationContext'

interface Notification {
  message: string
  severity: NotifySeverity
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [open, setOpen] = useState(false)

  const notify = useCallback((message: string, severity: NotifySeverity = 'info') => {
    setNotification({ message, severity })
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => setOpen(false), [])

  const value = useMemo<NotificationContextValue>(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification?.severity ?? 'info'}
          variant="filled"
          onClose={handleClose}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}
```

- [ ] **Step 5: Create `src/components/common/useNotify.ts`**

```ts
import { useContext } from 'react'
import { NotificationContext, type NotificationContextValue } from './notificationContext'

export function useNotify(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotify must be used inside <NotificationProvider>.')
  }
  return context
}
```

- [ ] **Step 6: Update `src/app/providers.tsx`**

```tsx
import type { ReactNode } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { NotificationProvider } from '@/components/common/NotificationProvider'
import { ColorModeProvider } from './theme/ColorModeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider>
      <ErrorBoundary>
        <NotificationProvider>{children}</NotificationProvider>
      </ErrorBoundary>
    </ColorModeProvider>
  )
}
```

- [ ] **Step 7: Verify**

```bash
pnpm lint && pnpm build
```

Expected: both pass. The placeholder `App.tsx` from Task 2 still renders; no behavior change is expected in the browser yet.

---

### Task 5: Auth Feature

**Files:**

- Create: `src/features/auth/types.ts`, `src/features/auth/api/auth.api.ts`, `src/features/auth/authContext.ts`, `src/features/auth/AuthProvider.tsx`, `src/features/auth/useAuth.ts`
- Create: `src/app/queryClient.ts`
- Modify: `src/app/providers.tsx`
- Test: none

**Interfaces:**

- Consumes: `api`, `setUnauthorizedHandler`, `ApiError`, `ENDPOINTS`, `env` (Task 3); `<NotificationProvider>` (Task 4).
- Produces:
  - `interface User { id: string; email: string; name?: string; role?: string }`
  - `interface LoginRequest { email: string; password: string }`
  - `interface LoginResponse { user: User }`
  - `type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'`
  - `authApi.login(credentials) / authApi.logout() / authApi.me()`
  - `useAuth(): { user: User | null; status: AuthStatus; login(c: LoginRequest): Promise<void>; logout(): Promise<void> }`
  - `queryClient` from `@/app/queryClient`

- [ ] **Step 1: Create `src/features/auth/types.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/features/auth/api/auth.api.ts`**

This is the only file in the project that knows the auth request and response shapes. The stub block is clearly fenced so it can be deleted in one edit.

```ts
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
```

- [ ] **Step 3: Create `src/app/queryClient.ts`**

```ts
import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry client errors — a 401 or 403 will not fix itself.
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
    mutations: { retry: false },
  },
})
```

- [ ] **Step 4: Create `src/features/auth/authContext.ts`**

```ts
import { createContext } from 'react'
import type { AuthStatus, LoginRequest, User } from './types'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
```

- [ ] **Step 5: Create `src/features/auth/AuthProvider.tsx`**

```tsx
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
```

- [ ] **Step 6: Create `src/features/auth/useAuth.ts`**

```ts
import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './authContext'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
```

- [ ] **Step 7: Update `src/app/providers.tsx`**

`BrowserRouter` goes outermost so route hooks work everywhere inside. `AuthProvider` sits inside `QueryClientProvider` because it calls `useQueryClient`.

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { NotificationProvider } from '@/components/common/NotificationProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { queryClient } from './queryClient'
import { ColorModeProvider } from './theme/ColorModeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ColorModeProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <NotificationProvider>
              <AuthProvider>{children}</AuthProvider>
            </NotificationProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </ColorModeProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: Verify**

```bash
pnpm lint && pnpm build
```

Expected: both pass. The Task 2 placeholder still renders — routes arrive in Task 6.

---

### Task 6: Routing and Route Guards

**Files:**

- Create: `src/routes/paths.ts`, `src/routes/ProtectedRoute.tsx`, `src/routes/PublicOnlyRoute.tsx`
- Test: none

**Interfaces:**

- Consumes: `useAuth` (Task 5), `<FullPageLoader />` (Task 4).
- Produces:
  - `ROUTES` — `{ login: '/login'; dashboard: '/'; videoUpload: '/media/video' }`
  - `<ProtectedRoute />` — an `<Outlet />` wrapper that requires a session
  - `<PublicOnlyRoute />` — an `<Outlet />` wrapper that bounces signed-in users away

- [ ] **Step 1: Create `src/routes/paths.ts`**

No route string is ever written inline in a component; they all come from here.

```ts
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  videoUpload: '/media/video',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
```

- [ ] **Step 2: Create `src/routes/ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FullPageLoader from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from './paths'

export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'unauthenticated') {
    const from = `${location.pathname}${location.search}`
    return <Navigate to={`${ROUTES.login}?from=${encodeURIComponent(from)}`} replace />
  }

  return <Outlet />
}
```

- [ ] **Step 3: Create `src/routes/PublicOnlyRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import FullPageLoader from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from './paths'

export default function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'authenticated') {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint && pnpm build
```

Expected: both pass. Nothing renders these guards yet — Task 7 wires the router.

---

### Task 7: Login Page and Router

**Files:**

- Create: `src/features/auth/components/LoginForm.tsx`, `src/features/auth/pages/LoginPage.tsx`
- Create: `src/features/dashboard/pages/DashboardPage.tsx`
- Create: `src/app/router.tsx`
- Modify: `src/App.tsx`
- Test: none

**Interfaces:**

- Consumes: `useAuth`, `LoginRequest` (Task 5); `ROUTES`, `<ProtectedRoute />`, `<PublicOnlyRoute />` (Task 6); `toDisplayMessage`, `isApiError` (Task 3).
- Produces:
  - `<LoginForm onSubmit={(credentials: LoginRequest) => Promise<void>} />`
  - `<LoginPage />`, `<DashboardPage />`
  - `<AppRoutes />` from `@/app/router`

`DashboardPage` here is temporary and carries a sign-out button so the flow is verifiable before the shell exists. Task 8 replaces it.

- [ ] **Step 1: Create `src/features/auth/components/LoginForm.tsx`**

```tsx
import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { isApiError, toDisplayMessage } from '@/lib/api/errors'
import type { LoginRequest } from '../types'

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})
    try {
      await onSubmit({ email: email.trim(), password })
    } catch (error) {
      setFormError(toDisplayMessage(error))
      if (isApiError(error) && error.fieldErrors) {
        setFieldErrors(error.fieldErrors)
      }
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {formError ? <Alert severity="error">{formError}</Alert> : null}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          autoComplete="email"
          autoFocus
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
          autoComplete="current-password"
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  )
}
```

- [ ] **Step 2: Create `src/features/auth/pages/LoginPage.tsx`**

```tsx
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { env } from '@/lib/env'
import { ROUTES } from '@/routes/paths'
import LoginForm from '../components/LoginForm'
import type { LoginRequest } from '../types'
import { useAuth } from '../useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Only same-site paths are honoured, so ?from= cannot bounce to another origin.
  const requested = searchParams.get('from')
  const from = requested && requested.startsWith('/') ? requested : ROUTES.dashboard

  const handleSubmit = async (credentials: LoginRequest) => {
    await login(credentials)
    navigate(from, { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Card sx={{ width: 420, maxWidth: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h5">{env.appName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue.
              </Typography>
            </Stack>
            <LoginForm onSubmit={handleSubmit} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
```

- [ ] **Step 3: Create `src/features/dashboard/pages/DashboardPage.tsx` (temporary)**

```tsx
import { Box, Button, Stack, Typography } from '@mui/material'
import { useAuth } from '@/features/auth/useAuth'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h5">Dashboard</Typography>
        <Typography color="text.secondary">Signed in as {user?.email}</Typography>
        <Button variant="outlined" onClick={() => void logout()}>
          Sign out
        </Button>
      </Stack>
    </Box>
  )
}
```

- [ ] **Step 4: Create `src/app/router.tsx`**

```tsx
import { Route, Routes } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { ROUTES } from '@/routes/paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 5: Replace `src/App.tsx`**

```tsx
import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/app/router'

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
```

- [ ] **Step 6: Verify**

```bash
pnpm lint && pnpm build
```

Then, with `VITE_AUTH_MODE=stub` in `.env` (copy `.env.example` to `.env` if it does not exist):

```bash
pnpm dev
```

Manual checks at `http://localhost:5173`:

1. Visiting `/` while signed out redirects to `/login?from=%2F`.
2. Submitting `admin@example.com` with a password shorter than 4 characters shows the red alert "Invalid email or password." and the form stays usable.
3. Submitting `admin@example.com` / `password` lands on the dashboard showing "Signed in as admin@example.com".
4. Reloading the page stays on the dashboard — a brief spinner, never a flash of the login form.
5. "Sign out" returns to `/login`.
6. Visiting `/login` while signed in redirects to `/`.

---

### Task 8: App Shell

**Files:**

- Create: `src/components/layout/AppShell.tsx`, `src/components/layout/TopBar.tsx`, `src/components/layout/SideNav.tsx`, `src/components/layout/navItems.ts`, `src/components/layout/UserMenu.tsx`
- Create: `src/components/common/PageHeader.tsx`
- Modify: `src/app/router.tsx`, `src/features/dashboard/pages/DashboardPage.tsx`
- Test: none

**Interfaces:**

- Consumes: `useAuth` (Task 5), `useColorMode` (Task 2), `useNotify` (Task 4), `env` (Task 3), `ROUTES` (Task 6).
- Produces:
  - `<AppShell />` — layout route rendering `<Outlet />` between the top bar and side nav
  - `DRAWER_WIDTH` (number) exported from `SideNav.tsx`
  - `interface NavItem { label: string; to: string; icon: SvgIconComponent }` and `navItems: NavItem[]`
  - `<PageHeader title description actions />`

- [ ] **Step 1: Create `src/components/layout/navItems.ts`**

New admin sections are registered here and nowhere else.

```ts
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { ROUTES } from '@/routes/paths'

export interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: SpaceDashboardOutlinedIcon },
]
```

- [ ] **Step 2: Create `src/components/layout/UserMenu.tsx`**

```tsx
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotify } from '@/components/common/useNotify'
import { useAuth } from '@/features/auth/useAuth'
import { toDisplayMessage } from '@/lib/api/errors'
import { ROUTES } from '@/routes/paths'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { notify } = useNotify()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleClose()
    try {
      await logout()
    } catch (error) {
      notify(toDisplayMessage(error), 'error')
    }
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Open account menu" size="small">
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, border: 1, borderColor: 'divider' } } }}
      >
        <Stack sx={{ px: 2, py: 1.5 }}>
          {user?.name ? <Typography variant="subtitle2">{user.name}</Typography> : null}
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Stack>
        <Divider />
        <MenuItem onClick={() => void handleLogout()}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/TopBar.tsx`**

```tsx
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import { useColorMode } from '@/app/theme/useColorMode'
import { env } from '@/lib/env'
import UserMenu from './UserMenu'

export default function TopBar() {
  const { mode, toggle } = useColorMode()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" noWrap>
          {env.appName}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggle} aria-label="Toggle color mode">
            {mode === 'light' ? (
              <DarkModeOutlinedIcon fontSize="small" />
            ) : (
              <LightModeOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
```

- [ ] **Step 4: Create `src/components/layout/SideNav.tsx`**

Permanent drawer — this app is desktop-only, so there is no temporary variant.

```tsx
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import { navItems } from './navItems'

export const DRAWER_WIDTH = 248

export default function SideNav() {
  const { pathname } = useLocation()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 1.5 }}>
        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {navItems.map(({ label, to, icon: Icon }) => (
            <ListItemButton key={to} component={NavLink} to={to} selected={pathname === to}>
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { variant: 'body2' } }} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
```

- [ ] **Step 5: Create `src/components/layout/AppShell.tsx`**

```tsx
import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import SideNav, { DRAWER_WIDTH } from './SideNav'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopBar />
      <SideNav />
      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, width: `calc(100% - ${DRAWER_WIDTH}px)` }}
      >
        <Toolbar />
        <Box sx={{ p: 3, maxWidth: 1440 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
```

- [ ] **Step 6: Create `src/components/common/PageHeader.tsx`**

```tsx
import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h5">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
      {actions ? <Box>{actions}</Box> : null}
    </Stack>
  )
}
```

- [ ] **Step 7: Replace `src/features/dashboard/pages/DashboardPage.tsx`**

The temporary sign-out button is gone — logout now lives in `UserMenu`.

```tsx
import { Card, CardContent, Stack, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'
import { useAuth } from '@/features/auth/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader title="Dashboard" description={`Signed in as ${user?.email ?? 'unknown user'}`} />
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Nothing here yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Media sections appear in the sidebar as they are added.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}
```

- [ ] **Step 8: Update `src/app/router.tsx` to nest routes inside the shell**

```tsx
import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { ROUTES } from '@/routes/paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 9: Verify**

```bash
pnpm lint && pnpm build
```

```bash
pnpm dev
```

Manual checks:

1. After signing in, the dashboard renders inside the shell: app name top-left, sidebar on the left with "Dashboard" highlighted.
2. The theme toggle in the top bar switches light and dark and the whole shell follows.
3. Clicking the avatar opens a menu showing the signed-in email.
4. "Sign out" from that menu returns to `/login`.
5. The login page still renders full-bleed with no shell around it.

---

### Task 9: Video Upload Page, Not Found, and Remaining Primitives

**Files:**

- Create: `src/features/media/video/pages/VideoUploadPage.tsx`
- Create: `src/components/common/NotFoundPage.tsx`, `src/components/common/EmptyState.tsx`, `src/components/common/ConfirmDialog.tsx`
- Modify: `src/routes/paths.ts` (already contains `videoUpload` — verify only), `src/components/layout/navItems.ts`, `src/app/router.tsx`
- Test: none

**Interfaces:**

- Consumes: `<PageHeader />` (Task 8), `ROUTES` (Task 6), `<AppShell />` (Task 8).
- Produces:
  - `<VideoUploadPage />` at `ROUTES.videoUpload` (`/media/video`)
  - `<NotFoundPage />`, `<EmptyState icon title description action />`, `<ConfirmDialog open title description confirmLabel onConfirm onCancel />`

`VideoUploadPage` is intentionally a stub: it establishes the folder shape and the route so the real upload UI has somewhere to land.

- [ ] **Step 1: Create `src/features/media/video/pages/VideoUploadPage.tsx`**

```tsx
import { Card, CardContent, Typography } from '@mui/material'
import PageHeader from '@/components/common/PageHeader'

export default function VideoUploadPage() {
  return (
    <>
      <PageHeader title="Video Upload" description="YouTube video IDs and uploaded video assets." />
      <Card>
        <CardContent>
          <Typography variant="h6">Hi from video upload page</Typography>
        </CardContent>
      </Card>
    </>
  )
}
```

- [ ] **Step 2: Add the nav entry in `src/components/layout/navItems.ts`**

```ts
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { ROUTES } from '@/routes/paths'

export interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: SpaceDashboardOutlinedIcon },
  { label: 'Video Upload', to: ROUTES.videoUpload, icon: VideocamOutlinedIcon },
]
```

- [ ] **Step 3: Create `src/components/common/NotFoundPage.tsx`**

```tsx
import { Box, Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5">Page not found</Typography>
        <Typography color="text.secondary">
          The page you were looking for does not exist.
        </Typography>
        <Button component={Link} to={ROUTES.dashboard} variant="contained">
          Back to dashboard
        </Button>
      </Stack>
    </Box>
  )
}
```

- [ ] **Step 4: Create `src/components/common/EmptyState.tsx`**

```tsx
import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', py: 8, px: 3, textAlign: 'center', color: 'text.secondary' }}
    >
      {icon ? <Box sx={{ fontSize: 40, lineHeight: 1 }}>{icon}</Box> : null}
      <Typography variant="subtitle1" color="text.primary">
        {title}
      </Typography>
      {description ? <Typography variant="body2">{description}</Typography> : null}
      {action ? <Box sx={{ pt: 1 }}>{action}</Box> : null}
    </Stack>
  )
}
```

- [ ] **Step 5: Create `src/components/common/ConfirmDialog.tsx`**

```tsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      {description ? (
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      ) : null}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={busy}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

- [ ] **Step 6: Update `src/app/router.tsx`**

```tsx
import { Route, Routes } from 'react-router-dom'
import NotFoundPage from '@/components/common/NotFoundPage'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import VideoUploadPage from '@/features/media/video/pages/VideoUploadPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { ROUTES } from '@/routes/paths'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.videoUpload} element={<VideoUploadPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

- [ ] **Step 7: Verify**

```bash
pnpm lint && pnpm build
```

```bash
pnpm dev
```

Manual checks:

1. The sidebar now shows "Dashboard" and "Video Upload".
2. Clicking "Video Upload" navigates to `/media/video` and renders the heading **Hi from video upload page** inside the shell, with "Video Upload" highlighted in the sidebar.
3. Reloading `/media/video` directly stays on that page after the session restores.
4. Visiting `/does-not-exist` shows the "Page not found" screen.

---

### Task 10: Documentation

**Files:**

- Create: `src/features/media/README.md`, `src/lib/upload/README.md`
- Modify: `README.md`
- Test: none

**Interfaces:**

- Consumes: everything built above.
- Produces: no code.

- [ ] **Step 1: Replace `README.md`**

````markdown
# Admin UI

React admin panel for media administration — YouTube video IDs, and audio,
image, and PDF uploads. All requests go through a Node.js backend, which talks
to Supabase and S3. The frontend never contacts Supabase or S3 directly.

## Stack

Vite · React · TypeScript · MUI · React Router · TanStack Query · pnpm

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The app runs at http://localhost:5173. With `VITE_AUTH_MODE=stub` you can sign
in with any email containing `@` and any password of 4+ characters, without a
backend running.

## Scripts

| Command        | Purpose                             |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Start the dev server                |
| `pnpm build`   | Type-check and build for production |
| `pnpm preview` | Serve the production build locally  |
| `pnpm lint`    | Run ESLint                          |
| `pnpm format`  | Format with Prettier                |

## Environment variables

| Variable            | Default    | Purpose              |
| ------------------- | ---------- | -------------------- |
| `VITE_API_BASE_URL` | `/api`     | Backend base URL     |
| `VITE_APP_NAME`     | `Admin UI` | Shown in the top bar |
| `VITE_AUTH_MODE`    | `api`      | `api` or `stub`      |

In development, Vite proxies `/api` to `http://localhost:3000`, which keeps the
session cookie same-origin and avoids CORS. In production, serve the UI and the
API from the same origin, or set `VITE_API_BASE_URL` explicitly.

## Backend contract (not yet confirmed)

| Method | Path               | Response                    |
| ------ | ------------------ | --------------------------- |
| POST   | `/api/auth/login`  | `{ user }` + session cookie |
| POST   | `/api/auth/logout` | 204                         |
| GET    | `/api/auth/me`     | `{ user }` or 401           |

The backend sets an httpOnly, SameSite session cookie; the UI never handles
tokens. Every request sends `credentials: 'include'`, and any 401 clears the
session and redirects to `/login`.

These shapes are assumptions. When the real backend lands, the only files that
change are `src/lib/api/endpoints.ts` and `src/features/auth/api/auth.api.ts`.
Open assumptions are listed in
`docs/superpowers/specs/2026-09-06-admin-ui-base-project-design.md`.

## Folder conventions

```
src/
  app/         providers, router, query client, theme
  routes/      route paths and guards
  features/    one folder per feature: api/ pages/ components/ hooks/ types.ts
  components/  layout/ (app shell) and common/ (shared UI)
  lib/         api client, env, upload machinery
  types/       shared type definitions
```

Rules:

- A feature never imports another feature's internals. Shared code moves to
  `lib/` or `components/`.
- All backend paths live in `src/lib/api/endpoints.ts`.
- All route paths live in `src/routes/paths.ts`.
- Register new sidebar entries in `src/components/layout/navItems.ts`.
- Desktop only — minimum supported width is about 1280px.

## Adding a page

1. Create `src/features/<name>/pages/<Name>Page.tsx`.
2. Add its path to `src/routes/paths.ts`.
3. Add the route inside the `<AppShell />` branch of `src/app/router.tsx`.
4. Add a sidebar entry in `src/components/layout/navItems.ts`.
````

- [ ] **Step 2: Create `src/features/media/README.md`**

```markdown
# Media features

One folder per media type, each following the standard feature shape:
```

media/
video/ YouTube IDs and uploaded video assets
audio/ audio uploads
images/ image uploads
pdf/ document uploads

```

Each folder contains:

```

api/<name>.api.ts backend calls, using ENDPOINTS from @/lib/api/endpoints
pages/ routed pages
components/ UI used only by this feature
types.ts feature types

```

All four types share the upload machinery in `@/lib/upload`; they differ only
in accepted MIME types, size limits, and metadata fields. YouTube is the
exception — it stores a validated video ID with no file, so it uses the
metadata and listing UI but not the uploader.
```

- [ ] **Step 3: Create `src/lib/upload/README.md`**

```markdown
# Upload machinery (not implemented yet)

Files upload as `multipart/form-data` to the Node backend, which streams them
to S3. The browser never talks to S3 directly.

Planned contents:

| File            | Responsibility                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uploader.ts`   | `XMLHttpRequest`-based POST of a `FormData` body. XHR rather than `fetch`, because it is the only way to observe upload progress. Cancellation maps to `xhr.abort()`. |
| `useUpload.ts`  | Hook exposing `{ start, cancel, progress, status, error }`.                                                                                                           |
| `validation.ts` | MIME type and size checks that run before the request starts.                                                                                                         |
| `types.ts`      | `UploadStatus`, `UploadConfig`, `UploadResult`.                                                                                                                       |

Client-side validation is not cosmetic: because uploads pass through the Node
process, it is what prevents an oversized file from ever reaching it.

Backend prerequisites this assumes:

- a raised body-size limit
- streaming multipart parsing (for example busboy or multer piping straight to
  S3) rather than buffering whole files in memory
```

- [ ] **Step 4: Final verification**

```bash
pnpm lint && pnpm build
```

Expected: both pass with no warnings that reference project source files.

```bash
pnpm dev
```

Walk the full spec success criteria:

1. Signed out, `/` redirects to `/login`.
2. Bad credentials show an inline error; the app does not crash.
3. Good credentials land on the dashboard inside the shell.
4. Reload keeps the session with no flash of the login page.
5. The sidebar navigates to Video Upload, which shows "Hi from video upload page".
6. The theme toggle works and survives reload.
7. The account menu signs out and returns to `/login`.
8. An unknown path shows the not-found page.

---

## Notes for the Executor

- **Verification replaces tests here.** Every task ends with `pnpm lint && pnpm build`
  plus the named browser checks. Do not substitute a test file for a browser check.
- **Do not run git commands.** Leave staging and committing to the user.
- **If a dependency version conflicts** (for example a peer-dependency warning between
  MUI and React), install the versions the package manager proposes and note it in
  your task report rather than pinning older majors.
- **The auth contract is unconfirmed.** If a browser check fails because the backend
  disagrees with the assumed shapes, that is expected — the stub mode is what the
  checks run against. Do not redesign the auth flow to fit a backend that does not
  exist yet.
