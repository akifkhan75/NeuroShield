# Offline Architecture

> Implements RES-16, PLAT-7. The `SUSPENDED` state exists because of this document.

## The honest premise

**An offline phone cannot deliver a remote alert.** Every design choice here follows
from refusing to pretend otherwise.

Per [`../engineering/PLATFORM_CAPABILITY_MATRIX.md`](../engineering/PLATFORM_CAPABILITY_MATRIX.md),
Lumo also **cannot silently send an SMS** on either platform.

## Local responsibilities

Preserve the active session · retain its deadline · record last known location with
timestamp and accuracy · queue permitted events with true `occurredAt` · **tell the
user remote notification is not currently guaranteed** · attempt sync on reconnect.

The local engine **never claims remote delivery**.

## What still works offline

| Capability                    | Works      | Why                                              |
| ----------------------------- | ---------- | ------------------------------------------------ |
| Siren + strobe                | ✅         | No network, no account (RES-19)                  |
| Local countdown and reminders | ✅         | On-device timers                                 |
| Pre-filled SMS to contacts    | ✅ one tap | Composer opens pre-filled; the user presses send |
| Fake call                     | ✅         | Local fallback script                            |
| Emergency dial                | ✅         | Carrier network, not data                        |
| Remote alerts                 | ❌         | Stated plainly in the UI                         |
| Live location sharing         | ❌         | Queued                                           |

## Reconciliation

1. Replay in **original order**, each with its true `occurredAt` — never sync time
2. Dedupe by idempotency key; **server authoritative**
3. If the server already advanced the incident, adopt server state
4. **A local escalation whose deadline has long passed still dispatches**, marked
   delayed. A late alert beats no alert; the recipient is told how old it is
5. Illegal-on-arrival transitions log `RECONCILIATION_CONFLICT` into the timeline —
   never silently dropped

Client and server share `packages/safety-domain`, so they cannot disagree about which
transitions are legal (ADR-0009).

## Required copy

> "You're offline. Lumo will alert your contacts as soon as there's a signal.
> To get help now, call 15." _(number from the region profile)_

## Tests

Offline at activation · offline at deadline · reconnect ordering and dedupe · clock
skew · long-delayed dispatch marked delayed · airplane mode · SIM removed · backend
down but network up.
