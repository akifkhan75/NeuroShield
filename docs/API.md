# API Reference

NestJS 12 REST API. **Verified against `apps/api/src/` on 2026-10-26.**

- **Base URL (dev):** `http://<host>:3005` — but `main.ts` defaults `API_PORT` to
  **3001**. Set `API_PORT=3005` in `apps/api/.env`; the mobile client assumes 3005.
- **Prefix:** every controller spells out `api/v1/...` itself. There is no global
  prefix and no `enableVersioning()`.
- **Auth:** `Authorization: Bearer <jwt>` on everything except `/auth/*` and `/`.
- **CORS:** `app.enableCors()` with no options — all origins allowed.
- **Validation:** global `ValidationPipe({ transform: true, whitelist: true })`.
  Properties without a `class-validator` decorator on the DTO are **silently
  stripped** from the body.

The canonical client for all of this is
[`packages/api-client`](../packages/api-client/src/index.ts) — prefer adding a
method there over calling `fetch` anywhere else.

---

## Health

### `GET /`

Public. Returns the string from `AppService.getHello()`. Used by the e2e suite as
a liveness check.

---

## Authentication — `/api/v1/auth`

Public. Both endpoints return a signed JWT (`{ email, sub: userId }`, **7-day
expiry**, HS256, secret from `JWT_SECRET`). Passwords are hashed with **argon2id**.

### `POST /api/v1/auth/login` → `200 OK`

```json
{ "email": "josim@example.com", "password": "password" }
```

| Field      | Rules                      |
| ---------- | -------------------------- |
| `email`    | `@IsEmail`, `@IsNotEmpty`  |
| `password` | `@IsString`, `@IsNotEmpty` |

Response:

```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "email": "josim@example.com", "fullName": "Josim" }
}
```

Errors: `401` `Invalid credentials` (same message for unknown email and wrong
password — deliberate, do not make it specific), `400` on validation failure.

### `POST /api/v1/auth/signup` → `201 Created`

```json
{
  "email": "new@example.com",
  "password": "atleast6",
  "fullName": "New User",
  "name": "New User"
}
```

| Field      | Rules                                     |
| ---------- | ----------------------------------------- |
| `email`    | `@IsEmail`, `@IsNotEmpty`                 |
| `password` | `@IsString`, `@MinLength(6)`              |
| `fullName` | `@IsString`, `@IsOptional`                |
| `name`     | `@IsString`, `@IsOptional` — legacy alias |

Both `fullName` and `name` are accepted; the service resolves
`fullName || name || 'User'`. The client sends both. Response shape matches login.

Errors: `400` `User with this email already exists`.

> No email verification, no password reset, no refresh token, no rate limiting,
> and `MinLength(6)` is the only password rule. See
> [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md).

---

## Settings — `/api/v1/settings`

`@UseGuards(JwtAuthGuard)` at the controller level. Always scoped to the caller;
there is no way to read another user's settings.

### `GET /api/v1/settings` → `200 OK`

Composed from the flat `User` row plus its `TrustedContact[]`:

```json
{
  "personalInfo": {
    "fullName": "Josim",
    "bloodType": "O+",
    "allergies": "None"
  },
  "trustedContacts": [{ "id": "uuid", "name": "Mom", "phone": "111-222-3333" }],
  "security": {
    "locationSharingEnabled": true,
    "shareLocationOnSos": true,
    "sendSmsOnSos": false,
    "shakeToSosEnabled": true,
    "voiceActivationEnabled": false,
    "accidentDetectionEnabled": false
  }
}
```

`bloodType` and `allergies` are nullable columns coerced to `""`.

Errors: `404` `User not found` (a valid token for a deleted user), `401` without a token.

### `PUT /api/v1/settings` → `200 OK`

Accepts the same shape; all three sections are optional, and within
`personalInfo` / `security` any subset of fields may be sent (`undefined` fields
are skipped by Prisma). Returns the full re-read settings object.

```json
{
  "personalInfo": {
    "fullName": "Josim",
    "bloodType": "O+",
    "allergies": "Penicillin"
  },
  "security": { "shakeToSosEnabled": false },
  "trustedContacts": [{ "name": "Mom", "phone": "111-222-3333" }]
}
```

**Two behaviors to know before you call this:**

1. The handler is typed `@Body() body: any`, so it **opts out of the global
   ValidationPipe**. Garbage in this body reaches Prisma. ([KI-7](KNOWN_ISSUES.md))
2. If `trustedContacts` is present, the service **deletes every contact and
   recreates the array**, outside a transaction. Contact `id`s change on every
   save, and a crash between the two statements leaves the user with **no
   emergency contacts**. Omit the key entirely to leave contacts untouched.

---

## Danger Zones — `/api/v1/danger-zones`

`@UseGuards(JwtAuthGuard)` at the controller level.

### `GET /api/v1/danger-zones` → `200 OK`

**All** zones, from all users, newest first (`reportedAt desc`). No pagination, no
distance filter, no `userId` in the response.

```json
[
  {
    "id": "uuid",
    "location": { "top": "45%", "left": "60%" },
    "severity": "high",
    "type": "Assault",
    "description": "A physical assault was reported here last night.",
    "reportedAt": "2026-10-26T12:00:00.000Z"
  }
]
```

`location.top` / `.left` are **CSS percentages over a static map image**, not
coordinates. ([KI-2](KNOWN_ISSUES.md))

### `POST /api/v1/danger-zones` → `201 Created`

```json
{
  "severity": "medium",
  "type": "Suspicious Activity",
  "description": "Someone following me"
}
```

| Field         | Values                                                                           |
| ------------- | -------------------------------------------------------------------------------- |
| `severity`    | `low` \| `medium` \| `high`                                                      |
| `type`        | `Theft` \| `Assault` \| `Harassment` \| `Poor Lighting` \| `Suspicious Activity` |
| `description` | string                                                                           |

> **The client cannot set the location.** The controller generates it:
> `` top = `${48 + Math.random() * 4}%` ``, same for `left`. Every report lands in
> a random spot near the centre of the image. There is no DTO on this endpoint
> either, so `type` is coerced: `mapInputType` falls through to
> `Suspicious_Activity` for anything it does not recognise, rather than erroring.

`userId` is taken from the JWT. Response shape matches a `GET` element.

Not implemented: update, delete, vote/confirm, expiry of stale reports.

---

## AI — `/api/v1/ai`

Guards are applied **per route** here (not at the controller), though all three
are currently guarded. Backed by Google Gemini (`@google/genai`,
`gemini-1.5-flash`) with `process.env.API_KEY`.

**Every endpoint degrades gracefully.** With no key, a parse failure or a thrown
error, it returns a hardcoded fallback and still answers `200`. This is intentional
— never make an emergency feature depend on an LLM round-trip. Preserve it.

### `GET /api/v1/ai/fake-call-script` → `200 OK`

```json
{
  "callerName": "Maya",
  "script": ["Hey! Where are you?", "I'm just around the corner…", "Hurry up!"]
}
```

Fallback: `{ "callerName": "Friend", "script": ["Hey, are you there?", …] }`

### `GET /api/v1/ai/self-defense-tips` → `200 OK`

```json
["Yell 'FIRE!' to get attention.", "Run towards a populated, well-lit area."]
```

An array of strings — the model is asked for `{ tips: [...] }` and the service
unwraps it. Fallback: `["Yell for help!", "Run away if possible!", "Aim for vulnerable spots."]`

### `POST /api/v1/ai/safety-chat` → `200 OK`

```json
{ "message": "I'm walking home alone at night", "history": [] }
```

Response: `{ "response": "…" }`

> `history` is accepted by both the client and the service and then **never used**
> — the prompt is built from `message` only, so the assistant has no memory within
> a conversation. ([KI-14](KNOWN_ISSUES.md))

The user message is interpolated directly into the prompt string, which is a
prompt-injection surface; it is low-impact today (the output is only displayed)
but matters once the assistant can act.

---

## Errors

Standard NestJS exception shape:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

`message` is a **string** for thrown `HttpException`s and an **array of strings**
for validation failures. `ApiClient.handleResponse` reads `error.message` and
falls back to `HTTP error! status: ${status}`, so an array arrives at the UI
stringified — worth normalising with an exception filter.

| Code  | When                                                |
| ----- | --------------------------------------------------- |
| `400` | Validation failure, or duplicate email on signup    |
| `401` | Missing/invalid/expired token; bad credentials      |
| `404` | `GET /settings` for a user id that no longer exists |
| `500` | Unhandled — e.g. database unreachable               |

There is no global exception filter, no request logging, and no correlation id.

---

## Endpoints the product needs but does not have

Tracked in [ROADMAP.md](ROADMAP.md); listed here so nobody looks for them twice.

| Planned                                                       | Purpose                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `POST /api/v1/sos`                                            | Record an incident, fan out to contacts — the real SOS ([KI-3](KNOWN_ISSUES.md)) |
| `POST /api/v1/journeys`, `PATCH /…/location`, `GET /j/:token` | Real Follow Me with a public tracking link                                       |
| `POST /api/v1/check-ins`                                      | Server-side timer so a dead phone still escalates                                |
| `GET /api/v1/danger-zones/nearby?lat&lng&radius`              | Proximity query (needs the geo model)                                            |
| `POST /api/v1/devices`                                        | Push token registration                                                          |
| `POST /api/v1/auth/refresh`, `/forgot-password`               | Session and account recovery                                                     |
| `GET /api/v1/me`                                              | Identity without the whole settings payload                                      |
