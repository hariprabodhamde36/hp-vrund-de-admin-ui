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

| Variable            | Default    | Purpose                                     |
| ------------------- | ---------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`     | Backend base URL                            |
| `VITE_APP_NAME`     | `Admin UI` | Shown in the top bar and the document title |
| `VITE_AUTH_MODE`    | `api`      | `api` or `stub`                             |

The `.env.example` file ships with `VITE_AUTH_MODE=stub` so the app runs without a backend; unsetting the variable falls back to the `api` default.

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

## Deployment (Vercel)

`vercel.json` sets the build to `pnpm build` with output in `dist/`, rewrites all
non-`/api` paths to `index.html` so client-side routes survive a hard refresh, and
marks hashed assets immutable.

Two things to do in the Vercel project before the first deploy:

1. **Set `VITE_AUTH_MODE=api` in the environment variables.** The build deliberately
   fails with `stub` — that guard exists so a deployment can never ship the fake
   client-side login.
2. **Add an `/api` rewrite pointing at your Node backend** once it exists:

   ```json
   { "source": "/api/(.*)", "destination": "https://your-backend.example.com/api/$1" }
   ```

   Put it _before_ the SPA rewrite. This is not optional cosmetics: the session is an
   httpOnly cookie, so routing the API through the same origin as the UI is what keeps
   the cookie working without cross-site cookie settings. Until you add it, `/api`
   requests 404 rather than silently returning `index.html`.

## Folder conventions

```
src/
  app/         providers, router, query client, theme
  routes/      route paths and guards
  features/    one folder per feature: api/ pages/ components/ hooks/ types.ts
               auth/ and media/{video,audio,images,pdf}/
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
- All colours and fonts live in `src/app/theme/tokens.ts` — see Theming below.
- Desktop only — minimum supported width is about 1280px.

`/` redirects to `/media/video`; there is no separate landing page.

## Theming

Every colour, the font and the corner radius come from one file:

```
src/app/theme/tokens.ts
```

Change a value there and the whole app follows — nothing else in the codebase
hardcodes a colour or a font family. The brand colour is orange (`#F97316`);
the typeface is Inter.

`palette.ts`, `components.ts` and `index.ts` sit beside it and only translate
those tokens into MUI's theme shape. If you swap the font family, update the
Google Fonts link in `index.html` to match.

There is a single light theme. No dark mode, no theme toggle.

## Adding a page

1. Create `src/features/<name>/pages/<Name>Page.tsx`.
2. Add its path to `src/routes/paths.ts`.
3. Add the route inside the `<AppShell />` branch of `src/app/router.tsx`.
4. Add a sidebar entry in `src/components/layout/navItems.ts`.
