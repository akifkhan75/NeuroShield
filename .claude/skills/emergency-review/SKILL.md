---
name: emergency-review
description: Review a change for safety regressions in Lumo's emergency path. Use whenever a diff touches SOS, triggers, notifications, escalation, location, evidence, sessions, incidents, or any user-facing copy about safety. Also use before merging anything in apps/api/src/{emergency-incidents,escalation,notifications,safety-sessions} or apps/mobile hooks and emergency screens. Catches fake success states, missing failure paths, SOS blocked on auth or network, unbounded alert loops, uncapped fan-out, and copy that exceeds platform capability.
---

# Emergency Path Review

Lumo is a safety product. A bug here can mean someone believes help is coming when it
is not. This review is a gate, not a suggestion.

Read `docs/engineering/THREAT_MODEL.md` and `docs/specs/DELIVERY_LEDGER.md` first.

## Blocking checks

Any **yes** blocks the merge.

### 1. Fake success (PLAT-9) — the highest-value check
- Does any success state render without a corresponding verified record?
- Does copy say "notified", "sent", "alerted" or "contacted" where only an API
  accepted a request? A `202` is not a delivery.
- Is there an aggregate tick standing in for per-contact, per-channel truth?
- Is a failure ever collapsed into a summary without naming who was missed?

Correct: "Sent to 2 of 3 · couldn't reach Dad". Wrong: "Contacts notified".

### 2. Failure paths
Every emergency action needs defined behaviour for: offline · permission denied ·
permission revoked after grant · no GPS fix · stale GPS fix · expired auth token ·
provider outage · all channels failed · process killed mid-flow · battery dead.

Missing any → blocked. "It throws" is not a defined behaviour.

### 3. The SOS path must never block on
- a valid session token (use the emergency token — PLAT-4)
- a network round-trip before local feedback
- a queue, an AI job, or an evidence upload
- a location fix (`LOCATING` is time-boxed and never blocking)

### 4. Loops and fan-out
- Can an effect re-trigger its own dependency? (The `App.tsx:140-151` alert-storm bug
  was exactly this: an effect depending on state its own body replaced.)
- Is every fan-out bounded by the PLAT-5 spend cap?
- Is every retry idempotent, keyed per `(incident, recipient, channel, attempt)`?

### 5. Copy versus platform reality
Check every string against `docs/engineering/PLATFORM_CAPABILITY_MATRIX.md`.
Never claim: continuous background listening (not possible on iOS) · silent automatic
SMS (not possible on either platform) · auto-dialling emergency services · official
dispatch unless `canClaimDispatch` is true · "works offline" without qualification.

### 6. Threat model
Does the change create any state where someone is tracked without a visible,
revocable indicator on their own device? **Instant rejection** (T2).
Does it reveal the user's safety state to someone holding the phone? (T1)

### 7. State machine legality
Transitions only via `packages/safety-domain`. No ad-hoc status writes. No clock reads
inside the machine — time is injected.

## Output

List findings as `BLOCKING` or `ADVISORY`, each with file:line, the failing rule, and
the concrete fix. If nothing blocks, say so plainly and name the checks that applied.
