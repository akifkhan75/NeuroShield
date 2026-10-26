# UX Specification

> Design for someone frightened, in the dark, one-handed, possibly crying, possibly
> watched. Every decision below follows from that, not from aesthetics.

## 1. Principles

1. **Stress-first.** Assume degraded attention and fine motor control. No instruction
   will be read.
2. **One action to help.** SOS reachable in one interaction from launch and from a
   widget.
3. **Truth over reassurance.** Show what happened, including failures. A calm lie is
   the worst outcome this product can produce.
4. **Glanceable.** Every state readable in under two seconds.
5. **Discreet by default.** Nothing on screen should reveal to an onlooker that the
   user feels unsafe (T1).
6. **Everyday, not alarming.** The app is opened weekly for journeys, not only in
   crises. Avoid crime-scare framing.

## 2. Emergency screen

**Must:** fill the screen · put the primary action in the lower third (thumb reach) ·
list contacts individually with per-channel state and timestamps · show location with
**age and accuracy** · show a cancellable, announced countdown · offer a one-tap
region-correct dial · show failures as prominently as successes.

**Must not:** use an aggregate success tick · use colour alone for state · require a
multi-step gesture · put a small close button anywhere · render optimistic state.

## 3. Journey flow

Start → configure (destination, ETA, contact, share policy, escalation) → active →
arrive / check-in → close. Each step ≤2 taps; defaults learned from the last journey.

The **active** state must be glanceable: where, who is watching, what happens if the
check-in is missed, and a prominent _I've arrived_.

## 4. States that must exist and are usually forgotten

| State                              | Copy direction                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Offline                            | "You're offline. Lumo will alert your contacts as soon as there's a signal. To get help now, call 15." |
| Trigger not armed (OS restriction) | "Voice activation needs the app open on iPhone." Disabled toggle **with the reason**                   |
| Permission revoked                 | "Lumo can't see your location. Your contacts won't get your position."                                 |
| Stale location                     | "Last known 9:41 PM (12 min ago)" — never a bare pin                                                   |
| Partial delivery                   | "Sent to 2 of 3 · couldn't reach Dad"                                                                  |
| All failed                         | Full-screen, with the dial button                                                                      |
| Practice mode                      | Unmistakable persistent banner: "Practice — nobody will be contacted"                                  |
| Demo/mock feature                  | Labelled as a demo until real                                                                          |

## 5. Onboarding

Ordered by what makes the app actually work:

1. What Lumo does — and what it does not
2. Add 2 trusted contacts → **send consent invites**
3. Permission rationale screens **before** each OS prompt, explaining the why
4. **Run Practice Mode** ← completes activation
5. Optional: triggers, medical profile

Activation = 2 consented contacts + 1 practice run. Onboarding is not complete until
the app can actually help.

## 6. Anti-patterns, explicitly banned

Optimistic UI on the emergency path · aggregate success ticks · a toast for a critical
failure · an enabled toggle for an unsupported capability · a permanent "Voice Guard
Active" badge (reveals state to an onlooker — the current app does this) · crime
statistics as motivation · dark patterns in cancellation or downgrade.
