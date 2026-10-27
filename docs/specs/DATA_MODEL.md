# Data Model

> Target model. Current schema and its defects: [`../engineering/DATABASE.md`](../engineering/DATABASE.md).
> Prisma 5 / PostgreSQL 15. **Migrations required from Phase 0** — none exist today.

## Entities by phase

| Phase | Entities                                                                                                                                                                                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | `User` · `TrustedContact` · **`HazardReport`** (replaces `DangerZone`, ADR-0010) · `HazardConfirmation`                                                                                                                                                                                            |
| 1     | `SafetyCircle` · `CircleMembership` · `SafetySession` · `Journey` · `LocationSnapshot` · `EmergencyIncident` · `IncidentEvent` · `EscalationPolicy` · `NotificationAttempt` · `NotificationEvent` · `ConsentRecord` · `Device` · `DeviceCapability` · `JourneyLink` · `RegionProfile` · `AuditLog` |
| 2     | `EvidenceAsset` · `EvidenceAccessLog` · `DuressCredential`                                                                                                                                                                                                                                         |
| 3     | `SafetySignal` · `ModelVersion`                                                                                                                                                                                                                                                                    |
| 4     | `SafetyPlace` · `Organization` · `OrganizationMembership` · `Responder`                                                                                                                                                                                                                            |
| 5     | `Subscription` · `Entitlement`                                                                                                                                                                                                                                                                     |

## Rules

**Geo.** `HazardReport` and `LocationSnapshot` carry `latitude`/`longitude` as `Float`
plus `accuracyMetres`, and a `geohash` indexed for radius queries. The `top`/`left`
CSS percentages are **deleted** — they carried no real location (ADR-0006).

> `HazardReport` is built with `latitude`, `longitude` and a nullable
> `accuracyMetres`. **`geohash` is not built**: there is no radius query yet
> because the device cannot read its own position. `accuracyMetres` is nullable
> here — a reporting device genuinely may not know, and an unknown accuracy must
> travel as unknown rather than defaulting to a confident number. On
> `LocationSnapshot` it stays non-nullable, per the next rule.

**Every location is a snapshot.** `capturedAt` + `accuracyM` are **non-nullable**, so
the UI cannot render a fix without its age and precision (RES-10).

**Append-only where it is evidence.** `IncidentEvent`, `NotificationEvent`,
`EvidenceAccessLog` and `AuditLog` are never updated or deleted. A row's `state` is a
materialised view of its latest event. The history _is_ the evidence (REC-1).

**Idempotency.** `EmergencyIncident.idempotencyKey` unique. `NotificationAttempt`
unique on `(incidentId, recipientId, channel, attemptNumber)`.

**Consent is a record, not a flag.** `ConsentRecord` has subject, scope, grantedAt,
revokedAt, region profile and version — because PRO-8 requires periodic
re-confirmation and the history must be provable.

**No demographic fields.** Not optional — **absent** from the schema. T7/C8.

**Tenancy.** Every org-scoped table carries `organizationId`, enforced in application
authorization **and** with database-level protection. Zero tolerance (F14).

**PII at rest.** Field-level encryption for medical data and phone numbers (DB-3).

**Retention.** Per region profile; `expiresAt` on hazard reports, location snapshots
and evidence. Erasure propagates to backups within the profile SLA.

## Indexes

`HazardReport(geohash)`, `(reportedAt)`, `(expiresAt)` · `LocationSnapshot(sessionId, capturedAt)`
· `EmergencyIncident(userId, createdAt)`, `(idempotencyKey)` unique
· `NotificationAttempt(incidentId)`, `(state)` · `AuditLog(actorId, at)`.

DB-1 is closed: the schema now indexes `TrustedContact(userId)`,
`HazardReport(userId)`, `(expiresAt)`, `(reportedAt)`,
`HazardConfirmation(userId)` and a unique `(reportId, userId)`. Only
`HazardReport(geohash)` is outstanding, and it waits on the radius query.

**Confirmation counts are derived**, not stored: `HazardConfirmation` is one
uniquely-constrained row per person per report, so a count cannot be inflated by
one account and cannot drift from a denormalised column.
