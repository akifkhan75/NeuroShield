---
name: a11y-safety
description: Accessibility review for Lumo's safety-critical UI. Use when touching any emergency screen, trigger control, SOS button, bottom navigation, incident view, or onboarding. Enforces the Phase 1 accessibility floor and the rule that every automatic trigger must have a manual equivalent.
---

# Accessibility on the Safety Path

Specs: `docs/design/ACCESSIBILITY.md`, `docs/design/UX_SPEC.md`.

Accessibility here is **correctness, not polish**. Voice activation is unusable by a
deaf or hard-of-hearing user; shake is unusable by some users with motor impairments
and misfires for users with tremor. If those were the only triggers, the app would
simply not work for them.

The app currently has **zero** accessibility attributes.

## The non-negotiable rule

> **Every automatic trigger must have an equivalent manual path** usable without
> speech, without fine motor control, and with a screen reader. (DET-9)

## Phase 1 floor (PLAT-2)

Every safety-critical control:
- `accessibilityLabel` describing the **action**, not the icon — "Send SOS alert",
  not "red button"
- `accessibilityRole` set
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components, **verified in both themes**
- Touch target ≥ 44×44 pt
- Reachable one-handed in the lower screen area
- Operable with a screen reader, start to finish, on **both** platforms
- Never colour alone to convey state — pair with icon and text
- Respects OS text scaling up to 200% without clipping or loss of function

## Stress-first design

The user may be frightened, in the dark, one-handed, moving, or crying.
- No multi-step gesture on the emergency path
- No precision targets, no small close buttons
- No time-limited interaction except a cancellable countdown, which is announced
- Haptic + visual + audible confirmation of state changes, where permitted
- Announce countdowns and state changes to the screen reader with a live region

## Checks before merge
- Screen-reader walkthrough of the changed flow, on both platforms
- 200% text scale
- Contrast verified, both themes
- One-handed reachability
- RTL layout if any enabled region profile is RTL (Urdu is)
- Every trigger has a manual equivalent
