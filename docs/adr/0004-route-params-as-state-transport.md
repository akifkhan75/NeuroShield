# ADR-0004: Route params as state transport, no state library

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Project owner

## Context

The app has roughly a dozen screens and exactly two pieces of shared state:
`userSettings` and `dangerZones`. Both are fetched once on the dashboard. The
settings sub-screens need to read settings and save changes; the report and
check-in screens need to invoke a dashboard action.

A state library for two values and four callbacks is more machinery than the
problem justifies.

## Decision

`DashboardScreen` will be the **single owner** of all shared state, and state plus
mutator callbacks will be passed to other screens through **React Navigation route
params**:

```ts
navigation.navigate("Settings", { onLogout, currentSettings, onSave });
navigation.navigate("ReportDangerZone", { onReport });
navigation.navigate("CheckIn", { onEmergency });
```

The settings sub-stack re-passes `currentSettings` / `onSave` to each leaf via
`initialParams`. Authentication stays a conditional branch of the root navigator,
so logging out unmounts the whole authenticated tree.

No Redux, no Zustand, no Context.

## Alternatives considered

| Option         | Why not (at the time)                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| React Context  | The obvious next step; judged unnecessary for two values. The cheapest upgrade when this breaks |
| Redux Toolkit  | Far too much for two values                                                                     |
| Zustand        | Light, but still a dependency and a second way to hold state                                    |
| TanStack Query | A genuinely good fit for the fetch/cache/invalidate shape — the right choice if we revisit      |

## Consequences

**Good**

- Almost no code; data flow is explicit and readable in one file
- No provider nesting, no store boilerplate
- Logout is automatic: the navigator unmounts everything

**Bad / accepted cost**

- **Functions in params are non-serializable** — React Navigation warns, and state
  persistence/rehydration is impossible
- **Deep links cannot reach these screens**, which blocks notification taps —
  a real constraint once push arrives in Phase 2
- `initialParams` gives each leaf a **snapshot**: a change made in
  `ContactSettings` is not visible in `ProfileSettings` without a remount
- Every new screen needing data must be threaded through the dashboard
- `DashboardScreen` is ~160 lines of mixed state, animation and layout

**Rule:** if this is replaced, replace it **completely**. A half-migration with
Context and params both live is worse than either.

## Revisit when

Any of these — and the first is already on the roadmap:

- Push notifications need deep links into `Emergency` or `Journey` (Phase 2)
- An SOS incident needs state shared across screens
- A third screen needs `dangerZones`
- State must survive a cold start ([KI-4](../audit/KNOWN_ISSUES.md))

Likely replacement: TanStack Query for server state + one small Context for the
session.
