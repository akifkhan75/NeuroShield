# Database

- **Engine:** PostgreSQL 15 (`postgres:15-alpine` via `docker-compose.yml`)
- **ORM:** Prisma 5.22 (`prisma-client-js`)
- **Schema:** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma)
- **Host port:** `5434` → container `5432` (chosen to avoid colliding with a local Postgres)
- **Volume:** `postgres_data_v2`

```
DATABASE_URL="postgresql://lumo:lumo_password@localhost:5434/lumo_db?schema=public"
```

---

## Model graph

```
┌────────────────────────────────┐
│ User                           │
│  id            String  @id uuid│
│  email         String  @unique │
│  passwordHash  String          │  argon2id
│  fullName      String          │
│  bloodType     String?         │
│  allergies     String?         │
│  ── security flags ──          │
│  locationSharingEnabled   @default(true)
│  shareLocationOnSos       @default(true)
│  sendSmsOnSos             @default(false)
│  shakeToSosEnabled        @default(true)
│  voiceActivationEnabled   @default(false)
│  accidentDetectionEnabled @default(false)
│  createdAt / updatedAt         │
└──────┬──────────────────┬──────┘
       │ 1:N              │ 1:N
       │ onDelete:Cascade │ onDelete:SetNull
┌──────▼──────────┐  ┌────▼──────────────────────────┐
│ TrustedContact  │  │ DangerZone                    │
│  id    uuid     │  │  id          uuid             │
│  name  String   │  │  top         String  "45%"    │ ← CSS %, not geo
│  phone String   │  │  left        String  "60%"    │ ← CSS %, not geo
│  userId FK      │  │  severity    enum             │
└─────────────────┘  │  type        enum             │
                     │  description String           │
                     │  reportedAt  @default(now())  │
                     │  userId      FK?  nullable    │
                     └───────────────────────────────┘
```

### Delete semantics

- `User` → `TrustedContact`: **Cascade.** Deleting a user removes their contacts.
- `User` → `DangerZone`: **SetNull.** Reports survive the reporter, becoming
  anonymous community data. That is the right call for the product, and it is why
  `DangerZone.userId` is optional.

---

## Enums

```prisma
enum DangerZoneSeverity { low  medium  high }

enum DangerZoneType {
  Theft
  Assault
  Harassment
  Poor_Lighting       @map("Poor Lighting")
  Suspicious_Activity @map("Suspicious Activity")
}
```

### The enum mapping, in three representations

This is the single most error-prone thing in the data layer. One value has
**three** spellings:

| Layer                         | Value                                  |
| ----------------------------- | -------------------------------------- |
| Prisma client / TypeScript    | `DangerZoneType.Suspicious_Activity`   |
| Postgres column value         | `"Suspicious Activity"` (via `@map`)   |
| API / mobile `DangerZoneType` | `'Suspicious Activity'` (string union) |

`DangerZonesService` translates by hand in both directions:

```ts
mapInputType('Suspicious Activity')  → DangerZoneType.Suspicious_Activity
mapOutputType(DangerZoneType.Poor_Lighting) → 'Poor Lighting'
```

Two consequences:

- `mapInputType` has **no error branch** — any unrecognised string silently
  becomes `Suspicious_Activity`. A typo in a client becomes bad data, not a 400.
- Adding a type means editing **four** places: `schema.prisma`, both mappers,
  `packages/types/src/index.ts`, and `apps/mobile/types.ts`.

---

## Migrations — none exist yet

**`apps/api/prisma/migrations/` is absent.** The schema has only ever been applied
with `prisma db push`. There is no migration history, so there is no reviewable
schema diff and no safe production deploy.

`archive/PRODUCTION_AUDIT.md` claims migrations are tracked. That claim is false
([KI-5](../audit/KNOWN_ISSUES.md)).

### Current (dev) workflow

```bash
docker compose up -d postgres
pnpm --filter api exec prisma generate     # regenerate the client after schema edits
pnpm --filter api exec prisma db push      # apply the schema, no history
pnpm --filter api exec prisma studio       # browse the data
```

### Adopting migrations (do this before any deploy)

```bash
# against a clean/dev database, create the baseline
pnpm --filter api exec prisma migrate dev --name init
# from then on
pnpm --filter api exec prisma migrate dev --name add_geo_columns
# in CI / production
pnpm --filter api exec prisma migrate deploy
```

Commit `prisma/migrations/` from that point on and stop using `db push`.

---

## Seeding

```bash
pnpm --filter api exec prisma db seed
```

Configured as `node --loader ts-node/esm prisma/seed.ts`. It is **idempotent for
the user** (`upsert` on email, which also resets the password hash) but
**additive for danger zones** — each run inserts three more. Re-seeding repeatedly
will pile up duplicates.

Seed data:

|          |                                                                                  |
| -------- | -------------------------------------------------------------------------------- |
| User     | `josim@example.com` / password **`password`**, blood type `O+`                   |
| Contacts | `Mom` `111-222-3333`, `Emergency Services` `911`                                 |
| Zones    | high/Assault at 45%,60% · medium/Theft at 70%,30% · low/Poor_Lighting at 30%,25% |

`AuthScreen.tsx` ships with these credentials prefilled, which is convenient in
development and must be removed before any public build.

---

## Indexes and performance

Only what Prisma creates implicitly: primary keys, the unique index on
`User.email`, and foreign-key indexes. That is adequate at current scale.

It stops being adequate as soon as `GET /danger-zones` has real volume — the query
is an unbounded `findMany` ordered by `reportedAt desc` over every row ever
created, with no pagination. The fix arrives with the geo model below.

---

## The schema change this project needs most

Replacing the percentage positions with real coordinates ([KI-2](../audit/KNOWN_ISSUES.md))
unblocks maps, proximity alerts and nearby-help. Sketch:

```prisma
model DangerZone {
  id          String             @id @default(uuid())
  latitude    Float
  longitude   Float
  geohash     String                              // prefix-match for cheap radius queries
  accuracyM   Float?
  severity    DangerZoneSeverity
  type        DangerZoneType
  description String
  reportedAt  DateTime           @default(now())
  expiresAt   DateTime?                           // stale reports should decay
  confirmCount Int               @default(0)      // community corroboration
  userId      String?
  user        User?              @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([geohash])
  @@index([reportedAt])
}
```

Migration path: add the new columns as nullable, backfill nothing (the percentages
carry no real location and should be discarded), ship the client that sends
coordinates, then drop `top`/`left` and make the new columns required.

Other models the roadmap needs: `SosIncident`, `Journey` + `JourneyPing`,
`CheckIn`, `Device` (push tokens), `ZoneConfirmation`. See
[ROADMAP.md](../product/ROADMAP.md).

---

## Operational notes

- **Connection pooling** is Prisma's default singleton pool. `PrismaService` is
  provided by a `@Global()` module, so there is exactly one client per process.
- **No soft deletes, no audit trail.** A safety app will eventually need both —
  an incident record is evidence.
- **Backups:** none configured. The Docker volume is the only copy of local data.
- **PII:** `email`, `fullName`, `bloodType`, `allergies`, and contact phone numbers
  are all stored in plaintext. See [SECURITY_AND_PRIVACY.md](SECURITY.md).
