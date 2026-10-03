# Database

## Technologies
- **Engine**: PostgreSQL 15 (via Docker)
- **ORM**: Prisma

## Schema Overview
The database schema (`apps/api/prisma/schema.prisma`) represents the core domain entities:

- **User**: Represents a registered user.
  - Core fields: `id`, `email`, `passwordHash`, `fullName`, `bloodType`, `allergies`.
  - Settings fields: `locationSharingEnabled`, `shareLocationOnSos`, `sendSmsOnSos`, `shakeToSosEnabled`, `voiceActivationEnabled`, `accidentDetectionEnabled`.
- **TrustedContact**: Emergency contacts linked to a User.
  - Fields: `id`, `name`, `phone`, `userId` (FK).
- **DangerZone**: User-reported danger areas on the map.
  - Fields: `id`, `top`, `left`, `severity` (enum), `type` (enum), `description`, `reportedAt`, `userId` (FK).

## Development Setup
A local PostgreSQL instance can be started using the provided Docker Compose file:
```bash
docker-compose up -d postgres
```

## Migrations
Migrations are handled via Prisma:
- **Development**: `pnpm prisma migrate dev`
- **Production**: `pnpm prisma migrate deploy`
- **Seed Data**: `pnpm prisma db seed`
