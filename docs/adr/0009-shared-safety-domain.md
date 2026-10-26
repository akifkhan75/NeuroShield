# ADR-0009: `packages/safety-domain` is pure and shared by client and server

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Architecture

## Context

The app needs a local safety engine so timers and sessions survive loss of
connectivity. The backend needs the same logic to coordinate alerts and own the audit
record. If the two implement escalation independently, an offline phone and the server
will eventually **disagree about whether an escalation fired** — and in a safety
product that disagreement is the bug that gets someone hurt.

## Decision

One implementation, in `packages/safety-domain`, imported unchanged by `apps/api` and
`apps/mobile`:

- **Pure.** No I/O, no network, no database, and **no clock** — time is injected
- **Zero runtime dependencies**
- **100% branch coverage, CI-enforced**
- Holds the three state machines, escalation rules, the decision engine and
  idempotency-key derivation
- Effects are **declared** by the machine and **executed by the caller** — the machine
  never sends a notification

## Alternatives

| Option                                     | Why not                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| Separate client and server implementations | The divergence this ADR exists to prevent            |
| Server-only, client is a thin view         | Breaks offline entirely — the phone must keep timers |
| Share via generated code from a schema     | Indirection without removing the divergence risk     |

## Consequences

**Good** — client and server cannot disagree on transition legality · the
safety-critical logic is the most testable code in the repo · offline reconciliation
becomes tractable because both sides agree what is legal.

**Cost** — the purity constraint is strict: a contributor reaching for `Date.now()` or
a fetch inside the machine breaks it, so this needs the `safety-state-machine` skill
and review to hold · effects-as-data is less direct than inline calls.

## Revisit when

Never, while correctness of escalation matters. If this is relaxed, divergence returns.
