# Safety Check

> Implements RES-13. Google ships Safety Check, so parity is table stakes; the
> differentiators are templates, per-template escalation, and **server-side timers**.

## Templates

| Template         | Interval tolerance | Escalation posture                                 |
| ---------------- | ------------------ | -------------------------------------------------- |
| Walk Home        | short              | fast — minutes matter                              |
| Date Check-In    | medium             | discreet first; the user may not want to be called |
| Ride Check-In    | short              | fast; include vehicle details if provided          |
| Travel Check-In  | long               | tolerant of network loss and timezone change       |
| Outdoor Activity | long               | very tolerant of signal loss; longer grace         |
| Custom Timer     | user-set           | user-set                                           |

A hiking session must tolerate hours without signal. A walk home must not.

## Server-side timers — the critical design point

From [`../engineering/PLATFORM_CAPABILITY_MATRIX.md`](../engineering/PLATFORM_CAPABILITY_MATRIX.md):
Doze, Low Power Mode and process termination make a **locally-scheduled deadline
unreliable on both platforms**, and iOS has no boot-persistence equivalent.

> **Every deadline that must escalate is mirrored server-side.** A local timer is a
> convenience, never the safety mechanism.

This is why RES-13 is Phase 1 rather than an optimisation, and it is what makes
check-ins survive a killed app or a dead battery.

## Offline

Session, deadline and queue persist locally; reminders still fire. The user is told
plainly that **contacts cannot be reached while offline**. On reconnect, missed events
replay with their true `occurredAt` and the delay is stated to recipients.

## Tests

Each template's policy · deadline across a DST boundary · app killed → server
escalates · phone offline at deadline → local reminder + honest messaging, server
escalates · user checks in while offline → reconciled, no spurious escalation ·
timezone change mid-journey.
