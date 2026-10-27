# Glossary

Domain and codebase vocabulary. When a term here is also a code identifier, the
identifier is given — use the same word in code, docs and UI copy.

---

## Domain

**Hazard Report** — `HazardReport`
An observation about a **condition** at a place: a `type`, a `source`, a
free-text `description`, real `latitude`/`longitude` with an optional
`accuracyMetres`, a `reportedAt` and an `expiresAt`. Community data: it outlives
its reporter (`onDelete: SetNull`) and the feed is global. Replaced `DangerZone`
([ADR-0010](adr/0010-hazard-reports-replace-danger-zones.md)).

**Severity** — **does not exist, by decision.**
A danger grade attached to a place is the redlining primitive. A condition has
confirmations and an age, not a score. Adding one back is rejected.

**Hazard Type** — `HazardType`
`POOR_LIGHTING` | `OBSTRUCTED_PATH` | `BROKEN_INFRASTRUCTURE` | `UNSAFE_CROSSING`
| `THEFT_REPORTED` | `HARASSMENT_REPORTED` | `AGGRESSION_REPORTED` | `OTHER`. One
spelling in Prisma, Postgres and the API; the human label lives in
`HAZARD_TYPE_LABELS` in `@lumo/types`.

**Report Source** — `HazardReportSource`
`COMMUNITY` | `VERIFIED_PARTNER` | `OFFICIAL_FEED`. A community report and a
verified advisory must never render identically, so the distinction is data.

**Confirmation** — `HazardConfirmation`
One row per person per report, uniquely constrained, so a count cannot be
inflated by one account. `confirmationCount` is derived from these rows, never
stored.

**Confirmation floor** — `HAZARD_CONFIRMATION_FLOOR`
Three. Below it a community report is shown but must not influence routing or any
automated decision; the server says so in `influencesRouting` and clients must not
recompute it.

**Trusted Contact** — `TrustedContact`
Someone the user nominates to be alerted in an emergency: `name` + `phone`.
Stored and editable today; **not yet used by any alert** ([KI-3](audit/KNOWN_ISSUES.md)).

**SOS / Emergency**
The user's explicit or automatic call for help. In the code, "Emergency" is the
screen (`EmergencyModal.tsx`, route `Emergency`) and "SOS" is the trigger (the
button, the shake, the wake phrase). Keep that distinction.

**Trigger**
Any action that activates SOS. Four exist: the SOS button, a shake, a voice wake
phrase, and a detected crash. All four call `handleActivateEmergency`.

**Fake Call**
An escape tool: a simulated incoming call with an AI-generated script, giving the
user a plausible reason to leave. Real and working.

**Follow Me** — `Journey` (planned)
Sharing a live journey with a contact via a link, for the duration of a trip —
not a persistent background share. Currently a mock link
([KI-8](audit/KNOWN_ISSUES.md)).

**Check-In**
A countdown the user sets; if they do not cancel it, SOS fires. Works in-process
only, so it dies with the screen ([KI-8](audit/KNOWN_ISSUES.md)).

**Safe Walk**
Requesting a companion or responder to accompany a journey. Mock.

**Voice Guard**
The UI name for continuous wake-phrase listening. `isListening` from
`useVoiceActivation` drives the header badge.

**Wake Phrase**
`BRAND_VARIANTS` + `INTENT_WORDS` in `useVoiceActivation.ts`. A wake utterance is
any recognizer alternative containing a brand variant (`lumo`, `loomo`, `luma`, …)
**and** an intent word (`emergency`, `help`, `sos`). Variant matching exists because
`Lumo` is coined and transcribes inconsistently — see [MOBILE.md](engineering/MOBILE.md).

**Defense Mode**
An overlay on the emergency screen showing AI self-defense tips and claiming a
loud alarm. The tips are real; the alarm is not.

**Nearby Volunteers / Responder**
The planned network of vetted people who can respond before emergency services.
Currently a text label; a Phase 4 bet in [ROADMAP.md](product/ROADMAP.md).

**Security Settings** — `SecuritySettings`
The six booleans stored flat on `User`: `locationSharingEnabled`,
`shareLocationOnSos`, `sendSmsOnSos`, `shakeToSosEnabled`,
`voiceActivationEnabled`, `accidentDetectionEnabled`. The last three genuinely
control the sensor hooks; the first three are stored and unread.

**Stealth Mode** (planned)
Operating without visible signs — disguised icon, discreet trigger, no alert UI —
for users whose threat has access to the phone. See T1 in
[SECURITY_AND_PRIVACY.md](engineering/SECURITY.md).

---

## Codebase

**`apiService`** — `apps/mobile/services/apiService.ts`
The mobile app's only network door: a façade over `ApiClient` plus the in-memory
token. Components never call `fetch`.

**`ApiClient`** — `packages/api-client`
A class with one method per endpoint, shared by the app and the tests. The
contract between the two halves of the system.

**Route params as state transport**
This app's deliberate pattern: `DashboardScreen` owns all state and passes it —
plus mutator callbacks — through React Navigation params. No Redux, no Context.
See [ADR-0004](adr/0004-route-params-as-state-transport.md).

**`JwtAuthGuard`**
The passport-jwt guard on every protected route. Populates
`req.user = { id, email }` via `JwtStrategy.validate`.

**Enum mapping** — _removed._
`DangerZonesService` used to hand-translate every type between a Prisma member, a
`@map`'d Postgres value and an API display string, with no error branch. There is
now one spelling everywhere and `@IsEnum` rejects the rest.

**Fallback (AI)**
The hardcoded response every `AiService` method returns when there is no API key,
the response will not parse, or the call throws. A product guarantee: an
emergency feature must never depend on an LLM round-trip. Preserve it.

**Whitelist stripping**
The global `ValidationPipe({ whitelist: true })` silently deletes body properties
with no validation decorator. The usual cause of "my field is `undefined`".

**Dev client**
A custom native build (`expo run:android`) required because
`@react-native-voice/voice` has no Expo Go support. `useVoiceActivation` detects
its absence and degrades quietly.

**Patched dependency**
`@react-native-voice/voice@3.2.4` + `patches/@react-native-voice__voice@3.2.4.patch`,
applied by `pnpm.patchedDependencies`. Bumping the package invalidates the patch
and breaks the Android build.

**Mock vs Real**
The repo's most load-bearing distinction. "Real" means wired end to end; "mock"
means the UI exists and does nothing. [FEATURES.md](audit/FEATURES.md) is the source of
truth, and describing a mock as shipped is the one unacceptable error here.

**KI-n**
A numbered entry in [KNOWN_ISSUES.md](audit/KNOWN_ISSUES.md). Cite the number in
commits, PRs and docs.

---

## Naming: resolved, with leftovers to know about

The product is **Lumo** (2026-10-26). Earlier names — `NeuroShield`, `InSafe`,
`guardian` — are gone from the live code and docs. Deliberate exceptions:
`docs/archive/*` and `docs/adr/0001` keep the old names because they are historical
records. The repo directory, GitHub repo and git remote are all `Lumo` as of
2026-10-27.

Unrelated naming traps that remain:

| In the code                 | Means                                                           |
| --------------------------- | --------------------------------------------------------------- |
| `*Modal.tsx`                | A navigator **screen** presented modally, not a `<Modal>`       |
| `/android` at the repo root | Stray Gradle output. The real project is `apps/mobile/android/` |
| `coordinates` on a report   | Real latitude/longitude — but there is still no map SDK         |
| `lumo.example`              | A placeholder link, not a real domain (`.example` is reserved)  |

All of these are tracked in [KNOWN_ISSUES.md](audit/KNOWN_ISSUES.md).
