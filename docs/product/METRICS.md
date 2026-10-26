# Metrics

> Downloads are a poor success metric for a safety product. What matters is whether
> people can complete the workflows they depend on.

## North star — verified alert deliveries per month

Help actually delivered. **It is zero today**, which is the honest summary of the
product.

## Activation — the one most products get wrong

> **≥2 consented trusted contacts AND one completed Practice Mode run.**

An installed app with no consented contacts is worth nothing in an emergency. Tying
activation to demonstrated readiness rather than signup is what keeps onboarding
honest — and it is why Practice Mode is step 4 of onboarding.

## Primary

| Metric                                         | What it tells you                    | Target                                 |
| ---------------------------------------------- | ------------------------------------ | -------------------------------------- |
| Alert delivery success (≥1 contact, connected) | The core promise works               | ≥99% in 10s                            |
| Contact acknowledgement rate                   | Whether we reach someone who can act | tracked, **no target until baselined** |
| Time to first acknowledgement                  | Real-world responsiveness            | p50/p95 reported                       |
| Successful safety sessions                     | The everyday workflow is usable      | tracked                                |
| Check-in success rate                          | The session model works              | tracked                                |
| False SOS rate per trigger                     | Whether accidents are creating harm  | published from Phase 3                 |
| Onboarding completion                          | Users can configure it               | tracked                                |
| 30-day retention                               | Lumo became routine                  | tracked                                |

## Guardrails — a breach blocks release

| Metric                             | Threshold                                 |
| ---------------------------------- | ----------------------------------------- |
| Battery drain, monitoring mode     | < 3%/hr                                   |
| Crash-free sessions                | ≥ 99.5%                                   |
| **Contact opt-out rate**           | Watched — the alert-fatigue early warning |
| Notification spend per active user | Under cap                                 |
| Cross-tenant exposure              | Zero                                      |
| `ALL_CHANNELS_FAILED`              | Any occurrence investigated               |

## Business

Free→paid conversion · CAC/LTV by segment · per-alert cost × fan-out × FP rate — the
figure that decides whether the free tier is viable.

## Measurement rules

1. **Delivery is measured separately from sessions.** An uneventful journey is not
   evidence we can respond to a real emergency.
2. **Practice Mode is excluded** from the north star and from spend.
3. **No coordinates or contact details in any event** (PLAT-8).
4. **Acknowledgement gets no invented target.** Inventing one before baselining would
   be the same dishonesty as a fake success tick.
