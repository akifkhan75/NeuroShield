# Journey Guardian

> The signature everyday feature. Implements RES-12/14, PREV-5.
> States: `SafetySession` in [`SAFETY_STATE_MACHINES.md`](SAFETY_STATE_MACHINES.md).

## Why it matters

Most people will use SOS a handful of times in their lives. They will walk home
hundreds of times. Journeys make Lumo a weekly habit rather than an emergency relic —
which is what makes the network, the referral loop and the subscription viable.

## Configure (≤2 taps, defaults learned from the last journey)

Destination · expected arrival · trusted contact(s) · optional route · continuous
sharing on/off · what happens on a missed check-in · optional evidence pre-arm.

## During

Monitor progress against available location updates and OS capability. Glanceable
active state: where, who is watching, what happens if the check-in is missed, and a
prominent **I've arrived**.

## Deviation (RES-14) — must not cry wolf

1. Detect a **meaningful** deviation from the expected route
2. Account for GPS accuracy and plausible detours (a shop, a diversion)
3. Notify the **user** discreetly first
4. Offer one-tap "I'm fine"
5. Escalate per policy only if the deviation persists **or** another signal agrees
6. Contacts are told only when the escalation conditions are met

A single off-route fix never alerts anyone. GPS drift in a city is routine.

## Missed arrival

```
deadline      → notify the USER only
+ grace (≥5m, configurable) → notify contact 1
contact 1 no ack after T    → notify contact 2
escalation criteria met     → raise EmergencyIncident
```

**The grace period must never default to zero.** An ordinary delay is not evidence of
an attack. This is the difference between a useful product and one users disable.

## Arrival

Detected by geofence **or** user confirmation — never a timer alone. On arrival the
session closes and contacts are told the user arrived safely. That closing message is
as important as the alert: it is what makes a contact willing to be one.

## Install-free link (RES-11)

See [`API_SPEC.md`](API_SPEC.md). Opaque ≥128-bit token, expiring, revocable; exposes
only what was authorised; never medical data or evidence. This is the growth loop and
the cross-platform advantage.

## Tests

Deviation within GPS error → no alert · persistent deviation → user first, then policy
· grace default ≥5m · arrival by geofence and by confirmation · offline mid-journey →
`SUSPENDED` shown · battery dies → watchdog notifies contacts · link expiry and
revocation enforced.
