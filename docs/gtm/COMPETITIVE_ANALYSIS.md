# Competitive Analysis

> ⚠️ **Verify before relying on this.** Competitor columns are written from published
> product information, not an independent technical test, and availability, features,
> pricing and regional restrictions change frequently. Re-check every competitor row
> against the current product and its terms before using any of it in marketing, a
> pitch, or a store listing. The Lumo column is verified against this codebase
> ([`../audit/FEATURES.md`](../audit/FEATURES.md)).
>
> Market is **deliberately deferred**; first region profiles are **Pakistan + US**
> ([`../specs/REGION_PROFILES.md`](../specs/REGION_PROFILES.md)), so both are covered.

## The honest starting position

Google and Apple are not beatable on their own ground. They own the operating system:
power-button capture, reliable background execution, crash-detection models tuned at
population scale, and on recent hardware satellite SOS. Those are privileges of the
platform owner, not features.

So **"more features" is not the strategy.** Being a safety _network_ rather than a
safety _button_ is — and that space is largely unoccupied.

## Who we are actually against

| Product                                          | What it is                                                                                                                  | Strategic read                                                                                                                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Google Personal Safety**                       | Emergency SOS, Emergency Sharing, Safety Check, emergency video, crash detection, crisis alerts, medical info               | The reference competitor. Strong where the OS helps; several features are device-, region- or carrier-limited, and there is **no iOS version**                                                         |
| **Apple built-in**                               | Emergency SOS, Crash Detection, satellite SOS on supported hardware, Check In in Messages                                   | Excellent UX, ecosystem-bound, device-dependent. Not a standalone app, not cross-platform                                                                                                              |
| **Life360**                                      | Family location sharing, driving and safety features                                                                        | The habit-forming competitor. Has faced public criticism over location-data practices — our privacy position is a direct counter                                                                       |
| **Noonlight**                                    | Safety app backed by a monitoring/dispatch service in supported markets                                                     | Proves that _someone acting on an alert_ is worth far more than a notification — and shows the operational cost of doing it                                                                            |
| **bSafe**                                        | Personal protection, SOS, location sharing, audio/video                                                                     | Validates discreet activation and simple SOS; our edge is making the _journey_ the primary experience                                                                                                  |
| **Hollie Guard**                                 | SOS, location sharing, evidence capture, motion alerts, paid professional monitoring                                        | Closest to our evidence and journey set; our edge is the incident timeline and verified delivery                                                                                                       |
| **UrSafe**                                       | Voice-activated SOS, safewords, A/V streaming, fake calls                                                                   | The closest analogue to our voice concept — which is exactly why measured FP/FN and honest background-listening limits matter                                                                          |
| **PSCA Public Safety / PSCA NextGen** (Pakistan) | Official: emergency assistance, live chat and video, complaint tracking, plus consultation, legal and psychological support | **Critical for a Pakistan launch.** Lumo cannot differentiate there merely by combining SOS + legal + counselling — official services already cover part of it                                         |
| **Citizen** (US)                                 | Real-time incident alerts                                                                                                   | The cautionary tale: crowdsourced incident reporting drifting into racialised avoidance. Our hazard-report model exists to avoid this ([ADR-0010](../adr/0010-hazard-reports-replace-danger-zones.md)) |

### The Pakistan implication

Official apps already occupy the "SOS + legal + counselling" territory. Lumo must
differentiate on **cross-platform journeys, trusted-contact coordination, verified
delivery, usability and privacy** — and should explore being _complementary_ to
official services rather than presenting itself as an alternative dispatch channel.

## Feature matrix

✓ core published capability · ◐ available in certain plans, devices or regions ·
— not a primary advertised capability. **A dash does not prove absence.**

| Capability                       | Google           | Apple             | bSafe / UrSafe   | Life360          | Hollie Guard | PSCA       | **Lumo target**      |
| -------------------------------- | ---------------- | ----------------- | ---------------- | ---------------- | ------------ | ---------- | -------------------- |
| Emergency SOS                    | ✓                | ✓                 | ✓                | ✓                | ✓            | ✓          | ✓                    |
| Trusted-contact alerts           | ✓                | ✓                 | ✓                | ✓                | ✓            | ✓          | ✓                    |
| Live location sharing            | ✓                | ✓                 | ✓                | ✓                | ✓            | ✓          | ✓                    |
| Missed check-in escalation       | ✓                | ✓                 | ◐                | ◐                | ◐            | —          | ✓                    |
| Emergency recording              | ✓                | ◐                 | ◐                | —                | ✓            | ◐          | ✓                    |
| Accident detection               | Pixel-specific   | supported devices | varies           | ◐                | ✓            | —          | ◐ advisory           |
| Fake call                        | —                | —                 | ✓                | —                | —            | —          | ✓                    |
| Voice / safeword activation      | system-dependent | system-dependent  | ✓                | —                | —            | —          | ◐ measured           |
| Professional monitoring          | —                | —                 | market-dependent | market-dependent | paid         | —          | future               |
| Community hazard reporting       | crisis alerts    | public alerts     | varies           | ◐                | —            | complaints | ✓ condition-based    |
| **Browser journey sharing**      | Maps-based       | ecosystem-bound   | varies           | varies           | varies       | —          | **✓ core**           |
| **Verified delivery ledger**     | —                | —                 | —                | —                | —            | —          | **✓ differentiator** |
| **Practice mode**                | —                | —                 | —                | —                | —            | —          | **✓ differentiator** |
| **Duress code**                  | —                | —                 | —                | —                | —            | —          | **✓ differentiator** |
| Post-incident legal / support    | —                | —                 | varies           | —                | —            | ✓          | ✓                    |
| University / employer management | —                | —                 | varies           | family-oriented  | monitoring   | —          | future B2B           |
| Cross-platform safety network    | partial          | Apple-centred     | varies           | ✓                | ✓            | —          | **core objective**   |

**What this says:** several competitors already cover large parts of the concept. A
long feature list will not win. Differentiation has to come from how well the features
work _together_, how clearly the app communicates status, and whether it is trusted.

## Where we can actually win

1. **Verifiable response.** Nobody shows attempted vs delivered vs acknowledged, per
   contact, per channel — every competitor renders a single tick. Our clearest and
   cheapest differentiator ([`../specs/DELIVERY_LEDGER.md`](../specs/DELIVERY_LEDGER.md)).
2. **Install-free journey sharing.** A contact follows a journey in a browser with no
   app. Google cannot match it without owning both platforms; it is also our growth loop.
3. **Prevention, not just response.** Google's app is silent before something goes
   wrong. Condition-based hazard reports with decay and confirmation — never area
   verdicts — is the real gap in the category.
4. **Escape tools before escalation.** Most unsafe moments are not 911 moments. The AI
   fake call already works, and is the kind of feature a platform vendor will not build
   because it does not fit the emergency framing.
5. **Coercion-aware design.** Every mainstream safety app assumes the threat is a
   stranger. A duress code and discreet mode serve the users who need it most (T1).
6. **Privacy as the product.** "Never sold, never used for ads, never used to train a
   model, expires by default" is a true claim an ad-funded competitor cannot make.
7. **Practice Mode.** Nobody lets users verify the pipeline. Trust is the scarce
   resource in this category.

## Where we should not compete

Each burns months for a worse result: earthquake and crisis alerting at platform scale
· satellite SOS · OS-level power-button triggers · unilateral emergency dispatch ·
crash-detection parity with a validated automotive system · professional monitoring
without an operations centre behind it.

## Positioning

> **A safety network, not a panic button.**
> See it coming · get out quietly · reach real people fast — and never pay for it with
> your location data.

Prohibited claims are enumerated in [`POSITIONING.md`](POSITIONING.md) and checked by
the `emergency-review` skill against
[`../engineering/PLATFORM_CAPABILITY_MATRIX.md`](../engineering/PLATFORM_CAPABILITY_MATRIX.md).
