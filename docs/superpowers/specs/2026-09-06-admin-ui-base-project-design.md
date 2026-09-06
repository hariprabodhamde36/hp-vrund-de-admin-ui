# Admin UI Base Project — Design

**Date:** 2026-09-06
**Status:** Approved for planning
**Repo:** hp-vrund-de-admin-ui (frontend only)

## Purpose

Scaffold the base React admin UI that later grows into a media administration
panel: YouTube video IDs, and audio, image, and PDF uploads. This document
covers the base project only — the app shell, authentication, and the
conventions that future features follow. No media feature is implemented here.

## Scope

**In scope:** Vite + React + TypeScript project, MUI theming, app shell
(top bar, permanent side navigation, user menu), login page, protected
routing, session handling, typed API client, TanStack Query setup, lint and
format tooling, documented folder conventions.

**Out of scope:** every media feature, the upload implementation, the Node.js
backend, tests.

## Constraints and Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Repo scope | Frontend only | Node.js backend lives elsewhere. |
| Target | Desktop web only | No mobile layouts; permanent sidebar, min width ~1280px. |
| Supabase client | Not installed | Every request goes through the Node backend; a browser client would ship keys for no benefit. |
| Session | httpOnly cookie, set by the backend | UI never handles tokens; immune to token theft via XSS. |
| Uploads | Multipart POST through the backend | User decision. Backend streams to S3. (Direct-to-S3 presigned URLs were considered and rejected.) |
| Server state | TanStack Query | Caching, retries, and request state for the data screens to come. |
| Tests | None | Explicitly deferred by the user. No test deps, no `test` script. |
| Package manager | pnpm | |

## Architecture

Feature-sliced layout. Each feature owns its pages, components, API calls, and
types; shared machinery lives in `lib/` and `components/`. Adding a media
section means adding a sibling folder under `features/media/`, not editing
existing features.

### Directory Structure

```
src/
  main.tsx                     root render
  App.tsx                      providers + router
  vite-env.d.ts                typed ImportMetaEnv

  app/
    providers.tsx              ThemeProvider + CssBaseline + QueryClientProvider
                               + AuthProvider + NotificationProvider
    router.tsx                 route tree
    queryClient.ts             query defaults
    theme/
      index.ts                 light + dark themes
      palette.ts
      components.ts            MUI component overrides

  routes/
    paths.ts                   ROUTES constant; no route string literals in JSX
    ProtectedRoute.tsx         guards authenticated routes

  features/
    auth/
      api/auth.api.ts          login / logout / me
      pages/LoginPage.tsx
      components/LoginForm.tsx
      AuthProvider.tsx
      useAuth.ts
      types.ts
    dashboard/
      pages/DashboardPage.tsx  placeholder landing page
    media/
      README.md                documents the per-media-type convention; empty

  components/
    layout/
      AppShell.tsx             TopBar + SideNav + <Outlet/>
      TopBar.tsx
      SideNav.tsx
      navItems.ts              navigation config
      UserMenu.tsx
    common/
      PageHeader.tsx
      ErrorBoundary.tsx
      FullPageLoader.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
      NotificationProvider.tsx snackbar host, exposes useNotify()

  lib/
    api/
      apiClient.ts             fetch wrapper
      endpoints.ts             every URL path in one file
      errors.ts                ApiError and message normalization
    upload/
      README.md                intended shape; no implementation yet
    env.ts                     typed env access, fails fast when required vars are missing

  types/
    common.ts                  Paginated<T>, ApiResponse<T>, ID
```

### Feature Folder Convention

Every feature added later uses the same internal shape:

```
features/<name>/
  api/<name>.api.ts
  pages/
  components/
  hooks/
  types.ts
```

Rules: a feature never imports from another feature's internals; shared code is
promoted to `lib/` or `components/common/`. Cross-feature reuse goes through
`lib/`, never through a sibling's folder.

## Authentication

### Flow

1. User submits email and password on `/login`.
2. UI calls `POST /api/auth/login`. The backend authenticates against Supabase
   and sets an httpOnly, SameSite cookie.
3. UI stores the returned user object in `AuthProvider` state. No token is
   stored anywhere in the browser.
4. On app boot, `AuthProvider` calls `GET /api/auth/me` to restore the session.
   Until that call settles, the app renders `FullPageLoader`.
5. `POST /api/auth/logout` clears the cookie; the UI clears state and redirects
   to `/login`.

### Auth State Machine

`AuthProvider` exposes `status: 'loading' | 'authenticated' | 'unauthenticated'`
plus `user`, `login`, and `logout`. `ProtectedRoute` renders the loader while
`loading`, the route while `authenticated`, and redirects to
`/login?from=<path>` while `unauthenticated`.

### 401 Handling

Any API response with status 401 clears auth state and redirects to `/login`.
This lives in `apiClient.ts` so no caller repeats it.

### Assumed API Contract

Endpoint paths are not final. All of them live in `lib/api/endpoints.ts`, so
adapting to the real backend is a single-file change.

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | 200 `{ user }` + Set-Cookie; 401 `{ message }` |
| POST | `/api/auth/logout` | — | 204 |
| GET | `/api/auth/me` | — | 200 `{ user }`; 401 when no session |

`User` is `{ id: string; email: string; name?: string; role?: string }`.

### Development Stub

`VITE_AUTH_MODE=stub` makes `auth.api.ts` resolve against an in-memory fake
user instead of the network, so the full login → shell → dashboard flow runs
before the backend exists. `VITE_AUTH_MODE=api` (the default in
`.env.example`) uses real endpoints. The stub is one clearly marked module,
deleted once the backend is live.

### Open Assumptions (auth contract unconfirmed)

The backend auth contract does not exist yet. The UI is built to the
assumptions below; every one of them is confined to `lib/api/endpoints.ts`,
`lib/api/apiClient.ts`, and `features/auth/api/auth.api.ts`, so revising them
later touches three files and no components.

| # | Assumption | If wrong |
|---|---|---|
| 1 | The backend refreshes the Supabase session server-side, so a 401 means the session is genuinely over. | `apiClient` needs a queued refresh-and-retry interceptor so concurrent 401s trigger one refresh, not many. |
| 2 | No CSRF token; the cookie is `SameSite=Lax` on a single origin. | `apiClient` must attach a CSRF header to every mutating request. |
| 3 | The backend sets the cookie and returns no tokens in the body. | The "UI never handles tokens" premise inverts; storage and `Authorization` headers become the UI's problem. |
| 4 | `role` is optional and unused; any authenticated user may use the panel. | `ProtectedRoute` needs role checks, `navItems` needs per-item gating, and 403 needs distinct handling from 401. |
| 5 | `GET /api/auth/me` returns 401 when logged out. | If it returns 200 with a null user, `AuthProvider` branches differently and the global 401 handler must not fire. |
| 6 | Errors arrive as `{ message }`. | `errors.ts` normalization changes; inline field errors may become available. |

## API Client

`apiClient.ts` is a thin `fetch` wrapper providing:

- a base URL from `VITE_API_BASE_URL`, defaulting to `/api`
- `credentials: 'include'` on every request, so the session cookie is sent
- JSON serialization and parsing, with correct handling of 204 responses
- non-2xx responses converted to a typed `ApiError` carrying status, message,
  and optional field errors
- a global 401 hook that clears the session

It exposes `get`, `post`, `put`, `patch`, and `del`, each generic over the
response type. Uploads will later bypass this module because progress
reporting requires `XMLHttpRequest`.

## Layout and Theming

`AppShell` is a permanent MUI drawer beside a top bar, with routed content in
the remaining space. Desktop-only means no temporary drawer and no mobile
breakpoint handling.

- **TopBar:** app name from `VITE_APP_NAME`, theme toggle, `UserMenu`.
- **SideNav:** driven by `navItems.ts`; media sections are added there later.
- **UserMenu:** avatar, email, logout.

The theme defines light and dark palettes with a toggle persisted to
`localStorage`. Component overrides in `theme/components.ts` set consistent
defaults so pages avoid one-off `sx` styling.

## Data Fetching

`QueryClient` defaults: `retry: 1`, `staleTime: 30_000`,
`refetchOnWindowFocus: false`. Queries never retry a 401. Server state belongs
to TanStack Query; only session and UI preferences live in React context.

## Error Handling

- **Network and API errors:** surfaced through `useNotify()` snackbars, or
  inline on forms when the error carries field-level detail.
- **Render errors:** `ErrorBoundary` wraps the shell and shows a recovery
  screen instead of a blank page.
- **Missing configuration:** `env.ts` throws at startup rather than failing
  mysteriously later.

## Upload Architecture (Recorded, Not Implemented)

Recorded now because it shapes the layout; built when the backend endpoints
exist.

Files upload as `multipart/form-data` to the Node backend, which streams them
to S3. `lib/upload/` will hold a generic `XMLHttpRequest`-based uploader
(`fetch` cannot report upload progress), a `useUpload` hook exposing
`start / cancel / progress / status / error`, and per-media-type MIME and size
validation that runs before the request starts.

The four media types share this pipeline with different configuration. YouTube
is the exception: it is a validated ID string with no file, so it shares the
metadata and listing UI but skips the uploader entirely.

Backend prerequisites the UI assumes: a raised body-size limit and streaming
multipart parsing rather than buffering whole files in memory.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | no | `/api` | Backend base URL; the dev proxy makes the default work locally. |
| `VITE_APP_NAME` | no | `Admin UI` | Shown in the top bar and document title. |
| `VITE_AUTH_MODE` | no | `api` | `api` or `stub`. |

Vite dev server proxies `/api` to `http://localhost:3000`, keeping cookies
same-origin in development and avoiding CORS and SameSite problems. Production
expects the UI and API behind one origin, or `VITE_API_BASE_URL` set explicitly.

## Tooling

ESLint with typescript-eslint and the React hooks plugin, Prettier, and a husky
`pre-commit` hook running lint-staged. Scripts: `dev`, `build`, `preview`,
`lint`, `format`. No `test` script.

## Success Criteria

1. `pnpm install && pnpm dev` starts the app with no errors.
2. With `VITE_AUTH_MODE=stub`, logging in reaches the dashboard inside the app
   shell; logout returns to the login page.
3. Visiting a protected route while unauthenticated redirects to `/login` and
   returns to the original path after login.
4. Reloading while authenticated restores the session without a flash of the
   login page.
5. Invalid credentials show an inline form error, not a crash.
6. The theme toggle switches light and dark and survives reload.
7. `pnpm build` and `pnpm lint` both pass cleanly.
8. The README documents setup, environment variables, folder conventions, and
   the assumed API contract.
