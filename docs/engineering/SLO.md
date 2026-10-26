# Service Level Objectives

> ⚠️ **Internal engineering targets, not safety guarantees.** Lumo must never market
> an SLO as a promise that help will arrive.

| Metric                                                 | Target                    |
| ------------------------------------------------------ | ------------------------- |
| `/sos` availability                                    | ≥ 99.9%                   |
| Emergency workflow acceptance, defined test conditions | ≥ 99.9%                   |
| Duplicate incident creation under retry                | **Zero**                  |
| Notification enqueue latency                           | p95 < 2s                  |
| Initial emergency processing, online                   | p95 < 5s                  |
| Cross-tenant data exposure                             | **Zero tolerated**        |
| Evidence integrity verification                        | 100% of completed uploads |
| Critical-path test coverage                            | ≥ 90%                     |
| `safety-domain` branch coverage                        | **100%**                  |
| Overall automated coverage                             | ≥ 80%                     |

## The distinction that matters

**Accepting an alert within five seconds is not delivering it within five seconds.**
These are measured and reported separately:

| Measure      | Meaning                                                            |
| ------------ | ------------------------------------------------------------------ |
| Acceptance   | Our API durably recorded the incident                              |
| Enqueue      | The attempt is queued                                              |
| Sent         | A provider accepted it                                             |
| Delivered    | A provider confirmed arrival — **where the channel can report it** |
| Acknowledged | A human responded                                                  |

Only the last means help knows. Per-channel ceilings:
[`../specs/DELIVERY_LEDGER.md`](../specs/DELIVERY_LEDGER.md).

An SLO on the first four says nothing about the fifth, which is the one users care
about — so the ack rate is tracked and reported, but carries **no target** until it is
baselined on real traffic. Inventing a target for something we do not yet understand
would be the same category of dishonesty as a fake success tick.
