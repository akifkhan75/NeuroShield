# ADR-0008: Three state machines, not one

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Architecture

## Context

The product strategy sketched one machine spanning `CREATED → ACTIVE →
CHECK_IN_REQUIRED → GRACE_PERIOD → ESCALATING → ALERTED → RESOLVING → CLOSED`, with
its own caveat that production should distinguish a journey from an emergency.

It must, because the two differ in lifetime, authority and failure semantics. An
overdue journey is not an emergency — conflating them means every late bus escalates
like an assault. An SOS can exist with no journey at all. And a notification's fate is
independent of both: a delivered SMS to one contact and a failed push to another are
simultaneous truths about one incident.

## Decision

Three machines in `packages/safety-domain`: **SafetySession** (the plan),
**EmergencyIncident** (the response), **NotificationAttempt** (the delivery). One
session raises zero or more incidents; one incident has many attempts.

Two states the original lacked are added: `SUSPENDED` (session alive locally,
remote delivery **not** guaranteed — the offline case) and `ALL_CHANNELS_FAILED` (the
state that must never render as success).

## Alternatives

| Option                    | Why not                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| One machine as sketched   | Cannot express "journey overdue but not an emergency", nor per-channel delivery truth |
| Two (session + incident)  | Leaves delivery state as ad-hoc fields; the Delivery Ledger needs a real machine      |
| Event sourcing throughout | More power than needed; the machines are already append-only where it matters         |

## Consequences

**Good** — an overdue journey can escalate without being framed as an attack ·
per-channel truth becomes representable, enabling the Delivery Ledger · each machine
is independently testable.

**Cost** — three machines plus a defined handoff is more code than one · the
session→incident transition is a seam that needs explicit tests.

## Revisit when

A fourth lifecycle appears (a monitoring-centre case, or a multi-party incident).
