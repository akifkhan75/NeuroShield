# Privacy and Consent

> Implements PRO-5…PRO-8, PLAT-1. Threats: T2, T5, T10 in [`THREAT_MODEL.md`](THREAT_MODEL.md).

## Principles

1. **Collect the minimum.** Continuous background location is a liability and a
   stalkerware vector. Location is captured during an SOS or an explicitly started
   session — **never persistently**.
2. **Short retention by default.** Location history expires in days, per region profile.
3. **Every share is visible and revocable.** The user can always see who can see them,
   and stop it in one action.
4. **No secondary use.** Safety data is never sold, used for advertising, or used to
   train a model. Stated in the store listing — it is also the strongest honest
   differentiator against an ad-funded competitor.
5. **Consent at the moment of use**, not a wall at onboarding.
6. **Export and delete**, reaching backups.
7. **Dangerous-by-design features get extra friction** — sharing, recording and
   stealth mode each need a confirmation and an audit entry.

## Consent is a record, not a flag

`ConsentRecord`: subject · scope · `grantedAt` · `revokedAt` · region profile ·
version. Three kinds:

| Kind                          | From whom                     | Why                                                                                                                                       |
| ----------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Contact consent** (RES-7)   | The **contact**, not the user | A user cannot consent on another person's behalf. Required for messaging in some regimes, and an unprepared contact is an ineffective one |
| **Sharing consent** (PRO-7/8) | The person being shared       | Requires **periodic re-confirmation** — the primary stalkerware mitigation                                                                |
| **Recording consent** (PRO-1) | Per region profile            | In all-party jurisdictions, recording without it can be a **criminal offence committed by the user**                                      |

## Permission rationale

Before every OS prompt, explain the why in one screen: what Lumo does with it, when,
and what stops working without it. Never a wall of prompts at launch.

Background location additionally needs a written justification and demo video for
Play review — budget the time.

## Retention

Per region profile. PK: location 30d, audio 30d, video 90d, incidents 2y, erasure SLA
30d. US: same media windows, incidents 7y, erasure 45d. `expiresAt` is enforced by a
job, not by hope, and erasure propagation to backups is **verified, not assumed**.

## AI privacy

On-device by default · cloud inference needs explicit, per-feature, revocable consent ·
nothing retained from monitoring (only a `SafetySignal`) · recording is separate from
monitoring and separately permissioned · model inputs/outputs never in application
logs. See [`../specs/AI_SAFETY_SPEC.md`](../specs/AI_SAFETY_SPEC.md).

## Compliance posture

| Regime                                            | Applies because                        | Implication                                         |
| ------------------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| GDPR/UK                                           | Location + health = special category   | Explicit consent, DPIA, export/erasure, DPO contact |
| CCPA/CPRA + US state laws                         | Precise geolocation is sensitive       | Opt-out, disclosure, limited use                    |
| COPPA                                             | Family plans may include minors        | Age gate, verifiable parental consent               |
| Pakistan (PECA; data-protection statute evolving) | Local processing                       | Confirm current obligations with counsel            |
| Store policies                                    | Location, microphone, emergency claims | Data Safety / Privacy labels **must match reality** |
| Recording consent                                 | Audio capture                          | All-party states block silent audio                 |

A safety app that over-promises is a legal exposure as well as an ethical one.

## Disclosure

A `SECURITY.md` with a contact address, response-time commitment and safe-harbour
statement is required before launch. None exists today.
