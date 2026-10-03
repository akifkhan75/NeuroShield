# Architecture

## Monorepo
The project is structured as a Turborepo monorepo, utilizing `pnpm` workspaces for package management. This allows for sharing code, configuration, and ensuring a consistent build pipeline across frontend and backend.

### Apps
- **`apps/mobile`**: The existing React Native application (bare workflow). Serves as the primary user interface.
- **`apps/api`**: A NestJS-based RESTful API that handles business logic, authentication, and data persistence.

### Packages
- **`packages/types`**: Shared TypeScript definitions, interfaces, and DTO types used across both the mobile app and the API.
- **`packages/api-client`**: A centralized, type-safe HTTP client used by the mobile application to communicate with the NestJS API.
- **`packages/config`**: Shared configuration settings (e.g., constants).
- **`packages/tsconfig`**: Shared TypeScript configuration bases.

## Backend Architecture
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Modules**: Auth, Users, DangerZones, Settings, AI Services.
- **Validation**: Global `ValidationPipe` with `class-validator`.

## Frontend Integration
The mobile app previously used a monolithic `apiService.ts` with direct `fetch` calls. It has been refactored to use the shared `@neuroshield/api-client` and `@neuroshield/types` to ensure type safety between the frontend and backend.
