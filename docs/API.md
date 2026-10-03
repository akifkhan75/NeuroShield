# API Documentation

The backend exposes a RESTful API built with NestJS.

## Base URL
`/api/v1`

## Endpoints

### Settings (`/api/v1/settings`)
- **GET `/`**: Retrieve the current user's settings and trusted contacts.
- **PUT `/`**: Update the current user's settings and/or trusted contacts.

### Danger Zones (`/api/v1/danger-zones`)
- **GET `/`**: Retrieve a list of reported danger zones (sorted by newest).
- **POST `/`**: Report a new danger zone. Requires `severity`, `type`, and `description`.

### Authentication (`/api/v1/auth`) (Planned/Stubbed)
- **POST `/login`**: Authenticate a user and return a session/token.
- **POST `/signup`**: Register a new user.

### AI Services (`/api/v1/ai`) (Planned/Stubbed)
- **GET `/fake-call-script`**: Generate a fake call script.
- **GET `/self-defense-tips`**: Generate self-defense tips.

## Validation & Errors
All endpoints validate incoming request bodies using NestJS validation pipes. Invalid requests will return a `400 Bad Request` with an array of validation errors.
