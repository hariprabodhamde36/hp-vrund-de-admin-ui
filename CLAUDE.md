# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # pnpm only — never npm or yarn
pnpm dev              # dev server on :5173, proxies /api → localhost:3000
pnpm build            # tsc --noEmit && vite build
pnpm lint             # eslint .
pnpm format           # prettier
```

**There are no tests, deliberately.** The user explicitly deferred testing. Do not add Vitest, React Testing Library, MSW, a `test` script, or any `*.test.*` file unless asked. Verification here is `pnpm lint && pnpm build`, plus running the app.

**`pnpm build` fails on purpose when `VITE_AUTH_MODE=stub`.** `.env.example` ships `stub`, so a fresh `.env` cannot produce a production bundle. Two guards enforce this: `vite.config.ts` throws at build time via `loadEnv`, and `src/lib/env.ts` throws at runtime under `import.meta.env.PROD`. To build, set `VITE_AUTH_MODE=api` in `.env` first. This is not a bug — it prevents shipping a bundle whose auth is faked client-side.

## Architecture

Desktop-only admin panel for media administration. Feature-sliced `src/`: each feature owns its pages, components, API calls and types; shared machinery lives in `lib/` and `components/`. A feature never imports another feature's internals — promote shared code to `lib/` or `components/common/`.

**The frontend never talks to Supabase or S3.** Every request goes through a Node.js backend that does not exist yet. Never install `@supabase/supabase-js`.

### The backend contract is unconfirmed

This is the single most important thing to know before changing anything auth-related. The assumed contract — `POST /auth/login` → `{ user }`, `POST /auth/logout` → 204, `GET /auth/me` → `{ user }` or 401 — is a guess recorded in `docs/superpowers/specs/2026-09-06-admin-ui-base-project-design.md` under "Open Assumptions". It is deliberately confined to exactly two files:

- `src/lib/api/endpoints.ts` — every backend URL path in the project
- `src/features/auth/api/auth.api.ts` — every auth request/response shape, plus a fenced dev stub

Keep it that way. No component, page, guard or hook should ever know a URL or a wire shape.

### Auth flow

Session is an httpOnly cookie set by the backend; the UI never handles tokens. `apiClient.ts` sends `credentials: 'include'` on every request and routes any 401 to a single handler that `AuthProvider` registers, which clears the session.

Two calls opt out of that handler with `skipUnauthorizedHandler: true`, and this is load-bearing — removing it breaks the app:

- **login**, so a rejected sign-in renders an inline form error instead of triggering a redirect
- **boot `me()`**, because a 401 at startup is the normal "logged out" answer, not a session expiry

`AuthProvider` exposes `status: 'loading' | 'authenticated' | 'unauthenticated'`. It starts at `loading`, and **both** route guards render `FullPageLoader` in that state — that is what prevents a flash of the login page on reload. Don't add a code path where `unauthenticated` is observable before `me()` settles.

`VITE_AUTH_MODE=stub` swaps `auth.api.ts` to an in-browser fake (any email containing `@`, any password of 4+ characters) so the app runs with no backend. The stub block is fence-commented for deletion in one edit when the real backend lands.

### Single sources of truth

Change these files rather than editing call sites:

| File                                | Owns                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/app/theme/tokens.ts`           | Every colour, the font family, base size, weights, radius. Nothing else in the codebase hardcodes a colour or font. |
| `src/routes/paths.ts`               | Every route string. No route literal appears in a component.                                                        |
| `src/lib/api/endpoints.ts`          | Every backend path.                                                                                                 |
| `src/components/layout/navItems.ts` | Every sidebar entry.                                                                                                |

### Theme

One light theme, orange brand colour, Inter. **There is no dark mode and no theme toggle** — that machinery was deliberately deleted. `palette.ts`, `components.ts` and `index.ts` only translate `tokens.ts` into MUI's shape.

### Routing

`/` redirects to `/media/video`; there is no landing page. Public routes sit under `PublicOnlyRoute`, everything else under `ProtectedRoute` → `AppShell` (which supplies the top bar and permanent sidebar via `<Outlet />`). The catch-all `path="*"` must stay last and outside the shell.

Media features are stub pages today (`video`, `audio`, `images`, `pdf`) — routed, in the sidebar, no upload logic. They share one intended pipeline; see `src/lib/upload/README.md` for the shape it will take. Uploads go **through the backend** as multipart, not direct-to-S3 presigned, and will need `XMLHttpRequest` rather than `fetch` for progress.

### Adding a page

1. `src/features/<name>/pages/<Name>Page.tsx`
2. Add its path to `src/routes/paths.ts`
3. Add the route inside the `<AppShell />` branch of `src/app/router.tsx`
4. Add a sidebar entry in `src/components/layout/navItems.ts`

## Conventions

- Context state uses a **three-file split** — `xContext.ts` (context + types), `XProvider.tsx` (component only), `useX.ts` (hook only). Auth and notifications both follow it. It exists to satisfy `react-refresh/only-export-components`; collapsing it breaks Fast Refresh.
- `@/` resolves to `src/`. Use it for cross-folder imports; relative imports only within the same folder.
- TypeScript runs with `strict`, `noUnusedLocals`, `noUnusedParameters` and `verbatimModuleSyntax` — type-only imports need `import type`.
- MUI is v9: `Stack` does **not** accept `alignItems` / `justifyContent` as props; they belong in `sx`.
- Desktop only (~1280px minimum). The drawer is `variant="permanent"`; there are no mobile breakpoints by design.

## Design records

`docs/superpowers/specs/` holds the design spec (including the open auth assumptions and what each would cost if wrong); `docs/superpowers/plans/` holds the implementation plan the codebase was built from. Consult the spec before changing auth, theming or the upload approach — it records why, not just what.
