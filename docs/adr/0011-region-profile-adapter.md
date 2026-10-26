# ADR-0011: Region profiles as the market adapter

- **Status:** Accepted · **Date:** 2026-10-27 · **Deciders:** Product, Architecture

## Context

The launch market is deliberately deferred. Candidates (Pakistan-first validation,
UK, US) differ on emergency numbers, messaging law and registration, audio-recording
consent, privacy regimes, language direction, currency and competitors. Hard-coding
any of them would force a rewrite at the first market change — and getting an
emergency number or a recording-consent rule wrong is a legal and physical-safety
failure, not a bug.

## Decision

One `RegionProfile` resolves everything market-specific: emergency numbers (including
subnational), dial policy, dispatch availability, messaging providers and required
registration, channel capabilities, recording-consent rules, privacy regimes,
retention and erasure SLA, minor-consent age, locale and RTL, currency and pricing,
public alert feeds.

**A market cannot be enabled until its profile is complete and
`legalReviewStatus === 'approved'` — asserted at boot, not enforced by process.**

Emergency numbers and recording-consent rules resolve from **device current
location**, never from the account.

First two profiles: **Pakistan** and **US**, chosen because they differ on nearly
every axis — the only way to prove the abstraction rather than wrap one market's
assumptions.

## Consequences

**Good** — adding a market is configuration plus legal review · a Californian in
Pakistan gets `15`, a Pakistani in Illinois gets all-party recording rules · the
enablement gate makes "we forgot the legal review" structurally impossible.

**Cost** — more upfront work than one hard-coded market · Urdu's RTL requirement pulls
full RTL layout into Phase 1 · two profiles must be maintained before either ships.

**Discovered through this work:** US all-party recording consent in roughly a dozen
states means the app could cause **the user** to commit an offence by recording. That
alone justifies the adapter.

## Revisit when

A third market needs a code branch rather than a profile value — that means the
abstraction has failed and must be fixed before proceeding.
