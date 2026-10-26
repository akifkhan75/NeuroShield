---
name: safety-state-machine
description: Work on Lumo's three safety state machines (SafetySession, EmergencyIncident, NotificationAttempt) in packages/safety-domain. Use when changing session, journey, check-in, incident or escalation behaviour, adding a state or transition, or handling offline reconciliation and idempotency.
---

# Safety State Machines

Spec: `docs/specs/SAFETY_STATE_MACHINES.md`. ADR-0008, ADR-0009.

## Three machines, never one

`SafetySession` (the plan) · `EmergencyIncident` (the response) ·
`NotificationAttempt` (the delivery).

An overdue journey is **not** an emergency. An SOS can exist with no journey. A
delivered SMS to one contact and a failed push to another are simultaneous truths
about one incident. Conflating any of these is a design error.

## `packages/safety-domain` is sacred

- **Pure.** No I/O, no network, no database, no clock — time is injected.
- **Zero runtime dependencies.**
- **100% branch coverage**, enforced in CI.
- **Imported unchanged by `apps/api` and `apps/mobile`.**

The reason: the offline local engine and the backend must agree on which transitions
are legal. If they can diverge, an offline phone and the server will disagree about
whether an escalation fired. One pure implementation makes that impossible (PLAT-7).

Effects are **declared** by the machine and **executed by the caller**. The machine
never sends a notification.

## Invariants you must not break

1. `GRACE` defaults to ≥5 minutes and is user-configurable. Zero grace turns traffic
   into an emergency.
2. `SUSPENDED` must surface in the UI — a user believing contacts are watching while
   offline is the worst failure mode.
3. `LOCATING` never blocks dispatch. No fix → dispatch with "location unavailable".
4. A stale fix is never presented as current.
5. `NOTIFIED` ≠ acknowledged.
6. `ALL_CHANNELS_FAILED` never renders as success.
7. Dispatch never depends on a valid session token (PLAT-4).
8. `CANCELLED` only during the countdown; after dispatch the user *resolves*.
9. Duress cancel: UI shows cancelled, incident proceeds, device reveals nothing.
10. Every transition records `at`, `by`, `reason`.

## Idempotency

`sha256(userId + triggerType + floor(triggerAtMs / 60000) + sessionId?)`, minted
**on device** before the first attempt so retries share it. A repeat key returns the
existing incident with `200`. The 60s bucket deliberately merges two activations —
a merged incident beats an alert storm.

## Adding a transition
Add to `transitions.ts` with `from`, `event`, `to`, `actor[]`, optional `guard`,
declared `effects`. Then: exhaustive (state × event) tests, an offline-reconciliation
test, and an idempotency test. There is **no default-allow**.
