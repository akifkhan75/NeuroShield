# ADR-0013: AI emits signals; a deterministic engine decides

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Architecture, Product

## Context

Voice distress detection, audio-event classification and crash detection are the
product's most differentiating and most dangerous features. A false negative makes
someone believe they are protected when they are not. A false positive alarms family,
exposes recordings, and at scale destroys the trust the product depends on.

A model that decides to contact anyone is also unauditable: there is no way to explain
after the fact _why_ help was or was not summoned.

## Decision

> **AI emits signals. A deterministic engine makes decisions. A human confirms.**

1. Models produce a typed `SafetySignal` (label, calibrated confidence, `modelId`,
   context). They never escalate.
2. A deterministic rules engine in `packages/safety-domain` maps signals plus session
   context to an action — fully unit-testable, no ML.
3. **No LLM on the real-time detection path.** LLMs may summarise an incident or
   explain options post-hoc, never classify an emergency.
4. **A single audio-event classification never auto-escalates.** It raises sensitivity
   or asks discreetly. A dropped glass must not summon help.
5. A safeword — a deliberate human act — may escalate immediately.
6. Thresholds are per model, per version, per region, and server-configurable so a bad
   threshold is fixed without a release.
7. **No accuracy claim is published until measured** on a held-out, independently
   reviewed set, with FP/FN reported **per demographic group**. An unmeasured language
   has the feature **disabled**, not shipped hopefully.

## Consequences

**Good** — every escalation is reconstructible to signal + model + version + threshold
· thresholds tunable without a release · a model regression cannot directly cause a
false dispatch · extends ADR-0005's fallback discipline to detection.

**Cost** — more moving parts than an end-to-end classifier · the rules engine needs
maintenance as models change · the measurement gate will delay Phase 3, which is the
intended trade.

## Revisit when

Never for prohibitions 1–4. The threshold mechanism may evolve.
