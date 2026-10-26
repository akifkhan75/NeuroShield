# Practice Mode

> Implements RES-18. Counts toward **activation**. Nobody else does this well.

## Why

Two reasons, both load-bearing:

1. **Users do not trust an untested safety button**, and discovering it does not work
   during an emergency is the worst possible time.
2. It is the only safe way to exercise the real pipeline. Simulated emergencies with
   live responders are irresponsible; Practice Mode is the product-grade equivalent of
   the pilot protocol.

## What it exercises

Trigger → countdown → incident creation → location acquisition → recipient resolution
→ channel resolution → **the full Delivery Ledger** → resolve → timeline.

## What it must never do

Contact anyone — no push, SMS, voice, or email leaves the system · create a billable
message · appear in real incident history or metrics · be confusable with a real
incident.

## Guarantees

- A persistent, unmistakable banner: **"Practice — nobody will be contacted"**
- `incident.mode = 'practice'`, enforced at the notification boundary: a practice
  incident **cannot** acquire a real `NotificationAttempt`. Enforced in code, not
  convention, and unit-tested
- Ledger rows are simulated and labelled as such, showing plausible per-channel states
  including a simulated failure, so the user learns to read the real thing
- Excluded from the north-star metric and from spend
- Available offline, with the offline messaging shown

## In onboarding

Step 4 of 5, and **activation is not complete without it** (PRD §7). An installed app
with contacts but no practice run is an untested safety device.

## Tests

No provider call of any kind is made · a practice incident cannot create a real
attempt (boundary test) · excluded from metrics and spend · banner always present ·
works offline · cannot be confused with a real incident in history.
