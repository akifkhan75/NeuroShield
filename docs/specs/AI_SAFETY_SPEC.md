# AI Safety Intelligence

> **Safety-critical.** Highest-risk area in the product.
> See [ADR-0013](../adr/0013-ai-never-decides.md), [ADR-0005](../adr/0005-ai-fallbacks-are-mandatory.md).

## The governing principle

> **AI emits signals. A deterministic engine makes decisions. A human confirms.**

No model may escalate an emergency on its own. A false negative makes someone believe
they are protected when they are not. A false positive alarms family, exposes
recordings, and — at scale — burns the trust the whole product depends on.

Three prohibitions, binding:

1. **No single model decides whether a person is in danger.**
2. **No LLM on the real-time detection path.** LLMs may summarise an incident,
   explain options or help with post-incident documentation — after an authorised
   data-sharing step. They may never classify an emergency.
3. **No model output escalates without either a high-confidence deterministic rule or
   a human confirmation.**

---

## 1. Layered architecture

```
                  Microphone / sensors
                           │
                  ┌────────▼────────┐
                  │ Permission &    │  is a session active? did the user
                  │ session gate    │  enable this? is the OS permitting it?
                  └────────┬────────┘
                           │     (no → stop; nothing is captured)
              ┌────────────▼─────────────┐
              │   ON-DEVICE PROCESSING   │   audio never leaves by default
              ├──────────────────────────┤
              │ · wake-word detector     │ → signal(brand, conf)
              │ · distress-phrase match  │ → signal(phrase, conf)
              │ · safeword match         │ → signal(safeword, conf)
              │ · audio-event classifier │ → signal(class, conf)
              │ · sensor sequence model  │ → signal(impact|fall, conf)
              └────────────┬─────────────┘
                           │  SafetySignal[]
              ┌────────────▼─────────────┐
              │  SAFETY DECISION ENGINE  │  deterministic. packages/safety-domain.
              │  rules + thresholds +    │  No model. Fully unit-testable.
              │  session context         │
              └────────────┬─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   below threshold    medium confidence   high confidence
        │                  │                  │
        ▼                  ▼                  ▼
   log only,          discreet user      countdown →
   no UI change       confirmation       escalate per policy
                      ("Are you ok?")
```

### SafetySignal

```ts
interface SafetySignal {
  kind:
    | "wake_word"
    | "distress_phrase"
    | "safeword"
    | "audio_event"
    | "impact"
    | "fall";
  label: string; // 'scream' | 'glass_break' | ...
  confidence: number; // 0..1, calibrated — not a raw logit
  modelId: string; // model + version, for audit
  at: string;
  onDevice: true; // cloud inference requires explicit consent
  context: { sessionActive: boolean; speed?: number; isNight: boolean };
}
```

Every signal is logged with its `modelId`, so any escalation is reconstructible —
which model, which version, what confidence. **Unexplainable escalations are
unacceptable in a safety product.**

---

## 2. The decision engine

Deterministic, in `packages/safety-domain`, no ML. This is what makes behaviour
testable and auditable.

| Signal                                    | Confidence                | Action                                                       |
| ----------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| Safeword                                  | ≥ threshold               | **Escalate immediately.** Deliberate act; countdown may be 0 |
| Wake word + intent word                   | ≥ threshold               | Countdown (10s) → escalate                                   |
| Distress phrase                           | ≥ threshold               | Countdown → escalate                                         |
| Audio event (scream, glass)               | high                      | **Discreet confirmation only.** Never auto-escalates         |
| Audio event                               | medium                    | Log; raise session sensitivity; no UI                        |
| Audio event                               | low                       | Log only                                                     |
| Impact sequence                           | high + plausible context  | Countdown → escalate as advisory                             |
| Impact                                    | high, implausible context | Discreet confirmation                                        |
| Fall                                      | high                      | Countdown → escalate                                         |
| Any combination of 2+ independent signals | —                         | Promote one confidence band                                  |

**Rules:**

- A **single** audio-event classification never escalates on its own. It raises
  sensitivity or asks. This is the most important rule here: a dropped glass must not
  summon help.
- Thresholds are **per model, per version, per region profile**, and configurable
  server-side so a bad threshold can be corrected without a release (PLAT-6).
- Context modulates confidence but never substitutes for it. Night-time does not make
  a sound more dangerous.
- A user's prior cancellations lower sensitivity for that trigger (A3, A10).

---

## 3. Models

No model is committed to before measurement. Candidate approaches and their
constraints:

| Purpose                  | Approach                                                                | Must be                                                        |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| Wake word                | Lightweight on-device keyword spotting, custom-trained for "Hey Lumo"   | On-device, < 50 ms, duty-cycled                                |
| Speech recognition       | Platform on-device ASR where available                                  | On-device by default; cloud only with explicit per-use consent |
| Audio events             | Small on-device classifier (YAMNet-class or similar), limited label set | On-device, batched, not continuous at full rate                |
| Sensor sequence          | Classical sequence model or small net over a sliding window             | On-device, cheap                                               |
| Report clustering / spam | Server-side; may use an LLM                                             | **Never on the emergency path**                                |
| Incident summary         | Server-side LLM, post-incident, authorised                              | Never a detector                                               |

### Why "Hey Lumo" needed engineering, not just a string

`Lumo` is a coined word, so ASR transcribes it inconsistently ("loomo", "luma", "lou
mo"). A single literal match would have **silently disabled hands-free SOS for most
users** — a safety regression introduced by a rename.

Current implementation: match any brand variant **and** an intent word, across
**every** recognizer alternative (a coined word often ranks second or third).
High-collision homophones (`limo`, `lumen`) are deliberately excluded, so "help me
get a limo" cannot fire an SOS.

**The variant list is unvalidated** — a starting point, not a measurement. A custom
wake-word model trained on the actual phrase supersedes it in Phase 3.

---

## 4. Evaluation protocol

**No accuracy claim may be published, internally or externally, until measured on a
held-out, independently reviewed set.** This is a hard gate on Phase 3.

### Required test-set dimensions

| Dimension            | Minimum coverage                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Languages            | Every language in an enabled region profile (English + Urdu for PK/US)                        |
| Accents              | ≥5 per language, including non-native speakers                                                |
| Speaker demographics | Balanced across gender and age; **FP/FN reported per group**                                  |
| Background noise     | Quiet, street, café, bar, vehicle, crowd — measured by SNR band                               |
| Environment          | Indoor, outdoor, vehicle, tunnel                                                              |
| Microphones          | ≥4 device classes including low-end Android                                                   |
| Distance             | 0.5 m, 2 m, 5 m                                                                               |
| Negatives            | TV and radio speech, arguments, sport, music, crying children, slammed doors, dropped objects |

### Reported metrics, per model per version

- FN rate per label (**the dangerous one** — a missed scream)
- FP rate per label per SNR band (**the trust-destroying one**)
- FP rate **per demographic group** — a model that fails on one accent is unshippable
- Latency p50/p95 on the lowest-end supported device
- Battery cost per hour in monitoring mode

### Gates

| Gate            | Requirement                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Per-language    | A language with no measurement **must have the feature disabled**, not shipped hopefully (A6)          |
| Per-demographic | No group may have materially worse FN than the best group                                              |
| Battery         | < 3%/hr in monitoring mode (PRD guardrail)                                                             |
| Explainability  | Every escalation traceable to signal + model + version + threshold                                     |
| Fallback        | Model unavailable or fails → documented degraded behaviour, never a crash and never silent disablement |

---

## 5. Privacy

The claim _"your safety should not require surrendering your privacy"_ is only
credible if the architecture enforces it.

1. **On-device by default.** No continuous cloud audio streaming, ever, as a default.
2. **Cloud inference requires explicit, per-feature, revocable consent**, with a clear
   statement of what is sent and how long it is kept.
3. **Nothing is retained from monitoring.** Wake-word and classifier processing keeps
   no audio. Only a `SafetySignal` (label, confidence, timestamp) persists.
4. **Recording is separate from monitoring**, separately permissioned, with a visible
   indicator (PRO-1). Listening for a wake word is not recording, and the UI must not
   blur the two.
5. **Model inputs and outputs never enter application logs** (PLAT-8).
6. All third-party AI processing documented in [`../engineering/PRIVACY_AND_CONSENT.md`](../engineering/PRIVACY_AND_CONSENT.md).

---

## 6. Platform reality

From [`../engineering/PLATFORM_CAPABILITY_MATRIX.md`](../engineering/PLATFORM_CAPABILITY_MATRIX.md):

- **Continuous background microphone is not available on iOS**, and on Android needs
  a foreground service with a persistent notification.
- Therefore **background voice activation cannot be promised cross-platform.** iOS is
  foreground-only, and the UI must say so rather than showing a dead toggle.
- Doze and Low Power Mode throttle processing; duty-cycling is mandatory.
- The toggle is disabled with an explanation where the platform cannot support it.

---

## 7. Accident detection — a separate system

Must not share a model or thresholds with violence detection. Different physics,
different failure modes, different consequences.

Inputs: accelerometer, gyroscope, speed, movement pattern before the event, optional
wearable.

Flow: detect an anomalous pattern → evaluate the **sequence**, not a single peak →
check context (was the user moving at vehicle speed?) → classify candidate crash or
fall → discreet confirmation → escalate only on no response and per policy → preserve
sensor and location metadata for the incident.

**Current implementation is a single 6 G threshold.** That fires on a dropped phone
and a rollercoaster (A1, A2), and is why DET-4 demands sequence analysis plus
mandatory confirmation.

**Marketing constraint:** advisory only. Never positioned as equivalent to a validated
automotive crash-detection system or a medical alert device.

---

## 8. Required tests

| Scenario                           | Expected                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Dropped phone                      | No escalation without confirmation                                       |
| Rollercoaster / contact sport      | No escalation                                                            |
| Glass dropped in a kitchen         | Signal logged; **no escalation**; at most a discreet prompt              |
| Scream on a TV                     | Measured against broadcast negatives; no escalation from audio alone     |
| Wake word in a bar at low SNR      | FN measured and published, not assumed                                   |
| Wake word in Urdu-accented English | Measured; disabled if unmeasured                                         |
| Safeword spoken                    | Immediate escalation, countdown may be 0                                 |
| Two independent signals            | Confidence promoted one band; still no auto-escalation from audio alone  |
| Model file missing or corrupt      | Documented degraded mode; feature shown as unavailable, not silently off |
| Threshold changed server-side      | Takes effect without a release                                           |
| Any escalation                     | Reconstructible from signal + model + version + threshold                |
| Monitoring for 1 hour              | < 3% battery                                                             |
| iOS, app backgrounded              | Voice monitoring stops; **the UI states this**                           |
