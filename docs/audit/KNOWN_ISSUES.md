# Known Issues, Gaps & Technical Debt

**Verified against the code on 2026-10-26.** Every entry below was confirmed by
reading the file named, not inferred. This file supersedes any conflicting claim
in [`archive/PRODUCTION_AUDIT.md`](../archive/PRODUCTION_AUDIT.md).

Agents: read this before planning a feature. It is the difference between
building on something real and building on a prototype.

---

## Severity key

|                | Meaning                                                           |
| -------------- | ----------------------------------------------------------------- |
| 🔴 **Blocker** | A user could be harmed, or the feature is fake while looking real |
| 🟠 **High**    | Blocks a release or a whole feature area                          |
| 🟡 **Medium**  | Real debt; costs time on every change                             |
| ⚪ **Low**     | Cleanup                                                           |

---

## 🔴 KI-3 — SOS notifies nobody

**`apps/mobile/components/EmergencyModal.tsx`**

The emergency screen renders "Emergency Calling…", "Notifying your contacts,
emergency services, and sharing your location", a ring of six contacts and
"Notifying Nearby Volunteers…". None of it happens. There is no phone call, no
SMS, no push, no server call, and no location upload. The contacts in the ring
are a hardcoded array (`Police`, `EMS`, `Mom`, `Security`, `Dad`, `Guard`) — not
the user's `trustedContacts`.

`shareLocationOnSos` and `sendSmsOnSos` are stored in Postgres and read by
`SettingsService`, then **never used by anything**.

This is the highest-stakes item in the repo: a user in danger could believe help
is coming. Until it is implemented, the screen should say it is a demo.

**To fix:** a `POST /api/v1/sos` endpoint that records an incident and fans out to
trusted contacts (SMS via a provider, push, and a shareable live-location link),
plus `expo-location` on the client. Depends on KI-2.

---

## 🔴 KI-2 — There is no real map, and no real coordinates

**`apps/api/prisma/schema.prisma`, `danger-zones.service.ts`, `App.tsx`**

`DangerZone` stores `top: String` and `left: String` — CSS percentages like
`"45%"` — positioned absolutely over a static JPEG
(`apps/mobile/assets/images/map_bg.jpg`). There is no map SDK, no tile layer, no
latitude/longitude field anywhere in the system, and no device location is ever
read.

Worse, `DangerZonesController.create` **fabricates** the position of every new
report:

```ts
const top = `${48 + Math.random() * 4}%`;
const left = `${48 + Math.random() * 4}%`;
```

So a reported danger zone has no relationship to where the user was. Reports are
also global — `findAll()` returns every zone ever created, unfiltered by distance.

**To fix:** add `latitude Float` / `longitude Float` (+ PostGIS or a geohash index
for radius queries), accept coordinates from the client, render with
`react-native-maps`, and query by bounding box. The percentage fields can be
dropped once the static map is gone.

---

## 🔴 KI-1 — The API address is a hardcoded LAN IP

**`apps/mobile/services/apiService.ts:5-6`**

```ts
const LAN_IP = "192.168.100.81";
export const API_BASE_URL = `http://${LAN_IP}:3005`;
```

`EXPO_PUBLIC_API_URL` is defined in `.env.example` and read by nothing. Any new
machine, network or build needs a source edit, and a shipped build points at
someone's home router over plain HTTP.

Compounding it: `apps/api/src/main.ts` defaults `API_PORT` to **3001** while the
client assumes **3005**.

**To fix:** `process.env.EXPO_PUBLIC_API_URL ?? <dev default>`, align the port
default to 3005, and require HTTPS for any non-dev build.

---

## 🟠 KI-4 — Auth state is in memory only

**`apps/mobile/services/apiService.ts`, `apps/mobile/App.tsx`**

The JWT lives in a module-level `let currentToken` and `isAuthenticated` is
`useState(false)` in `App.tsx`. Consequences:

- Every app restart logs the user out — unacceptable for an app you open mid-crisis.
- `handleLogout` flips the boolean but **never calls `setAuthToken(null)`**, so the
  token stays in memory and in the `ApiClient` instance.
- Tokens expire after 7 days (`auth.module.ts`) with no refresh flow and no 401
  handling, so expiry surfaces as a generic "Failed to load application data".
- `AuthScreen.tsx` ships prefilled credentials: `josim@example.com` / `password`.

**To fix:** `expo-secure-store` for the token, a real auth context or restored
session on boot, clear-on-logout, a refresh token, and a 401 interceptor in
`ApiClient`.

---

## 🟠 KI-5 — No Prisma migrations exist

`apps/api/prisma/` contains only `schema.prisma` and `seed.ts`. There is **no
`migrations/` directory**. The schema has only ever been applied with `db push`,
which means no reviewable history and no safe production deploy path.

`archive/PRODUCTION_AUDIT.md` claims "Database migrations are tracked". It is
wrong.

**To fix:** `prisma migrate dev --name init` against a clean database to baseline,
then migrations only.

---

## 🟠 KI-7 — Settings updates are unvalidated

**`apps/api/src/settings/settings.controller.ts`**

```ts
async updateSettings(@Request() req: any, @Body() body: any)
```

`body: any` opts out of the global `ValidationPipe` — its own source comment admits
"In a real app we'd validate this with DTOs". Every other endpoint has a DTO.

The service also replaces trusted contacts by **deleting all of them and
recreating** (`deleteMany` then `createMany`), which churns primary keys on every
save and is not transactional — a failure between the two leaves the user with
**zero emergency contacts**. For a safety app that is a real hazard.

**To fix:** `UpdateSettingsDto` with nested validation, and an upsert-by-id inside
`prisma.$transaction`.

---

## 🟠 KI-8 — Three features are UI-only mocks

| Feature               | File                       | What is fake                                                                                                                                                                  |
| --------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Follow Me             | `FollowMeModal.tsx`        | `shareLink` is the constant `https://lumo.example/follow/jS8fD9kL`. No session is created, no location streamed. "Start Sharing" sets local state.                            |
| Community / Safe Walk | `CommunitySafetyModal.tsx` | `requestStatus` is `useState<'idle'\|'pending'\|'accepted'>`; no backend, no other users.                                                                                     |
| Check-In              | `CheckInModal.tsx`         | The countdown is real and _does_ call `onEmergency()` at zero — but that lands on the mock SOS screen (KI-3), and the timer dies with the screen since it is in-process only. |

Fake Call (`FakeCallScreen.tsx`) and the AI assistant are genuinely wired to the
API and are **not** in this list.

---

## 🟡 KI-6 — `packages/types` is duplicated in the mobile app

`apps/mobile/types.ts` is a byte-for-byte copy of `packages/types/src/index.ts`
plus `RootStackParamList` / `SettingsStackParamList`. Both are imported across the
app — `apiService.ts` imports from `@lumo/types`, `EmergencyModal.tsx` from
`../types`. They will drift silently.

**To fix:** re-export from the package and keep only the navigation param lists
locally:

```ts
export * from "@lumo/types";
export type RootStackParamList = {/* … */};
```

---

## 🟡 KI-9 — Insecure secret fallbacks

`JWT_SECRET` falls back to `'super-secret-default-key'` in **two** places
(`auth.module.ts`, `jwt.strategy.ts`). A deploy that forgets the env var ships a
publicly known signing key and every token is forgeable.

`.env.example` also commits a real-looking placeholder,
`"lumo-super-secret-jwt-key-change-in-production"`.

**To fix:** fail fast at boot via `@nestjs/config` with a validated schema; no
fallback.

---

## 🟡 KI-10 — `login`/`signup` bypass the shared client

`apiService.login` and `.signup` use raw `fetch` and duplicate logic that already
exists in `ApiClient.login` / `.signup`. The duplicate also throws a bare
`new Error('HTTP error')`, discarding the server's message (so "User with this
email already exists" never reaches the user), and leaves a
`console.log('resp', response)` in the hot path.

**To fix:** delete both and call `apiClient.login` / `.signup`.

---

## 🟡 KI-11 — No CI, no API container

No `.github/` directory. `docker/` is an empty directory and there is no
`Dockerfile` for the API, despite a `.dockerignore` at the root.
`docs/archive/PROJECT_AUDIT.md` lists "DevOps: Docker, Docker Compose, GitHub
Actions" as delivered; only `docker-compose.yml` (Postgres only) exists.

**To fix:** a GitHub Actions workflow running `pnpm lint typecheck test` on PRs,
and a multi-stage `Dockerfile` for `apps/api`.

---

## 🟡 KI-12 — Dated Gemini model string

`ai.service.ts` pins `gemini-1.5-flash` in three calls. Worth moving to a current
model and lifting the string into config rather than repeating it.

---

## ⚪ KI-13 — Dead files and directories

| Path                                                               | Status                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `packages/config`, `packages/validation`, `packages/eslint-config` | Empty directories. `ARCHITECTURE.md` claimed `packages/config` was real. |
| `docker/`                                                          | Empty                                                                    |
| `/android/` (repo root)                                            | Stray Gradle output; the real project is `apps/mobile/android/`          |
| `metadata.json`                                                    | Leftover AI Studio scaffold, unreferenced                                |
| `apps/mobile/data/dangerZones.ts`                                  | Self-described: "This file is obsolete"                                  |
| `apps/mobile/components/settings/SettingsModal.tsx` et al.         | Named `*Modal` but registered as navigator screens — misleading names    |

---

## ⚪ KI-14 — Unreachable AI chat history

`ApiClient.safetyChat(message, history)` and `AiService.safetyChat` both accept a
`history` array, but the service never puts it into the Gemini `contents` — the
prompt is built from `message` alone. Multi-turn context is silently dropped.

---

## ⚪ KI-15 — No accessibility pass

No `accessibilityLabel` / `accessibilityRole` anywhere in `apps/mobile`. For an
app used under stress — and sometimes one-handed, in the dark, or by users with
impairments — this matters more than average. Add labels to the SOS button, the
bottom nav and every icon-only control.

---

## Suggested order of work

1. KI-1 (config) — unblocks every other test on a real device
2. KI-5 (migrations) + KI-9 (secrets) — small, and they gate deployability
3. KI-2 (geo model) — the foundation for KI-3
4. KI-3 (real SOS) — the product's reason to exist
5. KI-4 (session persistence)
6. KI-7, KI-10, KI-6 — correctness and cleanup
7. KI-11 (CI) — then it stays fixed
