# PomoMate – Work Together

Mobile-first, minimalist Pomodoro + collaborative work platform built with
React Native (Expo) and TypeScript. Mobile and web share platform-agnostic
business logic; platform-specific code is isolated.

> **This repository currently contains M01 — Foundation / Shared Core.**
> UI (M02), Supabase/backend (M03), and WebRTC (M04) are intentionally NOT
> implemented here — only the clean, buildable foundation they build on.

## Architecture

```
src/
  core/          Shared business logic & domain rules (pure, platform-agnostic)
  navigation/    React Navigation infrastructure (typed) + placeholder screens
  state/         Global state (Zustand stores)
  services/      API client abstraction + abstract service interfaces
  config/        Environment/config system (.env based)
  platform/      Platform-specific code (.native.ts / .web.ts + Platform.select)
  types/         Shared TypeScript domain models
  utils/         Shared utility functions
```

### Layers

- **types** — Domain models: `User`, `Room`, `RoomMember`, `Task`, `TimerState`,
  `Message`, `Subscription`, `Referral`.
- **core** — Pomodoro cycle rules and pure helpers (no side effects).
- **state** — Zustand stores: `timerStore`, `taskStore`, `roomStore`,
  `userStore`, `chatStore`.
- **services** — Fetch-based `HttpClient` (get/post/put/delete/patch, request &
  response interceptors, pluggable auth-token hook, unified `ApiError`), plus
  abstract service interfaces (`AuthService`, `RoomService`, `TaskService`,
  `ChatService`, `SubscriptionService`) whose implementations land in M03/M08.
- **config** — Typed access to env vars (`EXPO_PUBLIC_*`). No secrets in source.
- **platform** — `storage` abstraction with a real `.native.ts` (AsyncStorage) /
  `.web.ts` (localStorage) file split + an in-memory fallback (`storage.ts`),
  and a `Platform.select` example (`platformInfo.ts`).

## Environment / Config

Secrets are never committed. Copy the example file and fill in real values:

```bash
cp .env.example .env
```

Required keys (all prefixed `EXPO_PUBLIC_` so they are safe for the client
bundle — server-only secrets must stay on the backend):

- `EXPO_PUBLIC_ENV` — `dev` | `staging` | `prod`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_WEBRTC_SIGNALING_URL`

## Scripts

```bash
npm run start       # start Expo dev server
npm run android     # run on Android
npm run ios         # run on iOS
npm run web         # run on web (requires web deps added in M06)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
```

## Verification (M01)

- `npm run typecheck` — passes (0 errors)
- `npm run lint` — passes (0 errors, 0 warnings)
- `npx expo export --platform android` — bundles successfully

## Next modules

- **M02** — UI / UX (replaces navigation placeholder screens)
- **M03** — Backend + Supabase (implements service interfaces against the API client)
- **M04** — WebRTC / P2P rooms
