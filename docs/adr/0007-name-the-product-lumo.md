# ADR-0007: Name the product Lumo

- **Status:** Accepted
- **Date:** 2026-10-26
- **Deciders:** Project owner

## Context

The product carried three names at once:

| Name          | Where                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NeuroShield` | Repo, monorepo package, `app.json`, bundle id `com.neuroshield.app`, DB name, `@neuroshield/*` packages, AI system prompt |
| `InSafe`      | Rendered on the **SOS screen** — the one name a user sees at the most critical moment                                     |
| `guardian`    | The voice wake phrases (`"hey guardian emergency"`)                                                                       |

Three names is a growth problem (nothing to search for), a trust problem (the SOS
screen disagrees with the store listing), and an engineering problem (the wake
word matched no brand).

`NeuroShield` specifically over-claimed: _Neuro_ promises neural technology the app
does not have — the AI is a Gemini text call and the sensors are threshold
heuristics. It also read as B2B security infrastructure rather than a consumer
safety companion, and `+Shield` is the most crowded naming pattern in the category.

Fixing this before store listings, a public API domain and marketing exist costs an
afternoon. After, it costs a migration.

## Decision

The product is **Lumo** — _your light in the dark_.

- Packages: `@lumo/types`, `@lumo/api-client`, `@lumo/tsconfig`
- Identity: `app.json` name/slug/scheme `Lumo`/`lumo`/`lumo`; bundle id `com.lumo.app`
- Database: user `lumo`, database `lumo_db`, volume `lumo_postgres_data`
- Wake word: **"Hey Lumo"**

Selection criteria were, in order: unambiguous pronunciation and spelling (the name
must survive being said aloud by a frightened person, and word of mouth is the
acquisition channel for a safety app); trademark and app-store headroom in the
US/Canada launch markets (a coined word beats a dictionary word); fitness to the
product's nature; and warmth, since this is a daily-use prevention app, not only a
panic button.

Light is the product's own metaphor: `DangerZoneType` already includes
**"Poor Lighting"** as a hazard category, and the planned defense mode strobes the
camera flash.

## Alternatives considered

| Option                                                                                         | Why not                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Haven**                                                                                      | Best instant comprehension ("safe haven" needs no explaining), and the prior recommendation. Rejected for being a dictionary word in the most crowded part of the US store — weak trademark, likely store collisions                  |
| **Relay**                                                                                      | Most on-strategy: the escalation ladder _is_ a relay. Rejected because Relay Financial is Toronto-based — same launch market                                                                                                          |
| **Sonar**                                                                                      | Strong on the prevention differentiator. Rejected as cold, and a detection metaphor sits badly beside privacy-first positioning                                                                                                       |
| **Covey**                                                                                      | Best brand mechanic of any candidate — "add someone to your Covey" would name the trusted-contacts list. **Rejected on pronunciation:** KUV-ee vs KOH-vee is genuinely ambiguous, which is disqualifying for a name said under stress |
| **Orbit**                                                                                      | Fresh, good circle-of-people metaphor. Held as the fallback if Lumo fails clearance                                                                                                                                                   |
| `Guardian`, `Aegis`, `Sentinel`, `Sentry`, `Halo`, `Vigil`, `Ally`, anything `+Safe`/`+Shield` | Crowded, cliché, or already a major brand                                                                                                                                                                                             |

## Consequences

**Good**

- One name everywhere; the SOS screen now matches the store listing
- Coined word → real trademark and domain headroom
- `"Hey Lumo"` is two clean syllables, phonetically distinct, and rare in casual
  speech — a materially lower false-positive rate than `"hey guardian"`

**Bad / accepted cost**

- **The name carries no meaning on its own.** The tagline has to do that work, where
  `Haven` would have been self-explanatory
- **A coined word is harder for speech recognition.** This forced a real
  implementation change (below) and still needs on-device validation
- **Not yet cleared.** Trademark (classes 9 and 42) and app-store search in the US
  and Canada are outstanding. The code is renamed; the name is not yet owned
- `Lumo Energy` (AU) and `Lumo` (Finnish rail) exist in unrelated categories.
  Avoid `Lumos` exactly — Warner Bros. holds that
- The bundle id `com.lumo.app` does not correspond to a domain we control, and is
  **immutable after first store submission**

**Follow-on required**

- `useVoiceActivation` was rewritten: a single literal phrase would have silently
  disabled hands-free SOS, so it now matches a set of phonetic variants **and** an
  intent word, across _every_ recognizer alternative. The variant list is
  **unvalidated** and must be tuned against real device transcripts — Phase 4 of
  [ROADMAP.md](../product/ROADMAP.md). A wake word that fails to fire is a safety defect
- `expo prebuild --clean` must regenerate the native projects for the new
  `com.lumo.app` id. **This is a new install, not an upgrade** — any build already
  on a device will not update
- The repo directory and GitHub repo name are manual steps

## Revisit when

Trademark clearance or app-store search comes back blocked. The fallback is
**Orbit**, and the cost of switching rises sharply once a store listing exists.
