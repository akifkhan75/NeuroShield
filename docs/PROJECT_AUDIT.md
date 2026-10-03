# Project Audit

## 1. Current Architecture
The current project is a bare React Native application with a small, monolithic Express.js backend.
* **Frontend**: React Native (bare workflow, version 0.80.1), styled-components, React Navigation (native-stack, stack).
* **Backend**: Express.js with TypeScript (`server/` directory).
* **Data Storage**: In-memory mock database (`server/db.ts`).

## 2. Existing Features
* **Authentication**: Login and Sign-up (currently mock authentication with hardcoded data).
* **Dashboard/Home**: Map view displaying danger zones and user location.
* **Emergency (SOS)**: Activates SOS state.
* **Danger Zones**: Users can view and report "danger zones" (Theft, Assault, Harassment, etc.).
* **Safety Assistant**: An AI integration providing fake call scripts and self-defense tips.
* **Settings**: Profile, Contact, and Security/Alert settings (e.g., location sharing, shake-to-SOS, voice activation, accident detection).
* **Community Safety / Follow Me / Check-In / Fake Call**: Modal screens accessible from the bottom navigation.

## 3. Existing Screens & Navigation
The application uses React Navigation with a main stack and modal presentations.
* `Auth`
* `Dashboard`
* Modal Group:
    * `Settings` (Navigator: `SettingsRoot`, `ProfileSettings`, `ContactSettings`, `AlertSettings`)
    * `CommunitySafety`
    * `FollowMe`
    * `CheckIn`
    * `FakeCall`
    * `ReportDangerZone`
    * `SafetyAssistant`
* Full Screen Modal:
    * `Emergency`

## 4. Existing Data Models (from `types.ts` & `db.ts`)
* `User`: Email, Password Hash, Settings.
* `UserSettings`:
    * `PersonalInfo`: fullName, bloodType, allergies.
    * `TrustedContact`: id, name, phone.
    * `SecuritySettings`: locationSharingEnabled, shareLocationOnSos, sendSmsOnSos, shakeToSosEnabled, voiceActivationEnabled, accidentDetectionEnabled.
* `DangerZone`: id, location (top/left), severity (low/medium/high), type, description, reportedAt.
* `FakeCallScript` & `ChatMessage` for the AI functionality.

## 5. Existing Mock/Static Data
* The backend (`server/db.ts`) contains an in-memory database:
    * A mock user (`josim@example.com`).
    * Pre-populated `dangerZones` array.
* The frontend uses static map images and user avatars (`https://i.imgur.com/5uV1f3D.png`).
* Missing genuine database persistence.

## 6. Proposed Backend Architecture
As per requirements, the application will be migrated to:
* **Monorepo**: Turborepo, pnpm workspaces.
* **Mobile App**: `apps/mobile` (preserving existing UI/UX and React Native setup).
* **Backend API**: `apps/api` using NestJS, structured by domain (Auth, Users, Settings, DangerZones, AI).
* **Database**: PostgreSQL with Prisma ORM (`apps/api/prisma`).
* **Shared Packages**: `packages/types`, `packages/api-client`.
* **DevOps**: Docker, Docker Compose, GitHub Actions.

## 7. Migration Strategy
* **Phase 1**: Audit existing application (Completed).
* **Phase 2**: Create Turborepo monorepo structure.
* **Phase 3**: Move existing React Native application into `apps/mobile`.
* **Phase 4**: Setup NestJS API in `apps/api`.
* **Phase 5**: Setup PostgreSQL + Prisma in `apps/api`.
* **Phase 6**: Implement Authentication module.
* **Phase 7**: Implement core domain models (Settings, Danger Zones).
* **Phase 8**: Implement NestJS API endpoints.
* **Phase 9**: Refactor mobile API client to use shared packages and real API endpoints.
* **Phase 10**: Containerization and final QA checks.

## 8. Risks and Assumptions
* **Assumption**: The project is described as an "Expo" application in some requirements, but the source code is a bare React Native project. The strategy will preserve the existing bare React Native environment to avoid breaking changes.
* **Risk**: Moving the React Native project to a monorepo workspace might require careful configuration of `metro.config.js` to resolve hoisted packages and local workspace packages.
* **Risk**: `react-native-voice/voice` and `react-native-sensors` might require native builds; testing must ensure that the iOS/Android native builds still work after the monorepo restructuring.
