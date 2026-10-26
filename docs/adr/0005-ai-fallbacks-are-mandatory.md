# ADR-0005: Every AI call must have a local fallback

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Project owner

## Context

Three features call Google Gemini: the fake-call script, self-defense tips, and
the safety assistant. Two of the three are reached **during an emergency** — the
defense overlay on the SOS screen, and the fake call used to escape a situation.

A network call can fail for reasons that correlate exactly with the moments this
app is needed: no signal, a dead zone, a captive portal, a rate limit, an expired
key, a malformed model response. "Loading…" forever is not an acceptable answer to
someone who needs a line to say right now.

There is also a practical consequence: requiring an API key would mean a
contributor cannot run the app without one.

## Decision

**Every AI method defines its fallback first and returns it on any failure path**,
and always answers `200`:

```ts
async getFakeCallScript(): Promise<FakeCallScript> {
  const fallbackScript = { callerName: 'Friend', script: [...] };
  if (!this.aiClient) return fallbackScript;          // no API_KEY
  try {
    const parsed = this.parseJsonResponse<FakeCallScript>(response.text || '');
    return parsed || fallbackScript;                   // unparseable
  } catch (error) {
    this.logger.error(...);
    return fallbackScript;                             // threw
  }
}
```

`parseJsonResponse` also strips markdown code fences before parsing, because
models wrap JSON in them.

Consequence by design: **the app is fully usable with no `API_KEY` set.**

## Alternatives considered

| Option                                  | Why not                                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Return 503 and let the client handle it | Pushes the fallback into every caller, and the UI would have to show a failure mid-emergency                           |
| Retry with backoff                      | Adds latency in exactly the moment latency is unaffordable. A retry is fine _behind_ the fallback, never instead of it |
| Require `API_KEY` at boot               | Blocks local development and makes a key a single point of failure for a safety feature                                |
| Cache the last good response            | Better than a constant, and worth adding — but it still needs a cold-start fallback                                    |

## Consequences

**Good**

- No AI feature can hang or fail visibly
- Contributors run the app with no credentials
- The fallbacks are exercised by the test suite

**Bad / accepted cost**

- A silent degradation: the user cannot tell a generated script from the canned
  one. Acceptable here — a generic excuse still works — but it means a broken key
  could go unnoticed in production without monitoring
- The fallback text is hardcoded in the service, so it is not localisable yet

**This principle generalises, and should.** It is the model for Phase 2: SOS needs
an SMS fallback when push fails, and a local siren that needs no network at all.
See [ROADMAP.md](../product/ROADMAP.md).

## Revisit when

Adding a _new_ AI feature — it must follow this pattern. And when monitoring
exists, alert on the fallback rate so a dead key is visible.
