# ADR-0001: Turborepo + pnpm monorepo with shared packages

- **Status:** Accepted — **partly superseded by [ADR-0007](0007-name-the-product-lumo.md)**:
  the `@neuroshield/*` package scope was renamed to `@lumo/*` on 2026-10-26. The
  old names are left below as the historical record; read them as `@lumo/*`.
- **Date:** 2026-10-04
- **Deciders:** Project owner

## Context

The project began as a bare React Native app plus a small Express server with an
in-memory mock database (`server/db.ts`), in one repo with no shared code. The
mobile app held its own copy of every domain type and talked to the server through
a monolithic `apiService.ts` of hand-written `fetch` calls.

The wire contract was therefore enforced nowhere. A field renamed on the server
surfaced as `undefined` on a user's phone — and for a safety app, "the danger zone
list silently fails to load" is not an acceptable failure mode.

## Decision

We will use a single **Turborepo + pnpm workspaces** monorepo:

```
apps/api  apps/mobile
packages/types  packages/api-client  packages/tsconfig
```

`packages/types` is the single source of truth for domain types.
`packages/api-client` is the single implementation of the wire protocol. Turbo's
`dependsOn: ["^build"]` enforces `types → api-client → apps`.

## Alternatives considered

| Option                           | Why not                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| Two separate repos               | The drift problem we were trying to solve, made worse                     |
| Monorepo without shared packages | No compile-time contract — the main benefit                               |
| Nx                               | More capable, more to learn; Turbo's task graph is all this project needs |
| Generated client (OpenAPI)       | Needs API schema decorators first; worth revisiting at Phase 2            |

## Consequences

**Good**

- A type change breaks the build, not a user's phone
- One `ApiClient` that both the app and its tests exercise
- Turbo caching makes CI cheap

**Bad / accepted cost**

- `apps/mobile` consumes `dist/`, so a fresh clone needs `pnpm build` before Metro
  will resolve `@neuroshield/api-client` — a real papercut
- `metro.config.js` needs explicit `watchFolders` + `nodeModulesPaths` for pnpm's
  symlinked layout, and must not be "simplified"
- `jest.config.js` must whitelist `@neuroshield/.*` in `transformIgnorePatterns`
- Three empty placeholder packages (`config`, `validation`, `eslint-config`) were
  created and never filled — delete them

**Follow-on**

- `apps/mobile/types.ts` still duplicates `packages/types`, which defeats part of
  the purpose ([KI-6](../audit/KNOWN_ISSUES.md))

## Revisit when

A third app appears (an admin console, a responder app), or build times make
generated clients and project references worth the setup.
