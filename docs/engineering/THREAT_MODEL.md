# Threat Model

> **Safety-critical.** Reviewed every phase. A new feature cannot ship without
> assessing it against T1–T12.

A personal safety app holds the most dangerous data a consumer app can hold: where
someone is, who they would call if frightened, their medical details, and a record of
when they felt unsafe. A breach here does not leak preferences — it can put someone
in physical danger, **including from a person who already has access to their phone.**

That last clause is the one ordinary security reviews miss, and it drives the most
important mitigations in this document.

---

## Assets, ranked by harm if compromised

| Asset                        | Harm                                             |
| ---------------------------- | ------------------------------------------------ |
| Live and historical location | Physical danger; enables stalking                |
| Trusted-contact list         | Maps the user's support network to an attacker   |
| Active session state         | Reveals that the user feels unsafe, and when     |
| Evidence media               | Re-victimisation; destroys the case if deleted   |
| Medical profile              | Sensitive health data                            |
| Duress-code existence        | Reveals the mechanism, destroying its protection |
| Account credentials          | All of the above                                 |

---

## T1 — The attacker holds the phone 🔴

**The most likely and most dangerous scenario, and the one mainstream safety apps
ignore.** For intimate-partner violence, the threat is not a stranger in an alley;
it is someone with the passcode.

Attacks: force the user to cancel the SOS · open the app and see the alert state ·
inspect the contact list · disable triggers · delete evidence · watch the recording
indicator · see "Voice Guard Active" in the header and know the user felt threatened.

| Mitigation                                                    | Requirement | Status  |
| ------------------------------------------------------------- | ----------- | ------- |
| **Duress code** — appears to cancel while escalating silently | DET-8       | Phase 2 |
| Device renders **nothing** about a duress incident            | DET-8       | Phase 2 |
| Biometric/PIN lock on the app                                 | Phase 6     | planned |
| Discreet mode: no visible alert state, no banner              | Phase 6     | planned |
| Settings changes never notify anyone                          | PRO-7       | Phase 1 |
| Evidence uploads immediately; deletion cannot retract chunks  | PRO-2       | Phase 2 |
| Panic wipe of local traces                                    | Phase 6     | planned |

**Design rule:** any UI that reveals the user's safety state is a T1 risk. Today's
dashboard fails this — it displays "Voice Guard Active" permanently. That must
become opt-in and discreet.

## T2 — The app becomes the stalking tool 🔴

Lumo's journey sharing is exactly what an abuser wants: continuous, legitimate-looking
location access. Build the feature and you build the weapon.

| Mitigation                                                              | Requirement  |
| ----------------------------------------------------------------------- | ------------ |
| **Periodic consent re-confirmation** for any long-lived share           | PRO-8        |
| Always-visible indicator of every active share, and who viewed it       | PRO-7        |
| One-action revocation, always reachable                                 | PRO-7        |
| **No persistent background location** — only during an explicit session | PRD non-goal |
| Sharing is per-session and expiring by default, never standing          | RES-11       |
| An installer cannot silently enable sharing — the sharer must act       | PRO-7        |
| Family plans show the monitored person what is shared, always           | PRO-7        |

**Design rule:** there must be **no configuration in which someone's location is
shared without a visible, revocable indicator on their own device.** If a feature
request requires silent tracking, it is refused — including from a paying employer or
parent.

## T3 — Coerced cancellation 🔴

Covered by T1's duress code. Called out separately because it is the moment the
product's promise is tested: a cancel UI that cannot be distinguished from a real one.

## T4 — Stolen or replayed token 🟠

Long-lived tokens over an insecure channel yield full access to profile, contacts and
live location.

Mitigations: HTTPS only, HSTS, no cleartext outside dev · short access tokens +
rotating refresh · `expo-secure-store`, never plain storage · server-side revocation ·
device binding · the **emergency token is narrowly scoped** (dispatch only — it cannot
read contacts or history) and short-lived.

> The emergency token (PLAT-4) exists so SOS never blocks on auth. It is therefore a
> deliberate privilege-escalation surface and must be scoped to exactly one action.

## T5 — Abuser has account access 🔴

Mitigations: device and session list with revocation · re-authentication for
security-sensitive changes · **no notification to other parties when privacy settings
change** (a "your partner changed their sharing settings" email is a safety incident)
· discreet access to privacy settings · account-recovery flows that never leak to a
third party.

## T6 — Leaked journey link 🟠

Mitigations: ≥128 bits of entropy, opaque, unguessable · configurable expiry, default
short · revocable · exposes **only** what was authorised — never medical data,
evidence, or history · no indexing (`noindex`, no referrer leakage) · optional PIN on
the link.

## T7 — Malicious reports and crowdsourced redlining 🔴

Documented failure of comparable products. Crowdsourced crime reporting reliably
produces racialised avoidance maps.

| Mitigation                                                                     | Requirement |
| ------------------------------------------------------------------------------ | ----------- |
| Report a **condition**, never an area verdict — no severity on a neighbourhood | PREV-1      |
| **No demographic fields exist in the schema at all**                           | PREV-6      |
| No free-text naming of individuals or businesses                               | PREV-6      |
| Mandatory decay via `expiresAt`                                                | PREV-1      |
| Confirmation floor before a report influences routing                          | PREV-3      |
| Source and age shown on every report                                           | PREV-2      |
| Verified advisories visually distinct from community reports                   | PREV-2      |
| Rate limits and duplicate clustering                                           | PREV-6      |

**This is why `DangerZone` was renamed `HazardReport`** — the old name encoded the
bias ([ADR-0010](../adr/0010-hazard-reports-replace-danger-zones.md)).

## T8 — Cost-exhaustion / SMS bombing 🟠

Repeated SOS triggers fan out paid SMS. Both a financial and a denial-of-service
attack. Mitigations: hard per-user and per-tenant spend caps (PLAT-5) · rate limits ·
idempotency collapsing retries · anomaly alerting · cap breaches ledgered and shown to
the user, never silently swallowed.

## T9 — Volunteer and responder abuse 🔴

A network that dispatches strangers to vulnerable people can be exploited by the
exact population it attracts.

Mitigations: identity verification before activation · **never dispatch a lone
stranger to an individual** — pairs or verified institutional responders only ·
two-way ratings · no access to the requester's history · liability review and
insurance before any pilot · immediate deactivation on report · a geographically
bounded pilot before any scaling.

**If these cannot be met, the feature does not ship.** A safety app that delivers an
attacker to someone's location has caused the harm it exists to prevent.

## T10 — Insider and infrastructure access 🟠

Mitigations: least privilege · MFA for all privileged roles · full admin audit log ·
field-level encryption for medical data and phone numbers · **no coordinates, phone
numbers or message bodies in logs or metrics labels** (PLAT-8) · short-lived signed
URLs for evidence · separated key management.

## T11 — Denial of a safety feature 🔴

The failure mode where the app is working but help does not come: provider outage ·
backend down · OS suspended the trigger · a release regressed SOS.

Mitigations: fallback chain to device-direct SMS, independent of the backend ·
network-independent siren and strobe (RES-19) · **staged rollout + server-side kill
switch** (PLAT-6) · `ALL_CHANNELS_FAILED` always surfaced with a dial affordance ·
`ALL_CHANNELS_FAILED` pages on-call.

> A bad release in a safety app **is** a safety incident. That is why PLAT-6 is
> release-blocking infrastructure, not tooling.

## T12 — False sense of security 🔴 — _the defining risk_

Not a classical security threat, and the most likely way Lumo causes harm: a user
relies on a capability that does not work, and does not take another action because
they believed they were covered.

| Mitigation                                                        | Requirement       |
| ----------------------------------------------------------------- | ----------------- |
| **No success state without a verified record** — lint rule + test | PLAT-9            |
| Verified Delivery Ledger, per channel, per contact                | RES-3             |
| `ALL_CHANNELS_FAILED` as a full-screen state with a next action   | RES-3             |
| Platform limits stated **in-product**, not only in docs           | capability matrix |
| Practice Mode so users verify the pipeline themselves             | RES-18            |
| Mocks labelled as demos until real                                | Phase 0           |
| Measured FP/FN published, never asserted                          | DET-5/7           |
| Marketing claim list that is prohibited                           | PRD §5            |

**Every other mitigation in this document protects data. This one protects the
user's decision-making, which is the thing that actually keeps them alive.**

---

## Review protocol

A feature cannot ship without answering:

1. Which of T1–T12 does it touch?
2. Does it create any state where someone is tracked without a visible, revocable
   indicator on their own device? _(Instant rejection if yes.)_
3. Does it add a UI state that reveals the user's safety status to someone holding
   the phone?
4. Can it render success without a verified record?
5. What does it do offline, with permission denied, and with an expired token?
6. What does it cost per activation, and what is the cap?
7. Does any copy exceed the platform capability matrix?

Logged in the PR, reviewed by the `emergency-review` skill, and re-reviewed at each
phase gate.
