# Evidence Pipeline

> Implements PRO-1…PRO-5, REC-1. **Phase 2.**
> ⚠️ **Blocked on a legal question:** US all-party recording-consent states — see
> [`REGION_PROFILES.md`](REGION_PROFILES.md). Audio capture may not ship in those
> jurisdictions until counsel advises.

## The hard constraint first

In roughly a dozen US states, recording a conversation without every party's consent
can be a **criminal offence — committed by the user**, in a crisis, because our app
started recording.

Therefore: `recording.audioConsent` resolves from **device current location**, not
billing address. In an all-party jurisdiction the default is video-without-audio or an
explicit one-time consent prompt. **Audio must never start silently.**

## Flow

```
authorised trigger
 → create incident ID; record start time + capture metadata
 → write to protected local storage, chunked
 → encrypt before/during upload
 → upload resumable chunks IMMEDIATELY (never wait for the recording to finish —
    an attacker may take the phone)
 → verify each uploaded object
 → generate a manifest: file IDs, timestamps, integrity hashes
 → make available to the authorised user only
 → log every access, download and share
```

**Never on the dispatch critical path.** Evidence must not delay an alert.

## Integrity Report (PRO-3) — the honest differentiator

Incident ID · start/end · upload completion per file · integrity hashes · location
timestamps · access history · **any gaps in recording or connectivity**.

A hash establishes that a file has not changed since a point in the workflow. It does
**not** prove authorship or authenticity in every legal sense.

> **Never claim legal admissibility.** "Evidence Integrity Report" is a defensible
> promise; "court-admissible evidence" is not, and "attackers can never delete your
> evidence" is false.

## Authorisation (PRO-4)

Cross-account and cross-tenant access impossible, tested (F13/F14) · short-lived
signed URLs · every access logged · keys managed separately from data.

## Retention (PRO-5)

Per region profile (PK 30/30/90 days; US 30/30/90, incidents 7 years). Auto-delete
unless flagged. Erasure propagates to backups within the profile's SLA.

## Tests

Upload interrupted → resumes, gap reported · storage full → capture stops, incident
survives, gap reported · **never reports "backed up" before verification** · attacker
deletes the app → uploaded chunks persist · cross-account access refused and logged ·
all-party jurisdiction → no silent audio · retention and erasure verified.
