# ADR-0014: Modular monolith, with explicit extraction criteria

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Architecture

## Context

The target architecture adds roughly 22 API modules across seven phases, plus a web
app and a durable queue. The temptation at this point is microservices, Kubernetes and
multiple datastores because the ambition is global.

The actual constraint is different: a small team must keep an **emergency workflow
dependable** while the surface area grows. Distributed systems add failure modes to
the exact path that must not fail.

## Decision

A **NestJS modular monolith**, modules added **incrementally per phase** — never as
empty shells. This repo has already shipped three empty packages; that will not repeat.

Module discipline: each owns its responsibilities and interfaces. In particular
**`ai-safety` may not send a notification** — it emits a signal the decision engine
evaluates; and **`notifications` may not decide** whether a missed check-in is an
emergency — it delivers what escalation asked for and reports the result. That
separation is what makes the system testable and accountable.

### Extraction criteria — a module leaves the monolith only for

1. Materially different scaling characteristics
2. A genuine fault-isolation requirement
3. An independent release cadence
4. A specialised runtime (e.g. GPU inference)
5. A clear organisational ownership boundary

Likely first candidates: **notification delivery** (fault isolation on the critical
path) and **media processing** (different scaling, specialised runtime). Auth, users
and ordinary CRUD do not qualify.

## Consequences

**Good** — one deploy, one transaction boundary, straightforward local development ·
the SOS path has no cross-service hop · module boundaries make later extraction cheap.

**Cost** — a noisy module can affect others until extracted · the queue is the one
required piece of distributed infrastructure from Phase 1 · discipline must be
enforced by review, since nothing physically prevents a cross-module shortcut.

## Revisit when

One of the five criteria is genuinely met — not because a diagram looks better.
