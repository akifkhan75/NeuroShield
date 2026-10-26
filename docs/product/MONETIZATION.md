# Monetisation

> **The ability to ask for help is never behind a paywall.** An ethics position, and
> the engine of the network effect the map and contacts depend on.

## Tiers

### Lumo Free — forever

Manual SOS · all supported triggers · **3** trusted contacts · Journey Guardian ·
Safety Check · hazard map and reporting · fake call · Practice Mode · siren/strobe ·
offline fallback · emergency profile · incident history · essential resources.

Everything needed to get help is here. Monetise convenience, storage, coordination and
organisational features.

### Lumo Plus — individual

Unlimited contacts · extended journey and location history · route deviation alerts ·
advanced check-in customisation · cloud evidence retention (audio 30d, video 90d) ·
Integrity Report and incident export · proximity awareness and route insights ·
Support Navigator · wearable integrations.

### Lumo Family

Multiple members · shared circles · family journey coordination · a check-in dashboard
· configurable alerts.
**Constraint:** a family plan **never** grants silent tracking. The monitored person
always sees what is shared and can revoke it (T2). This is non-negotiable, including
for a paying parent.

### Lumo Business

Org management · employee safety sessions · configurable escalation · admin dashboard ·
incident reporting · audit logs · RBAC · integration APIs.
**Constraint:** an employer receives only what the agreed safety workflow requires —
never unrestricted personal location history. A university subscription does not give
administrators continuous visibility into students' private journeys.

### Lumo Professional Monitoring — future, Phase 6

Only where a real monitoring partner and response process exist. **A separate
operational product, not a more expensive subscription to the same notification
system.** Selling it without an operations centre behind it would be the most harmful
thing this product could do.

## Illustrative pricing — hypotheses to validate

| Plan       | US             | PK         | Note                                |
| ---------- | -------------- | ---------- | ----------------------------------- |
| Free       | $0             | PKR 0      | —                                   |
| Plus       | $4.99/mo       | PKR 299/mo | **Validate locally; never convert** |
| Family     | $9.99/mo       | PKR 599/mo |                                     |
| Business   | $5/employee/mo | PKR 399    | Likely needs a monthly minimum      |
| Monitoring | quote          | n/a        | Supported markets only              |

Business plans need a floor: onboarding, support, compliance and integration cost money
even at low seat counts.

## Unit economics — model before Phase 2 commits

```
cost per incident = Σ(channel attempts × channel unit cost × fan-out)
                  × (1 + false-positive rate)
```

The figure that decides the free tier's viability. US SMS is materially dearer than PK,
which is why the spend cap (PLAT-5) is an economic requirement, not only abuse control.

## Growth loop

1. User installs → 2. invites a trusted contact → 3. contact gets a **journey link** →
2. **experiences the product with no install** → 5. installs to build their own circle
   → 6. both use journeys.

Stronger than paid acquisition, and it is exactly what the install-free link (RES-11)
exists to enable.
