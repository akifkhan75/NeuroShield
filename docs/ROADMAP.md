# Roadmap

Ordered by dependency, not by ambition. Each phase has an exit criterion you can
check.

The guiding constraint: **nothing ships that claims to summon help until it
actually summons help.** See [FEATURES.md](FEATURES.md) for what is real today and
[KNOWN_ISSUES.md](KNOWN_ISSUES.md) for the verified gaps referenced below.

---

## Phase 0 — Make the repo deployable

_Small, unglamorous, blocks everything else._

- [ ] **KI-1** Read the API base URL from `EXPO_PUBLIC_API_URL`; align the
      `API_PORT` default to 3005; require HTTPS outside dev
- [ ] **KI-5** Baseline Prisma migrations (`migrate dev --name init`); stop using `db push`
- [ ] **KI-9** `@nestjs/config` with a validated schema; remove both `JWT_SECRET` fallbacks; fail fast
- [ ] **KI-11** GitHub Actions running lint, typecheck, test, e2e (workflow drafted in [TESTING.md](TESTING.md))
- [ ] **KI-11** A multi-stage `Dockerfile` for `apps/api`
- [ ] **KI-6** Collapse `apps/mobile/types.ts` to re-export `@lumo/types`
- [ ] **KI-10** Delete the duplicate `fetch` in `apiService.login`/`signup`
- [ ] **KI-7** `UpdateSettingsDto`; transactional contact upserts
- [ ] **KI-13** Delete the empty packages, `docker/`, stray `/android/`, `metadata.json`, `data/dangerZones.ts`
- [ ] Decide the name ([BRANDING.md](BRANDING.md)) — cheapest now, before store listings and a public API exist

**Exit:** a clean clone, one env file, `pnpm install && pnpm build && pnpm test`
green in CI, and the app runs against a deployed API over HTTPS.

---

## Phase 1 — Real geography

_The unlock. Everything differentiating depends on it._

- [ ] **KI-2** Schema: `latitude`, `longitude`, `geohash`, `accuracyM`, `expiresAt`,
      `confirmCount` on `DangerZone`; drop `top`/`left` (see
      [DATABASE.md](DATABASE.md) for the migration sketch)
- [ ] `expo-location` + a permission rationale screen before the OS prompt
- [ ] `react-native-maps` replacing `map_bg.jpg`; real pins, real user position
- [ ] `GET /danger-zones/nearby?lat&lng&radius` — bounding box or geohash prefix, paginated
- [ ] Reports carry the _user's_ coordinates; delete the `Math.random()` position
- [ ] Reverse geocoding for the header, replacing _"San diago, 8453 Street, Italy"_
- [ ] Report hygiene: per-user rate limit, `confirmCount`, decay via `expiresAt`

**Exit:** two devices on the same network see each other's reports pinned in the
right place on a real map, and the feed is filtered by distance.

---

## Phase 2 — SOS that actually works

_The product's reason to exist. **KI-3**._

- [ ] `SosIncident` model: user, coordinates, trigger type, timestamps, per-contact delivery state
- [ ] `POST /api/v1/sos` → persist, then fan out
- [ ] SMS to trusted contacts (Twilio or equivalent) carrying a live-location link
- [ ] Push to contacts who have the app (`expo-notifications` + a `Device` model)
- [ ] Honour `shareLocationOnSos` and `sendSmsOnSos` — they are stored and ignored today
- [ ] Replace the hardcoded contact ring with the user's real `trustedContacts`
- [ ] **Show real delivery state per contact** (sending / delivered / failed) — never a fake "Calling…"
- [ ] A 10-second cancellable countdown before dispatch, to absorb false triggers
- [ ] A loud siren that works with no network
- [ ] Offline queue + SMS-only fallback path
- [ ] One-tap call to the local emergency number (a normal dial, **not** a dispatch integration)
- [ ] Audit log for every activation

**Exit:** triggering SOS on a real phone causes a real SMS with a working link to
arrive on another phone, within 10 seconds, and the screen reports exactly what
succeeded and what failed.

---

## Phase 3 — Journeys and check-ins made real

_KI-8. Depends on Phases 1 and 2._

- [ ] `Journey` + `JourneyPing`; `POST /journeys`, `PATCH /journeys/:id/location`
- [ ] A public, **expiring and revocable** tracking page at `GET /j/:token`
- [ ] Replace the hardcoded `lumo.example` link with a real one
- [ ] Background location while a journey is active, with a persistent notification
- [ ] Route deviation detection → alert the follower (a genuine differentiator)
- [ ] Server-side `CheckIn` so escalation survives a killed or dead phone
- [ ] A visible, revocable list of active shares and who has viewed them (T4 in [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md))
- [ ] ETA sharing and arrival confirmation

**Exit:** a contact opens a link in a browser and watches the user move; killing
the app still escalates a missed check-in; the user can revoke the share instantly.

---

## Phase 4 — Prevention and the network

_The differentiators from [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md)._

- [ ] **Proximity warnings** — geofenced alerts on approaching a cluster of reports
- [ ] **Safe route suggestions** — routing weighted by report density
- [ ] A risk score for an area, by time of day
- [ ] Verified responder network (neighbours, campus security, vetted volunteers)
      — treat verification, liability and responder safety as the hard part, and
      pilot in one geography before scaling
- [ ] Safe Walk: request a companion, accept, track to arrival
- [ ] Community moderation tooling and a reputation signal

**Exit:** the app warns a user _before_ they walk into a reported area, and one
pilot community has completed real Safe Walk requests end to end.

---

## Phase 5 — Trust, polish, scale

- [ ] Session persistence: `expo-secure-store`, refresh tokens, 401 interceptor (**KI-4**)
- [ ] Biometric app lock and **stealth mode** — disguised icon, discreet trigger, panic wipe (T1)
- [ ] Email verification and password reset
- [ ] Accessibility pass: labels, roles, contrast, large text, one-handed reach (**KI-15**)
- [ ] Dark mode (lift the Tailwind hexes in [MOBILE.md](MOBILE.md) into tokens first)
- [ ] i18n; start with the languages of the first launch market
- [ ] iOS parity and a real device test matrix
- [ ] Wearable triggers (Wear OS, watchOS)
- [ ] Crash and analytics reporting — privacy-preserving, no location in events
- [ ] On-device wake word replacing continuous speech recognition (battery, privacy)
- [ ] Merge the two accelerometer subscriptions into one ([MOBILE.md](MOBILE.md))
- [ ] Current Gemini model, lifted into config (**KI-12**)
- [ ] Conversation memory for the assistant (**KI-14**) with incident context
- [ ] External security review and a `SECURITY.md` disclosure policy
- [ ] Store compliance: Data Safety / Privacy Nutrition Label matching reality;
      background-location justification

---

## Explicitly out of scope

From [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) — each needs a platform
privilege or a regulated partnership we do not have:

- Earthquake early warning and crisis alerts at Google's scale
- Satellite SOS
- OS-level power-button triggers (a widget or Quick Settings tile is the ceiling)
- Direct 911/112 dispatch integration
- Marketing crash detection as equivalent to a trained model

---

## Decision log

Architectural decisions go in [`adr/`](adr/README.md) as they are made. Open
questions that will shape the roadmap:

- Which SMS provider, and what is the per-alert cost ceiling?
- Is the business model subscription, or free with a paid responder tier?
- First launch geography? It determines emergency-number handling, language and
  the legal review.
- Does the responder network launch at all, or stay a Phase 4 experiment?
