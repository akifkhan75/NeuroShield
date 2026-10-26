# CLAUDE.md — Agent Context for Lumo

> **Read this first.** It is the fastest path to a correct change in this repo.
> Deeper detail lives in [`docs/`](docs/README.md). If this file and a `docs/` file
> disagree, the code wins — then fix both.

---

## 1. What this app is

A **personal safety app** for Android/iOS: a map of community-reported danger
zones, a one-tap SOS, hands-free SOS triggers (shake / voice / crash detection),
a fake-call escape tool, journey sharing, a check-in timer, and an AI safety
assistant.

It is positioned as a **more capable alternative to Google's Personal Safety
app** — see [`docs/COMPETITIVE_ANALYSIS.md`](docs/COMPETITIVE_ANALYSIS.md) for the
feature-by-feature gap and [`docs/ROADMAP.md`](docs/ROADMAP.md) for the plan.

**Naming:** the product is **Lumo**, decided 2026-10-26 and applied throughout —
packages are `@lumo/*`, the bundle id is `com.lumo.app`, and the wake word is
**"Hey Lumo"**. The repo previously carried three names (NeuroShield / InSafe /
"hey guardian"); if you find a straggler, fix it. Rationale and the executed
checklist are in [`docs/BRANDING.md`](docs/BRANDING.md) and
[ADR-0007](docs/adr/0007-name-the-product-lumo.md).

> The **repo directory** is still `NeuroShield/` and the GitHub repo may be too —
> renaming those is a manual step, see BRANDING.md.

---

## 2. Repo shape

Turborepo + pnpm workspaces. Node >= 18, pnpm 9.

```
apps/api        NestJS 12 REST API, Prisma 5, PostgreSQL        (the backend)
apps/mobile     Expo 58 / React Native 0.88, styled-components  (the app)
packages/types        shared TS domain types  (@lumo/types)
packages/api-client   typed fetch client      (@lumo/api-client)
packages/tsconfig     shared tsconfig base    (@lumo/tsconfig)
packages/config       EMPTY — placeholder only
packages/validation   EMPTY — placeholder only
packages/eslint-config EMPTY — placeholder only
android/        stray top-level Gradle output, not the app's android project
docker/         EMPTY
metadata.json   leftover from the original AI Studio scaffold; unused
```

The real Android project is **`apps/mobile/android/`**, not `/android/`.

---

## 3. Commands you will actually need

```bash
pnpm install                       # once, from the repo root

docker compose up -d postgres      # Postgres 15 on host port 5434
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma db push      # NO migrations exist yet — see §7
pnpm --filter api exec prisma db seed      # creates josim@example.com / password

pnpm --filter api start:dev        # API — reads API_PORT, defaults to 3001 (!)
pnpm --filter mobile start         # Metro / Expo dev server
pnpm --filter mobile android       # expo run:android (needs a dev build)

pnpm build                         # turbo: builds packages then apps
pnpm test                          # turbo: vitest (api, api-client) + jest (mobile)
pnpm --filter api test:e2e         # supertest e2e — needs a live database
pnpm lint
pnpm typecheck
```

**Build order matters.** `packages/types` → `packages/api-client` → `apps/*`.
Turbo handles it via `dependsOn: ["^build"]`. If the mobile app cannot resolve
`@lumo/api-client`, run `pnpm build` — the package ships from `dist/`, not
source.

---

## 4. The five facts that trip everyone up

1. **Port mismatch.** `apps/api/src/main.ts` defaults to **3001**. `.env.example`
   sets `API_PORT=3005`. The mobile app hardcodes **3005**. Always set
   `API_PORT=3005` in `apps/api/.env`, or the app cannot reach the API.

2. **The API base URL is a hardcoded LAN IP.** `apps/mobile/services/apiService.ts`:

   ```ts
   const LAN_IP = "192.168.100.81";
   export const API_BASE_URL = `http://${LAN_IP}:3005`;
   ```

   `EXPO_PUBLIC_API_URL` exists in `.env.example` but **nothing reads it**. On a
   new network you must edit that constant. Fixing this properly is
   [KI-1](docs/KNOWN_ISSUES.md).

3. **Danger-zone "coordinates" are CSS percentages, not geography.** The schema
   stores `top: String` and `left: String` (e.g. `"45%"`), positioned over a
   static JPEG (`apps/mobile/assets/images/map_bg.jpg`). There is no map SDK and
   no lat/lng anywhere. On create, the server _invents_ a position:
   `` `${48 + Math.random() * 4}%` ``. Any real geospatial work starts with
   migrating this model — [KI-2](docs/KNOWN_ISSUES.md).

4. **The SOS screen does not contact anyone.** `EmergencyModal.tsx` is a
   convincing UI: a ring of hardcoded contacts (Police, EMS, Mom…), "Notifying
   Nearby Volunteers…", a defense-mode overlay. No call, no SMS, no push, no
   location upload. `shareLocationOnSos` / `sendSmsOnSos` are persisted to
   Postgres and **never read**. This is the single biggest gap between the demo
   and a safety product — [KI-3](docs/KNOWN_ISSUES.md).

5. **Auth does not survive a restart.** The JWT lives in a module-level variable
   in `apiService.ts` and `isAuthenticated` is `useState` in `App.tsx`. No
   AsyncStorage, no SecureStore, no refresh token, and logout never clears the
   token — [KI-4](docs/KNOWN_ISSUES.md).

Read [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) before planning any feature.
It separates _mock_ from _real_ and is kept prioritized.

---

## 5. Conventions

**Backend (`apps/api`)**

- One directory per domain: `auth/`, `settings/`, `danger-zones/`, `ai/`,
  `prisma/`. Each has `*.module.ts`, `*.controller.ts`, `*.service.ts`, and a
  co-located `*.spec.ts`.
- Controllers own the route string in full: `@Controller('api/v1/settings')`.
  There is **no** global prefix or versioning helper — add the prefix yourself.
- Protect routes with `@UseGuards(JwtAuthGuard)`. `req.user` is `{ id, email }`,
  shaped by `JwtStrategy.validate`.
- Validate input with a DTO in `dto/` + `class-validator`. The global
  `ValidationPipe` uses `{ transform: true, whitelist: true }`, so **unlisted
  properties are silently stripped** — if a field vanishes, it is missing a
  decorator. `SettingsController.updateSettings` still takes `@Body() body: any`
  and is the exception to fix, not to copy.
- Services return **API-shaped objects, not Prisma rows** (see
  `DangerZonesService.findAll` mapping `top`/`left` into `location`).

**Mobile (`apps/mobile`)**

- Every component is a single `.tsx` with its `styled-components/native` styles
  declared at the top of the same file. The dashboard is the exception: its
  styles live in `App.styled.ts`.
- Icons come from `constants.tsx` (`IconSOS`, `IconAlert`, …) wrapping
  `@expo/vector-icons`. Add new icons there, never import the icon set directly
  in a screen.
- **There is no state manager.** No Redux, no Zustand, no Context. Settings and
  callbacks are passed through React Navigation **route params**
  (`navigation.navigate('Settings', { currentSettings, onSave })`). Non-
  serializable params are a deliberate trade-off here; preserve the pattern or
  replace it wholesale, don't mix.
- Sensor logic belongs in a hook in `hooks/`, shaped like the existing three:
  `(callback, enabled) => void | status`, always cleaning up its subscription.
- Screens talk to the server through `services/apiService.ts` only — never
  `fetch` from a component.

**Shared types**

- `packages/types/src/index.ts` is the source of truth.
- `apps/mobile/types.ts` **duplicates all of it** and adds the navigation param
  lists. The two copies have already drifted once. Edit `packages/types` first,
  then mirror — or collapse them ([KI-6](docs/KNOWN_ISSUES.md)).

**Commits** — Conventional Commits, as in the existing history:
`feat(mobile): …`, `fix: …`, `chore: …`, `test: …`, `docs: …`.

---

## 6. Request path, end to end

```
Screen → services/apiService.ts → @lumo/api-client (ApiClient)
       → HTTP  Bearer <jwt>  → NestJS controller → JwtAuthGuard
       → service → PrismaService → PostgreSQL
```

With one wrinkle: **`login` and `signup` bypass `ApiClient`** and use raw `fetch`
inside `apiService.ts`, duplicating logic that already exists in
`ApiClient.login`/`.signup`. `ApiClient` is used for everything else.

---

## 7. Database

Prisma 5.22, PostgreSQL 15 (Docker, **host port 5434**). Models: `User`,
`TrustedContact`, `DangerZone` + enums `DangerZoneSeverity`, `DangerZoneType`.

**`apps/api/prisma/migrations/` does not exist.** Despite what
`docs/archive/PRODUCTION_AUDIT.md` claims, no migration has ever been generated;
the schema is applied with `db push`. Before any production deploy, baseline the
migration history — [KI-5](docs/KNOWN_ISSUES.md).

**Enum gotcha:** `DangerZoneType` members are `Poor_Lighting` and
`Suspicious_Activity` in Prisma but `@map` to `"Poor Lighting"` and
`"Suspicious Activity"` in Postgres, while the client type is the space-separated
string. `DangerZonesService` hand-maps both directions in `mapInputType` /
`mapOutputType`. Touching this enum means touching all three places.

Details: [`docs/DATABASE.md`](docs/DATABASE.md).

---

## 8. AI features

`apps/api/src/ai/ai.service.ts` calls **Google Gemini** via `@google/genai`,
model string `gemini-1.5-flash` (dated — worth upgrading). Reads `process.env.API_KEY`.

Every method returns a **hardcoded fallback** when the key is missing or the call
fails, so the app is fully usable with no key set. Preserve that property: an
emergency feature must never depend on a network AI call succeeding.

---

## 9. Testing

| Target                | Runner             | Command                                      |
| --------------------- | ------------------ | -------------------------------------------- |
| `apps/api` unit       | Vitest             | `pnpm --filter api test`                     |
| `apps/api` e2e        | Vitest + supertest | `pnpm --filter api test:e2e` (needs live DB) |
| `packages/api-client` | Vitest             | `pnpm --filter @lumo/api-client test`        |
| `apps/mobile`         | Jest + `jest-expo` | `pnpm --filter mobile test`                  |

Native modules are mocked globally in `apps/mobile/jest-setup.js`
(`expo-sensors`, `@react-native-voice/voice`, `@expo/vector-icons`). A new native
dependency needs a mock there or the whole suite fails to boot.

More: [`docs/TESTING.md`](docs/TESTING.md).

---

## 10. Native build notes

- Expo **prebuild/dev-client** workflow. `@react-native-voice/voice` does not work
  in Expo Go — voice activation needs a custom dev build (`expo run:android`).
  `useVoiceActivation` detects this via `NativeModules.Voice` and degrades quietly.
- `@react-native-voice/voice@3.2.4` is **patched** for modern Gradle:
  `patches/@react-native-voice__voice@3.2.4.patch`, wired through `pnpm.patchedDependencies`.
  Do not bump that package without re-checking the patch.
- `apps/mobile/metro.config.js` adds the workspace root to `watchFolders` and both
  `node_modules` paths to `nodeModulesPaths` — required for pnpm hoisting. Don't
  simplify it.

---

## 11. Before you call a change done

- [ ] `pnpm typecheck` and `pnpm lint` pass
- [ ] Tests pass; new behavior has a test next to the code it tests
- [ ] A new endpoint has a DTO, a guard, and a line in [`docs/API.md`](docs/API.md)
- [ ] A schema change updates `schema.prisma`, the enum mappers (if touched),
      `packages/types`, `apps/mobile/types.ts`, and [`docs/DATABASE.md`](docs/DATABASE.md)
- [ ] Anything you discovered that contradicts these docs is written back into them
- [ ] A gap you created or confirmed is added to [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md)

## 12. Do not

- Commit secrets. `JWT_SECRET` and `API_KEY` fall back to insecure defaults — that
  is a bug, not a convenience.
- Trust `docs/archive/*`. Those are historical snapshots with claims that were
  never true; [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) supersedes them.
- Describe a mock as a shipped feature. Half of the UI is a prototype, and a user
  trusting a fake SOS is the worst outcome this project can produce.
