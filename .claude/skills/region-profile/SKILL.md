---
name: region-profile
description: Add or validate a Lumo market region profile. Use when adding a country, changing emergency numbers, SMS or voice providers, recording-consent rules, retention windows, pricing or locale, or when anything market-specific appears in code. Blocks enabling a market whose profile is incomplete or not legally reviewed.
---

# Region Profiles

Spec: `docs/specs/REGION_PROFILES.md`. Reference profiles: **PK** and **US**.

## The rule

**No market-specific value may be hard-coded anywhere.** If you are about to write a
country check, an emergency number, a currency, or a consent string inline — stop and
put it in the profile.

A market cannot be enabled until the profile is complete **and**
`legalReviewStatus === 'approved'`. Enforced at boot, not by process.

## Resolution order

1. Device current location ← **emergency numbers and recording-consent rules resolve
   from here, never from the account**
2. Last known location, with age surfaced
3. SIM / network country
4. Account country
5. Global safe default

A Californian in Pakistan must get `15`. A Pakistani in Illinois must get all-party
recording rules. When location is unknown, show account-country numbers **labelled
with that uncertainty**.

## The six fields that are fatal to get wrong

- `emergency.numbers` — including subnational variants (PK `1122` is Punjab-only)
- `emergency.canClaimDispatch` — default `false`; gates all dispatch copy
- `messaging.recipientConsentRequired` — consent from the **contact**, not the user
- `recording.audioConsent` — in all-party jurisdictions, recording without consent can
  be a **criminal offence committed by the user**
- `privacy.locationIsSensitiveCategory` — changes legal basis and opt-out machinery
- `locale.rtl` — Urdu is RTL; a clipped countdown is a functional failure

## Checklist before `status: approved`

Numbers verified incl. subnational · dispatch claim set · provider contracted and
registered (US needs A2P 10DLC before any send) · channel capability matrix populated
· recording-consent rules confirmed incl. subnational overrides · privacy regimes,
retention and erasure SLA set · minor-consent age and parental flow · safety copy
translated **and native-speaker reviewed** · RTL verified on every safety-critical
screen · pricing validated locally, never converted · alert feeds confirmed available
· `legalReviewStatus: approved` with reviewer and date · store disclosures updated ·
failure tests re-run on local networks and devices.

## Never
- Convert pricing between markets
- Assume SMS delivery receipts exist
- Assume an emergency exception to recording consent — ask counsel
- Imply official dispatch without a signed agreement
