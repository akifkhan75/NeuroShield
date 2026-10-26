# ADR-0002: NestJS + Prisma + PostgreSQL for the API

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Project owner

## Context

The original backend was Express + TypeScript over an in-memory object. Nothing
persisted, there was no validation, no auth, and no structure that would survive
adding features. The domain was already clearly bounded — auth, settings, danger
zones, AI — and the data was relational: a user has contacts and reports.

## Decision

We will use **NestJS 12** with **Prisma 5** over **PostgreSQL 15**, organised one
module per domain (`auth`, `settings`, `danger-zones`, `ai`, `prisma`), each with
a module, controller, service and co-located spec.

Cross-cutting choices made with it:

- Controllers spell out their own `api/v1/...` prefix — no global prefix, no
  `enableVersioning()`
- A global `ValidationPipe({ transform: true, whitelist: true })`
- `PrismaService` provided by a `@Global()` module (one client per process)
- Services return **API-shaped objects**, never raw Prisma rows

## Alternatives considered

| Option              | Why not                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Keep Express        | No DI, no validation pipeline, no module boundaries; structure would be convention-only                         |
| Fastify + Zod       | Lighter and faster, but Nest's DI makes testing with a mocked `PrismaService` trivial                           |
| TypeORM             | Prisma's schema file and generated client are better DX; migrations are clearer                                 |
| MongoDB             | The data is relational: users → contacts → reports, with cascade semantics that matter                          |
| Supabase / Firebase | Fast start, but the roadmap needs geospatial queries, SMS fan-out and custom auth — we would fight the platform |

## Consequences

**Good**

- Module boundaries mirror the product; a new domain is a predictable folder
- Guards and pipes make auth and validation declarative
- Mocking `PrismaService` gives fast unit tests with no database
- Relational integrity: `onDelete: Cascade` for contacts, `SetNull` for reports so
  community data outlives its reporter

**Bad / accepted cost**

- `whitelist: true` silently strips undecorated properties — the single most common
  confusion in this codebase
- Per-controller prefixes mean a versioning change touches four files
- Returning mapped shapes means hand-written mappers (`mapInputType` /
  `mapOutputType`), which must stay in sync with the enum

**Follow-on**

- No `@nestjs/config`, so `process.env` is read directly and `JWT_SECRET` has an
  insecure fallback ([KI-9](../KNOWN_ISSUES.md))
- No global exception filter, request logging, or rate limiting
- No migrations were ever generated ([KI-5](../KNOWN_ISSUES.md))

## Revisit when

Geospatial queries need PostGIS (likely at Phase 1), or SMS fan-out needs a queue
and worker rather than an in-request call.
