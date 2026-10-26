# Feature Inventory — Real vs Mock

**The most important table in this repo.** Half the UI is a convincing prototype.
Nobody — human or agent — should plan work, demo the app, or describe it to a user
without knowing which half.

Verified by reading the code on 2026-10-26.

|                | Meaning                                                               |
| -------------- | --------------------------------------------------------------------- |
| ✅ **Real**    | Wired end to end: UI → API → database, or a genuine device capability |
| 🟨 **Partial** | Works, but a key part is missing or in-process only                   |
| ⛔ **Mock**    | Looks functional, does nothing                                        |

---

## Summary

| Feature                        | Status     | Where                                 |
| ------------------------------ | ---------- | ------------------------------------- |
| Email + password auth          | ✅ Real    | `AuthModule`, `AuthScreen`            |
| Session persistence            | ⛔ Mock    | in-memory only                        |
| Settings & profile             | ✅ Real    | `SettingsModule`, `settings/*`        |
| Trusted contacts               | 🟨 Partial | stored; never used by any alert       |
| Danger zone feed               | 🟨 Partial | real data, fake positions             |
| Report a danger zone           | 🟨 Partial | server invents the location           |
| Map                            | ⛔ Mock    | static JPEG, no map SDK               |
| SOS / Emergency                | ⛔ Mock    | notifies nobody                       |
| Shake to SOS                   | ✅ Real    | `useShakeDetector`                    |
| Voice activation               | ✅ Real    | `useVoiceActivation` (dev build only) |
| Crash detection                | ✅ Real    | `useAccidentDetector`                 |
| Fake call                      | ✅ Real    | AI-generated script                   |
| AI safety assistant            | 🟨 Partial | works; no conversation memory         |
| Self-defense tips              | ✅ Real    | AI with fallback                      |
| Check-in timer                 | 🟨 Partial | fires, but in-process only            |
| Follow Me                      | ⛔ Mock    | hardcoded share link                  |
| Community / Safe Walk          | ⛔ Mock    | local state                           |
| Nearby volunteers              | ⛔ Mock    | a text label                          |
| Audio/video evidence recording | ⛔ Mock    | `const isRecording = false`           |
| Push notifications             | ❌ Absent  | not implemented at all                |
| Offline support                | ❌ Absent  | —                                     |

---

## ✅ Real

### Authentication

`POST /auth/login` and `/signup`. argon2id hashing, 7-day HS256 JWT, `JwtAuthGuard`
on every other route. The login screen ships with seed credentials prefilled
(`josim@example.com` / `password`) — remove before any public build.

Missing: email verification, password reset, refresh tokens, rate limiting, MFA,
social sign-in.

### Settings and profile

`GET`/`PUT /api/v1/settings`. Persists full name, blood type, allergies, the six
security toggles, and the trusted-contacts list. The toggles genuinely control
the sensor hooks.

Caveats: the `PUT` body is unvalidated (`body: any`) and saving contacts deletes
and recreates the whole list non-transactionally ([KI-7](KNOWN_ISSUES.md)).

### Hands-free SOS triggers

All three are real device integrations, and the best-engineered part of the app:

- **Shake** — accelerometer, > 2.5 G, 800 ms debounce
- **Crash** — accelerometer, > 6.0 G, 1000 ms debounce
- **Voice** — continuous recognition for **"Hey Lumo, emergency"** (brand variant +
  intent word, matched across all recognizer alternatives); needs a custom dev
  build, degrades silently in Expo Go

They all route to `handleActivateEmergency`, which navigates to the mock SOS
screen — so a genuine trigger leads to a fake response.

### Fake call

`FakeCallScreen` fetches a caller name and dialogue from
`GET /ai/fake-call-script` and plays an incoming-call UI. Gemini-generated, with a
local fallback script when there is no API key.

### Self-defense tips

Fetched from `GET /ai/self-defense-tips` inside the emergency screen's defense
overlay. Real network call, real fallback.

---

## 🟨 Partial

### Danger zones

Real persistence, real community feed, **fake geography**. Positions are CSS
percentages over `map_bg.jpg`, and the server generates them:

```ts
const top = `${48 + Math.random() * 4}%`;
const left = `${48 + Math.random() * 4}%`;
```

A report therefore has no connection to where the user was. `GET` also returns
every zone ever created with no pagination or distance filter.
([KI-2](KNOWN_ISSUES.md))

### Trusted contacts

Stored, editable, validated-ish. Then unused: the emergency screen renders a
**hardcoded** ring (`Police`, `EMS`, `Mom`, `Security`, `Dad`, `Guard`), and
`sendSmsOnSos` / `shareLocationOnSos` are read from the database by nothing.

### AI safety assistant

`POST /ai/safety-chat` works. But `history` is accepted by the client and the
service and then never added to the prompt, so every turn is stateless — the
assistant cannot follow up. ([KI-14](KNOWN_ISSUES.md))

### Check-in timer

The countdown is genuine and does call `onEmergency()` at zero. Two limits: it
lands on the mock SOS screen, and the `setInterval` lives in the screen — so
navigating away, backgrounding, or the OS killing the app cancels the escalation
silently. A check-in that only works while you are watching it is not a safety
feature; it belongs on the server.

---

## ⛔ Mock

### SOS / Emergency — the big one

`EmergencyModal.tsx` shows "Emergency Calling…", "Notifying your contacts,
emergency services, and sharing your location", a ring of contacts, and
"Notifying Nearby Volunteers…".

**No call is placed. No SMS is sent. No push is sent. No location is uploaded. No
server is contacted** (beyond the optional AI tips). `isRecording` is a literal
`false`.

This is the product's entire reason to exist, and it is a screenshot. Until it
works, the screen should be labelled a demo. ([KI-3](KNOWN_ISSUES.md))

### Follow Me

```ts
const shareLink = `https://lumo.example/follow/jS8fD9kL`;
```

A constant. "Start Sharing" sets local state and shows an alert. No session, no
location stream, no link anyone can open.

### Community / Safe Walk

`requestStatus` is `useState<'idle' | 'pending' | 'accepted'>`. There is no
backend, no volunteer directory, no second user.

### The map

A JPEG. No `react-native-maps`, no tiles, no geolocation, and the header's
location is the hardcoded string _"San diago, 8453 Street, Italy"_.

---

## ❌ Absent entirely

Push notifications · device location (`expo-location` is not a dependency) ·
real-time transport (no WebSocket) · offline queue · SMS/telephony · audio or
video capture · background execution · wearable support · emergency-service
integration · crash/analytics reporting · i18n · dark mode
(`userInterfaceStyle: "light"`) · accessibility labels.

---

## What this means for planning

The engineering quality is high where the app is real — the sensor hooks, the
module boundaries, the shared types, the AI fallbacks and the test suites are all
solid. The gap is not craft, it is that the **response** half of the product was
built as UI first.

So the highest-leverage sequence is narrow: give the system real coordinates, then
make SOS actually reach someone. Those two unlock Follow Me, community help, and
proximity alerts, which are the features that would actually differentiate this
from Google's Personal Safety app. See [ROADMAP.md](ROADMAP.md) and
[COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md).
