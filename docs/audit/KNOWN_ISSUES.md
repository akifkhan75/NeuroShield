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

> `DangerZone` is being renamed to `HazardReport`, and `severity` removed, because the
> name encodes a neighbourhood-labelling bias — [ADR-0010](../adr/0010-hazard-reports-replace-danger-zones.md).

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

## New findings — 2026-10-27

Found while writing the specification suite. Full detail and severity rationale in
[`TECHNICAL_AUDIT.md`](TECHNICAL_AUDIT.md).

### 🔴 KI-16 — Unbounded alert and request loop

**`apps/mobile/App.tsx:140-151`.** The effect depends on `userSettings`, and its body
calls `handleSaveSettings`, which calls `setUserSettings(...)` — a new object identity,
so the effect re-runs. `voiceError` never clears (`useVoiceActivation` sets it on error
and only resets inside `startListening`, which is now disabled). Result: an **infinite
`Alert.alert` queue and infinite `PUT /settings`**, triggered by any voice-recognition
error — i.e. in the hands-free safety path.

**Fix:** clear the error after handling it, or gate on a ref. Enable
`react-hooks/exhaustive-deps` as an error so this class is lint-visible (KI-19).

### 🟠 KI-17 — `pnpm typecheck` is a silent no-op

`turbo run typecheck --dry=json` resolves **all 8 tasks to `<NONEXISTENT>`** — no
package defines the script. It exits 0 having checked nothing, while the repo's own
docs instructed using it as a quality gate.

**Fix:** add `"typecheck": "tsc --noEmit"` to every package; make it a CI gate.

### 🟠 KI-18 — `pnpm lint` fails, so it cannot gate CI

27 pre-existing errors: unused imports plus 20 × `jest is not defined` in
`jest-setup.js` (missing ESLint jest env). Must be green before CI can enforce it.

### 🟡 KI-19 — `exhaustive-deps` not enforced

Which is why KI-16 was invisible. Enable as an error on the mobile app.

### 🟠 KI-20 — Sensor re-subscription churn

`handleActivateEmergency` is keyed on `userSettings` and passed to all three hooks, so
**every settings save** tears down the accelerometer listeners and destroys/restarts
speech recognition — a continuous-listening feature restarted by unrelated state.

### 🟡 KI-21 — Two independent accelerometer subscriptions

`useShakeDetector` and `useAccidentDetector` each sample at 100 Hz and compute the same
magnitude. Battery doubled for no benefit; merge into one subscription, two thresholds.

### 🟠 KI-22 — No API hardening

No `helmet`, no `compression`, no `@nestjs/throttler`. `/auth/login` is openly
brute-forceable; `/ai/*` is an uncapped cost vector.

### 🟠 KI-23 — No global exception filter

Validation returns `message` as an **array**, plain exceptions as a **string**, so
arrays reach the UI stringified. Stack traces may leak.

### 🟡 KI-24 — No pagination, no indexes

`GET /danger-zones` is an unbounded `findMany` over every row ever created, and the
schema has **no explicit indexes at all** — not even on `reportedAt`, its sole sort key.

### 🟡 KI-25 — No observability

No request logging, no correlation ID, no real health endpoint (`GET /` returns a hello
string), no dashboards. A delivery regression would be invisible.

### 🟡 KI-26 — PII stored in plaintext

Email, full name, blood type, allergies and contact phone numbers. No field-level
encryption.

---

## Revised order of work

Phase 0 of [`../product/ROADMAP.md`](../product/ROADMAP.md):

1. **KI-16** — an active defect in the safety path
2. **KI-17, KI-18, KI-19** — make the quality gates real before relying on them
3. **KI-9, KI-5** — secrets and migrations; small, and they gate deployability
4. **KI-1** — config, so the app runs anywhere
5. **KI-22, KI-23** — API hardening
6. **KI-7, KI-10, KI-6** — correctness and cleanup
7. **KI-11** — CI, so it all stays fixed

Then Phase 1: **KI-2** (geo model) → **KI-3** (real SOS) — the product's reason to exist.
