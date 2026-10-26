# ADR-0010: Hazard reports replace danger zones

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Product, Architecture

## Context

The existing model is `DangerZone`: a location with `severity: low|medium|high` and a
free-text description. The product strategy simultaneously instructs: _"Do not create
a map that labels neighborhoods as dangerous based on unverified accusations,
demographic characteristics, or a small number of reports."_

The existing feature does exactly that, and **its name encodes the bias**. Crowdsourced
crime reporting has a documented history of producing racialised avoidance maps. A
name like "danger zone" will leak into the UI, the API, the store listing and the
press, and it teaches users to think in area verdicts.

## Decision

Rename to **`HazardReport`** and change the semantics from a verdict about a place to
an **observation about a condition**:

- `type` (e.g. lighting, obstruction, harassment-reported) · `source` · `reportedAt` ·
  `confirmationCount` · `expiresAt` · coordinates with accuracy
- **`severity` is removed.** A condition has confirmations and an age, not a danger grade
- **No demographic field exists in the schema at all** — not optional, absent
- No free-text naming of individuals or businesses
- Mandatory decay; a confirmation floor before a report influences routing
- Verified advisories rendered visually distinct from community reports

UI shows observations — _"street lighting issue reported 2 days ago, 3
confirmations"_ — never a score.

## Alternatives

| Option                            | Why not                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| Keep the name, fix the UI         | The name drives the model and the vocabulary; it would return |
| Keep `severity`, add moderation   | Severity-on-a-place is the redlining primitive                |
| Drop community reporting entirely | Loses the prevention pillar, which is the main differentiator |

## Consequences

**Good** — removes the redlining primitive structurally rather than by policy ·
reports become actionable and verifiable · aligns the schema with the stated ethics.

**Cost** — a breaking API and schema change · "severity" is intuitive to users and its
absence needs design work · existing data has no salvage value (positions were
fabricated anyway — see ADR-0006).

## Revisit when

Never for the demographic-field prohibition. Report types may expand with moderation
capacity.
