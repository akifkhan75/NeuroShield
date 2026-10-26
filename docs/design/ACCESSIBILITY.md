# Accessibility

> **Correctness, not polish.** The app currently has **zero** accessibility
> attributes. Implements PLAT-2 (Phase 1 floor) and PLAT-3 (full WCAG 2.2 AA).

## Why this is a safety requirement

Voice activation is unusable by a deaf or hard-of-hearing user. Shake is unusable by
some users with motor impairments and misfires for users with tremor. If those were
the only triggers, the app would not work for them at all.

> **DET-9 — every automatic trigger must have an equivalent manual path**, usable
> without speech, without fine motor control, and with a screen reader.

That is why accessibility is Phase 1, not Phase 6.

## Phase 1 floor (PLAT-2)

Every safety-critical control:

- [ ] `accessibilityLabel` naming the **action**, not the icon
- [ ] `accessibilityRole` set
- [ ] Contrast ≥ 4.5:1 text, ≥ 3:1 components, **both themes**
- [ ] Target ≥ 44×44 pt
- [ ] Reachable one-handed, lower screen area
- [ ] Full screen-reader operability, **both platforms**
- [ ] Never colour alone for state — icon + text too
- [ ] OS text scaling to 200% without clipping or loss of function
- [ ] Countdowns and state changes announced via a live region
- [ ] RTL correct where a region profile requires it (Urdu does)

## Per-impairment paths

| Need                                                | Must work                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Deaf / HoH                                          | Manual + widget triggers; visual and haptic confirmation; no audio-only state |
| Blind / low vision                                  | Screen reader through the whole emergency path; announced countdown           |
| Motor                                               | Large targets; no gesture chains; shake disableable; tremor must not fire SOS |
| Cognitive                                           | Plain language; no jargon; one decision per screen                            |
| Situational (dark, gloves, wet, moving, one-handed) | Everything above — this is the common case, not the edge                      |

## Phase 6 (PLAT-3)

Full WCAG 2.2 AA audit, externally verified · reduced-motion support · switch-control
and voice-control operability · localisation incl. RTL · a published accessibility
statement.

## Verification

Screen reader on both platforms · 200% text · contrast both themes · one-handed reach
· RTL · automated axe pass on web · **every trigger has a manual equivalent**.
