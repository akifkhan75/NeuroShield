# Release Criteria

> The launch gate. **Criteria are fixed before testing and never adjusted after
> seeing results.** Mirrors PRD §8.

## Blocking — all must hold

**Reliability**

- [ ] Delivery target met under load on real Android **and** iOS hardware
- [ ] Every 🔴 case in [`../audit/EDGE_CASES.md`](../audit/EDGE_CASES.md) has a passing test
- [ ] Every 🟠 case has a passing test **or** a limitation stated **in-product**
- [ ] F1–F25 in [`TEST_MATRIX.md`](TEST_MATRIX.md) pass
- [ ] Zero duplicate incidents under retry
- [ ] `safety-domain` at 100% branch coverage

**Honesty**

- [ ] PLAT-9 automated check green — **no screen claims a capability it lacks**
- [ ] No mock presented as a working feature ([`../audit/FEATURES.md`](../audit/FEATURES.md) accurate)
- [ ] Every marketing claim verified against [`PLATFORM_CAPABILITY_MATRIX.md`](PLATFORM_CAPABILITY_MATRIX.md)
- [ ] FP/FN measured and published for every enabled detection model
- [ ] Store data-safety disclosures match actual behaviour

**Safety and privacy**

- [ ] External security review closed, no high findings open
- [ ] [`THREAT_MODEL.md`](THREAT_MODEL.md) reviewed; T1–T12 mitigations verified
- [ ] No configuration exists in which someone is tracked without a visible, revocable indicator on their own device
- [ ] Erasure verified end-to-end, including backups
- [ ] No coordinates, numbers or message bodies in any log or metric

**Accessibility**

- [ ] PLAT-2 floor verified with a screen reader on both platforms
- [ ] Every automatic trigger has a working manual equivalent (DET-9)
- [ ] 200% text scale without loss of function
- [ ] RTL verified on every safety-critical screen, if an enabled profile is RTL

**Operations**

- [ ] Remote kill switch live and **exercised**
- [ ] Staged rollout configured
- [ ] On-call rota with a named owner and runbooks
- [ ] Dashboards and alerts live
- [ ] Spend cap enforced and tested

**Market**

- [ ] Region profiles complete and `legalReviewStatus: approved` for every enabled market
- [ ] Safety copy translated and native-speaker reviewed
- [ ] Messaging registration complete (e.g. US A2P 10DLC)
- [ ] Legal sign-off on recording consent per jurisdiction

**Product**

- [ ] Practice Mode discoverable in onboarding
- [ ] Activation flow produces ≥2 consented contacts
- [ ] Incident response plan documented

## Non-blocking but tracked

Full WCAG AA (PLAT-3) · wearables · professional monitoring · i18n beyond enabled
markets.
