# Architecture Decision Records

Short, immutable notes on decisions that shaped the codebase: the context, the
choice, the consequences. They explain _why_ the code looks the way it does, which
is the context a new contributor — or a model reading this repo cold — cannot
recover from the source alone.

## When to write one

A decision that is expensive to reverse, or that someone will otherwise "fix"
without knowing why it was chosen:

- choosing or replacing a framework, database, ORM or state library
- a cross-cutting pattern (how state moves, how errors surface, how auth works)
- a schema shape with product consequences
- deliberately _not_ doing something obvious

Not for: library bumps, styling, or anything a code comment covers.

## How

1. Copy [`0000-template.md`](0000-template.md) to `NNNN-short-kebab-title.md`.
2. Fill it in. One page. Write the honest trade-off, not a justification.
3. Status is `Proposed` → `Accepted` → (later) `Superseded by ADR-NNNN`.
4. **Never edit an accepted ADR's decision.** Supersede it with a new one — the
   record of what we used to think is the point.
5. Link it from [`../ARCHITECTURE.md`](../ARCHITECTURE.md) if it is structural.

## Index

| #                                                     | Title                                             | Status                     |
| ----------------------------------------------------- | ------------------------------------------------- | -------------------------- |
| [0001](0001-turborepo-monorepo.md)                    | Turborepo + pnpm monorepo with shared packages    | Accepted                   |
| [0002](0002-nestjs-prisma-postgres.md)                | NestJS + Prisma + PostgreSQL for the API          | Accepted                   |
| [0003](0003-expo-dev-client-over-bare-rn.md)          | Expo dev client over bare React Native            | Accepted                   |
| [0004](0004-route-params-as-state-transport.md)       | Route params as state transport, no state library | Accepted                   |
| [0005](0005-ai-fallbacks-are-mandatory.md)            | Every AI call must have a local fallback          | Accepted                   |
| [0006](0006-percentage-coordinates-to-be-replaced.md) | Percentage coordinates were a porting shortcut    | Accepted, to be superseded |
| [0007](0007-name-the-product-lumo.md)                 | Name the product Lumo                             | Accepted                   |

ADRs 0001–0006 were written retrospectively on 2026-10-26 to capture decisions
already visible in the code. Dates are the decision's approximate date from git
history, not the writing date.
