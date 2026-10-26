# Edge Cases

> **60 cases.** Every row becomes a test in [`../engineering/TEST_MATRIX.md`](../engineering/TEST_MATRIX.md)
> with pass/fail criteria **fixed before the test runs**.
> Cases marked **ARCH** changed the architecture rather than only the test plan —
> they are already reflected in the specs.

Legend — **Sev:** 🔴 someone could be harmed · 🟠 a safety feature silently fails ·
🟡 degraded · ⚪ cosmetic.

---

## A. Trigger integrity (14)

| #   | Case                                                      | Sev         | Required behaviour                                                                                                            |
| --- | --------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A1  | Phone dropped on concrete                                 | 🟠          | Not a crash. Sequence analysis, not peak G. Countdown + confirmation (DET-4)                                                  |
| A2  | Rollercoaster, mountain bike, contact sport               | 🟠          | Sustained high-G patterns must not escalate. Confirmation absorbs it                                                          |
| A3  | Shake while running or on a bus                           | 🟠          | Debounce + sensitivity profile; auto-disable after N cancellations, user informed (DET-3)                                     |
| A4  | Wake word in a loud bar                                   | 🟠          | FP/FN measured at that SNR; published, not assumed (DET-5)                                                                    |
| A5  | Wake word spoken on TV or radio                           | 🟠          | Requires brand variant **and** intent word; measured against broadcast audio                                                  |
| A6  | Non-English or accented speech                            | 🔴          | Measured per language and accent. **If unmeasured for a language, the feature must be disabled there**, not shipped hopefully |
| A7  | Deaf or hard-of-hearing user                              | 🔴 **ARCH** | Voice path is unusable. A manual path must always exist (DET-9) — this is why DET-9 is a requirement, not a feature           |
| A8  | Motor impairment: shake impossible, or involuntary tremor | 🔴 **ARCH** | Shake must be disableable; an alternative trigger must exist; tremor must not fire SOS                                        |
| A9  | Child or pet handling the phone                           | 🟡          | Countdown + confirmation; repeated cancellations reduce sensitivity                                                           |
| A10 | Repeated false alarms burn out contacts                   | 🟠 **ARCH** | Per-contact fatigue tracking; opt-out rate as a guardrail metric; escalation respects it                                      |
| A11 | Two triggers within seconds                               | 🟡 **ARCH** | Idempotency bucket collapses them into one incident                                                                           |
| A12 | Screen-reader user needs SOS                              | 🔴          | Full screen-reader operability of the emergency path (PLAT-2)                                                                 |
| A13 | Gloved or wet hands                                       | 🟡          | Large targets (≥44pt), no precise gestures on the emergency path                                                              |
| A14 | Trigger while the app has never been opened since install | 🟠          | Widget/tile must work pre-first-launch, or be absent — never present-but-dead                                                 |

## B. Degraded device and platform (15)

| #   | Case                                         | Sev         | Required behaviour                                                                                                                                                 |
| --- | -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | No signal at activation                      | 🔴 **ARCH** | `SUSPENDED`; queue locally; state plainly that contacts cannot be reached; offer to dial                                                                           |
| B2  | Airplane mode                                | 🔴          | As B1, plus prompt to disable it                                                                                                                                   |
| B3  | SIM removed or no service                    | 🟠          | Device-direct SMS unavailable; say so rather than failing silently                                                                                                 |
| B4  | Battery below 5%                             | 🟠          | Reduce sampling; prioritise dispatch over evidence; warn the user                                                                                                  |
| B5  | **Battery dies with a session active**       | 🔴 **ARCH** | Server-side watchdog notifies contacts that the phone went offline (RES-15). Silence must never read as safety                                                     |
| B6  | Phone forcibly powered off by an attacker    | 🔴          | Same watchdog path as B5                                                                                                                                           |
| B7  | Storage full during capture                  | 🟠          | Stop capture, keep the incident, report the gap in the Integrity Report                                                                                            |
| B8  | Do Not Disturb / silent / Focus mode         | 🔴          | Emergency alerts must override — requires a critical-alert entitlement on iOS and the correct channel on Android. **If not granted, tell the user the limitation** |
| B9  | OS background limits / Doze kill the service | 🔴 **ARCH** | Per-OS validation in the capability matrix; surface in-app when a trigger is not actually armed                                                                    |
| B10 | Permission revoked after being granted       | 🟠          | Detect on resume; degrade explicitly; never show an armed state for a dead trigger                                                                                 |
| B11 | **Auth token expired mid-emergency**         | 🔴 **ARCH** | Pre-authorised emergency token; SOS never blocks on auth (PLAT-4)                                                                                                  |
| B12 | Device clock wrong by hours                  | 🟡 **ARCH** | Server time authoritative for ordering and idempotency                                                                                                             |
| B13 | GPS drift / poor accuracy                    | 🟠          | Always show accuracy radius and fix age; never present a stale fix as current (RES-10)                                                                             |
| B14 | No GPS fix at all                            | 🟠          | Dispatch anyway with "location unavailable"                                                                                                                        |
| B15 | App process killed mid-countdown             | 🔴          | Countdown resumes on relaunch, or dispatches per policy. Never silently lost                                                                                       |

## C. Adversarial (11)

| #   | Case                                         | Sev         | Required behaviour                                                                                                                                                                                                                                    |
| --- | -------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Attacker forces the user to cancel           | 🔴 **ARCH** | Duress code: UI shows cancelled, incident proceeds silently (DET-8)                                                                                                                                                                                   |
| C2  | Attacker uninstalls the app or deletes media | 🔴          | Chunked upload starts immediately; deletion cannot retract uploaded chunks                                                                                                                                                                            |
| C3  | **The app becomes the stalking tool**        | 🔴 **ARCH** | The inversion most safety apps enable. Periodic consent re-confirmation (PRO-8), always-visible sharing indicator (PRO-7), no hidden or persistent background tracking                                                                                |
| C4  | Abuser has account access                    | 🔴          | Session/device revocation; changing privacy settings must not notify the abuser; discreet settings access                                                                                                                                             |
| C5  | Leaked journey link                          | 🟠          | High-entropy opaque token, expiry, revocation, no medical data or evidence behind it (RES-11)                                                                                                                                                         |
| C6  | SMS-bomb cost attack via repeated SOS        | 🟠 **ARCH** | Hard per-user and per-tenant spend cap (PLAT-5); cap breach is ledgered and shown                                                                                                                                                                     |
| C7  | Malicious or spam hazard reports             | 🟠          | Rate limits, duplicate clustering, confirmation floor, decay (PREV-6)                                                                                                                                                                                 |
| C8  | **Crowdsourced redlining**                   | 🔴 **ARCH** | The documented Citizen/Nextdoor failure. Condition-based not area-based reports, no severity-on-neighbourhood, no demographic fields in the schema at all, mandatory decay, confirmation minimum — the reason `DangerZone` was renamed `HazardReport` |
| C9  | Free-text naming a person or business        | 🟠          | Defamation exposure. Structured types; no free-text identifiers; moderation                                                                                                                                                                           |
| C10 | Deliberate false reporting / swatting        | 🔴          | No unilateral dispatch; user-initiated calls only; audit trail                                                                                                                                                                                        |
| C11 | Compromised admin account                    | 🔴          | MFA for privileged roles, least privilege, full admin audit log                                                                                                                                                                                       |

## D. Delivery (10)

| #   | Case                                      | Sev         | Required behaviour                                                       |
| --- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| D1  | Contact has no app installed              | 🟠 **ARCH** | SMS + install-free browser link. This is also the growth loop (RES-11)   |
| D2  | Contact's number invalid or changed       | 🟠          | `FAILED` → fallback → next contact; prompt the user to fix it afterwards |
| D3  | **All contacts unreachable**              | 🔴          | `ALL_CHANNELS_FAILED` full-screen + one-tap region-correct dial          |
| D4  | **Duplicate SOS on reconnect**            | 🟠 **ARCH** | Device-minted idempotency key; retries converge on one incident          |
| D5  | Offline queue ordering and dedupe         | 🟠          | Replay in original order with true `occurredAt`; dedupe by key           |
| D6  | Push token rotated or stale               | 🟠          | `FAILED` → SMS fallback; token refreshed on next launch                  |
| D7  | Provider outage                           | 🔴          | Fallback chain engages; incident still reaches a truthful state          |
| D8  | Timezone / DST shifts a check-in deadline | 🟡          | Deadlines in UTC with the user's zone stored; DST-boundary tests         |
| D9  | Roaming changes the emergency number      | 🔴 **ARCH** | Resolved from current location, never account country                    |
| D10 | Two acknowledgements race                 | ⚪          | First wins; both recorded; ladder stays halted                           |

## E. Lifecycle, legal, data (10)

| #   | Case                                 | Sev         | Required behaviour                                                                                        |
| --- | ------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------- |
| E1  | Account recovery while in crisis     | 🟠          | SOS must not require login (PLAT-4); recovery never on the emergency path                                 |
| E2  | Minor without parental consent       | 🟠          | Age gate per region profile; verifiable parental consent for family plans                                 |
| E3  | Evidence chain of custody challenged | 🟠          | Integrity Report with hashes, timestamps, gaps, access log — and **never a claim of legal admissibility** |
| E4  | Retention versus privacy             | 🟡          | Per-tier windows from the region profile; auto-delete unless flagged                                      |
| E5  | Law-enforcement data request         | 🟠          | Documented process, user notification where lawful, transparency reporting                                |
| E6  | Erasure must reach backups           | 🟠          | Erasure SLA per profile; propagation verified, not assumed                                                |
| E7  | **A release regresses SOS**          | 🔴 **ARCH** | Staged rollout + server-side kill switch (PLAT-6). A bad release in a safety app _is_ a safety incident   |
| E8  | Backend fully down                   | 🔴          | Device-direct SMS path independent of the backend                                                         |
| E9  | iOS parity — never built or tested   | 🟠          | Blocks launch; real-device matrix required                                                                |
| E10 | Standalone watch SOS with no phone   | 🟡          | Phase 6; until then the watch is a trigger for the phone, stated plainly                                  |

---

## The five that changed the design

If nothing else from this document survives, these must:

1. **C8 — crowdsourced redlining.** Caused the `DangerZone` → `HazardReport` rename
   and removal of area severity. A safety product that teaches users to avoid
   neighbourhoods by reputation has done harm, not good.
2. **C3 — stalkerware inversion.** Our journey-sharing feature is precisely what an
   abuser wants. Consent re-confirmation and visible sharing are mitigations, not
   polish.
3. **B5/B6 — the phone goes dark.** The most common real-world failure, and the one
   where absence of signal is indistinguishable from safety. Needs a server-side
   watchdog, which only exists because this case was written down.
4. **B11 — expired token mid-emergency.** An authentication detail that would
   otherwise silently block an alert. Forced the pre-authorised emergency token.
5. **A7/A8 — users who cannot use voice or shake.** Turned accessibility from a
   Phase 6 feature into a Phase 1 correctness requirement (DET-9, PLAT-2).

## Coverage gate

Launch is blocked unless every 🔴 case has a passing test, and every 🟠 case has
either a passing test or a documented, accepted limitation stated **in-product** —
not only in these docs.
