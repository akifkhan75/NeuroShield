# Observability

> Implements PLAT-8. **An observability pipeline that leaks location is itself a
> safety incident.**

## The privacy constraint comes first

**Never** in logs, metrics labels, traces or error reports: coordinates · phone
numbers · contact names · message bodies · evidence URLs · medical data.

Use `userId`/`incidentId` references instead. Aggregate counts only. Enforced by a
log-scrubbing layer plus review, not by good intentions.

## Dashboards

| Dashboard              | Signals                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **Emergency delivery** | Attempts by channel/state/region · delivery and ack rates · p95 queue→sent · `ALL_CHANNELS_FAILED` count |
| **Trigger health**     | Activations by type · cancellation rate (false-positive proxy) · per-trigger armed-vs-configured gap     |
| **Session health**     | Started/completed/expired · missed check-ins · escalations raised                                        |
| **Platform**           | Trigger availability by OS version/OEM · permission-denied rates · background-kill rates                 |
| **Evidence**           | Upload success · resume rate · verification failures · storage                                           |
| **Cost**               | Spend per user/day · cap hits · cost per incident                                                        |
| **Client**             | Crash-free sessions · battery drain in monitoring mode · app start time                                  |

## Alerts

| Condition                                           | Severity                                |
| --------------------------------------------------- | --------------------------------------- |
| Any `ALL_CHANNELS_FAILED`                           | **Page on-call**                        |
| Delivery success < 95% / 15 min, any channel+region | Page                                    |
| p95 queue→sent > 2s                                 | Page                                    |
| `/sos` error rate > 0.1%                            | Page                                    |
| Terminal `UNKNOWN` rate rising in a region          | Warn — a receipt-capability regression  |
| Spend approaching cap                               | Warn                                    |
| Cancellation rate rising for a trigger              | Warn — threshold drift                  |
| Trigger availability drops after an OS update       | **Page — a platform safety regression** |

## Incident response

`ALL_CHANNELS_FAILED` and `/sos` failures are **Sev-1**: a named on-call owner,
documented runbook, and a post-incident review. The kill switch (PLAT-6) is the first
mitigation lever for a regressed feature.
