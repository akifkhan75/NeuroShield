---
name: safety-spec
description: Author or review a safety-critical specification for Lumo. Use when writing or changing anything in docs/specs/, docs/product/PRD.md, or any document describing an emergency behaviour, trigger, notification, escalation or evidence flow. Enforces the four-part contract every advertised emergency action must satisfy, and the prohibited-claims list.
---

# Authoring a Safety Spec

## The four-part contract

Every advertised emergency action must state all four. A spec missing any is
incomplete:

1. **Owner** — which module or person is accountable
2. **Supported platform** — per `docs/engineering/PLATFORM_CAPABILITY_MATRIX.md`,
   including where it does *not* work
3. **Failure path** — what happens offline, permission-denied, token-expired,
   provider-down, and when it simply does not fire
4. **Testable completion condition** — a criterion a test can assert.
   "The screen looks right" is never sufficient

## Acceptance criteria form

> *Given* <precondition>, *when* <action>, *then* <observable, measurable outcome>.

Include the numbers: "within 10s", "≥1 contact", "±accuracy shown". A criterion with
no number is not testable.

## Prohibited claims

Never write, and flag wherever found:
- "Police alerted" / "emergency services notified" — unless a signed integration
  delivered it and `canClaimDispatch` is true
- "AI detects attacks" / any unmeasured accuracy figure
- "Evidence cannot be deleted"
- "Works offline" without stating that an offline phone cannot deliver a remote alert
- "Legally admissible"
- Any success state not backed by a verified record

## Required sections

Why it exists · the behaviour · **the limits** · failure paths · edge cases
cross-referenced to `docs/audit/EDGE_CASES.md` · required tests · observability.

The **limits** section is mandatory and is usually the most valuable part. If a spec
has no limits section, it is marketing.

## Before finishing
- Cross-reference requirement IDs (`PREV-`/`DET-`/`RES-`/`PRO-`/`REC-`/`PLAT-`) from
  the PRD; every ID appears in exactly one phase
- Run the link and Prettier checks (see the `lumo-docs` skill)
