# Lumo

> A personal safety app: a community hazard map, one-tap and hands-free SOS,
> AI-powered escape tools, journey sharing and check-in timers.
> Android and iOS, with a NestJS + PostgreSQL backend.

> ⚠️ **Pre-release. Parts of the app are a working prototype, not a working
> product.** The SOS screen does not yet contact anyone, and the map has no real
> coordinates. Read [`docs/FEATURES.md`](docs/FEATURES.md) before demoing or
> describing this app to anyone. Do not rely on it in an actual emergency.

---

## Quick start

```bash
pnpm install
pnpm build                                  # shared packages must build first

cp .env.example apps/api/.env               # then set API_PORT=3005  (see below)

docker compose up -d postgres
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma db push
pnpm --filter api exec prisma db seed

pnpm --filter api start:dev                  # API on :3005
pnpm --filter mobile start                   # Metro (new terminal)
pnpm --filter mobile android                 # or: ios
```

Log in with **`josim@example.com` / `password`** (prefilled).

**Two things will stop you otherwise:**

1. `apps/api/src/main.ts` defaults `API_PORT` to **3001**, but the app expects
   **3005**. Set it in `apps/api/.env`.
2. `apps/mobile/services/apiService.ts` hardcodes `LAN_IP = '192.168.100.81'`.
   Edit it for your network — `10.0.2.2` for the Android emulator, `localhost` for
   the iOS simulator, your LAN IP for a device.

Full setup and troubleshooting: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

---

## What it does

|                                                                  | Status                             |
| ---------------------------------------------------------------- | ---------------------------------- |
| Email/password accounts, profile, medical info, trusted contacts | ✅ Real                            |
| Community danger-zone reports (feed + reporting)                 | 🟨 Real data, fake positions       |
| **Shake to SOS** (accelerometer, 2.5 G)                          | ✅ Real                            |
| **Voice activation** ("Hey Lumo, emergency")                     | ✅ Real — needs a dev build        |
| **Crash detection** (6 G)                                        | ✅ Real                            |
| AI fake call — a scripted escape from a situation                | ✅ Real                            |
| AI safety assistant and self-defense tips                        | ✅ Real                            |
| Check-in timer                                                   | 🟨 Works, but dies with the screen |
| **SOS / Emergency response**                                     | ⛔ **Mock — notifies nobody**      |
| Follow Me journey sharing                                        | ⛔ Mock                            |
| Community Safe Walk, nearby volunteers                           | ⛔ Mock                            |
| Map                                                              | ⛔ Static image, no map SDK        |

Full breakdown with file references: [`docs/FEATURES.md`](docs/FEATURES.md).

---

## Stack

```
apps/mobile      Expo 58 · React Native 0.88 · React 19 · styled-components · React Navigation 7
apps/api         NestJS 12 · Prisma 5 · PostgreSQL 15 · argon2 · passport-jwt · Google Gemini
packages/        types · api-client · tsconfig          (shared, built before the apps)
tooling          Turborepo · pnpm 9 · Vitest · Jest (jest-expo) · oxlint + ESLint · Prettier
```

Architecture, module layout and request flow: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Documentation

**Start with [`docs/README.md`](docs/README.md)**, or go straight to:

- [`CLAUDE.md`](CLAUDE.md) — orientation for AI agents and new contributors; the
  commands, conventions and gotchas in one page
- [`docs/FEATURES.md`](docs/FEATURES.md) — **real vs mock**
- [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) — verified gaps, prioritized
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — what to build, in dependency order
- [`docs/API.md`](docs/API.md) · [`docs/DATABASE.md`](docs/DATABASE.md) · [`docs/MOBILE.md`](docs/MOBILE.md) · [`docs/TESTING.md`](docs/TESTING.md)
- [`docs/SECURITY_AND_PRIVACY.md`](docs/SECURITY_AND_PRIVACY.md) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/COMPETITIVE_ANALYSIS.md`](docs/COMPETITIVE_ANALYSIS.md) · [`docs/BRANDING.md`](docs/BRANDING.md)
- [`docs/adr/`](docs/adr/README.md) — why the code is shaped this way

---

## Naming

The product is **Lumo** — _your light in the dark_. Named 2026-10-26, replacing an
earlier split across three names (NeuroShield in the repo, "InSafe" on the SOS
screen, "hey guardian" as the wake word). Rationale, rejected alternatives and the
executed checklist: [`docs/BRANDING.md`](docs/BRANDING.md) and
[ADR-0007](docs/adr/0007-name-the-product-lumo.md).

**Still outstanding:** trademark clearance (classes 9 and 42) and app-store search
in the US/Canada launch markets. The code is renamed; the name is not yet cleared.

---

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md). Conventional Commits, a branch
per change, and docs updated in the same PR.

Four rules specific to this product:

1. **Never ship a UI that implies help is coming when it is not.**
2. **Degrade, don't fail** — every safety path needs a working offline fallback.
3. **Report real state** — "Message sent to Mom and 2 others", not "Notifying your contacts".
4. **Treat location and contacts as dangerous data** — including when the threat
   holds the phone.

---

## License

UNLICENSED / private.
