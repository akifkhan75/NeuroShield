# Naming & Branding

> **Decided 2026-10-26: the product is Lumo.** Rationale, rejected alternatives and
> consequences are in [ADR-0007](adr/0007-name-the-product-lumo.md). The rename has
> been applied across the codebase; this document records what was done, what is
> deliberately left alone, and what is still outstanding.

```
Lumo — your light in the dark.
```

---

## Why Lumo

Four letters, two syllables, one pronunciation (LOO-mo), no spelling ambiguity. A
coined word rather than a dictionary word, so it is actually ownable.

Light is the product's own metaphor, not a borrowed one: `DangerZoneType` already
includes **"Poor Lighting"** as a hazard category, and the planned defense mode
strobes the camera flash. The name describes the product's job instead of armouring
against a threat, which keeps the register warm for a daily-use prevention app
rather than a pure panic button.

**"Hey Lumo"** is also a better wake word than the old `"hey guardian"`: two clean
syllables, distinct consonants, and rare in casual speech — which is what keeps the
false-positive rate low.

The honest cost: the name carries no meaning on its own, so the tagline has to do
that work. See ADR-0007 for the full trade-off and for why **Haven**, **Relay**,
**Sonar** and **Covey** were each rejected. **Orbit** is the fallback.

---

## What the rename covered

Applied and verified — `pnpm build` and all 5 test tasks pass, 44 mobile tests green.

| Area               | Change                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Workspace packages | `@neuroshield/{types,api-client,tsconfig}` → `@lumo/*`; root `neuroshield-monorepo` → `lumo-monorepo`                             |
| Expo identity      | `app.json` name `Lumo`, slug/scheme `lumo`, iOS + Android id `com.lumo.app`, all four permission strings                          |
| Database           | `docker-compose.yml` user `lumo`, password `lumo_password`, db `lumo_db`, volume `lumo_postgres_data`; both `.env.example` files  |
| **Jest**           | `transformIgnorePatterns` → `@lumo/.*` — **the landmine**: miss this and the entire mobile suite fails to boot, not just one test |
| SOS screen         | `InsafeText`/`InsafeSubtext`/`InsafeLogoContainer` → `Lumo*`; rendered text `InSafe` → `Lumo`                                     |
| Onboarding         | `AuthScreen.tsx` headline → "with Lumo"                                                                                           |
| Settings copy      | "Say 'Hey Lumo, emergency!' to trigger an alert."                                                                                 |
| Follow Me          | `insafe.example` → `lumo.example` (still a placeholder — [KI-8](KNOWN_ISSUES.md))                                                 |
| AI identity        | System prompt → "You are Lumo, an AI safety assistant."                                                                           |
| Wake word          | `WAKE_PHRASES` replaced with variant matching — see below                                                                         |
| Tests              | e2e suite name; voice-activation test transcript                                                                                  |
| Docs               | All live docs, plus a new ADR-0007                                                                                                |

### The wake word needed more than a string swap

`Lumo` is coined, so speech-to-text transcribes it inconsistently. Swapping
`"hey guardian emergency"` for `"hey lumo emergency"` would have **silently
disabled hands-free SOS for most users** — a safety regression introduced by a
branding change.

`useVoiceActivation.ts` now matches a **brand variant** _and_ an **intent word** in
the same utterance, and scans **every** alternative the recognizer returns, because
a coined word is often ranked second or third:

```ts
const BRAND_VARIANTS = ["lumo", "loomo", "luma", "lou mo", "loom o"];
const INTENT_WORDS = ["emergency", "help", "sos"];
```

High-collision homophones (`limo`, `lumen`) are deliberately excluded — requiring
both a variant and an intent word would otherwise make "help me get a limo" fire an
SOS.

> **The variant list is unvalidated.** It is a starting point, not a measurement,
> and must be tuned against real on-device transcripts before launch. A wake word
> that fails to fire is a safety defect; one that over-fires causes alert fatigue.
> Tracked in Phase 4 of [ROADMAP.md](ROADMAP.md).

### Deliberately left alone

- **`docs/archive/*`** and **`docs/adr/0001`** keep the old names — they are
  historical records. ADR-0001 carries a superseding note pointing at ADR-0007.
- **`docs/adr/0007`** names the rejected candidates on purpose.

---

## Outstanding

**The code is renamed. The name is not yet owned.** In priority order:

- [ ] **Trademark clearance**, classes **9** (software) and **42** (SaaS), in the
      US and Canada — with counsel, not a web search
- [ ] **App-store search** on both stores in both markets. An existing "Lumo"
      safety app is a bigger practical problem than the register
- [ ] **Domain**: `lumo.app`/`lumo.com` are likely taken — check `getlumo.app`,
      `lumosafety.app`, `lumo.safety`
- [ ] Social handles on the two or three platforms you will actually use
- [ ] Decide whether to keep the tagline **"Safety is Freedom"** (still rendered on
      the SOS screen) or move to **"Your light in the dark"**
- [ ] `expo prebuild --clean` to regenerate the native projects for `com.lumo.app`.
      **This is a new install, not an upgrade** — any build already on a device will
      not update itself
- [ ] Recreate the dev database: `docker compose down -v && docker compose up -d postgres`,
      then `prisma db push && prisma db seed`. The old volume holds `neuroshield_db`
- [ ] Rename the repo directory and the GitHub repo (set up a redirect)
- [ ] Validate the wake-word variant list on real hardware
- [ ] App icon and splash screen — a light/glow mark, not another shield
- [ ] `com.lumo.app` does not map to a domain you control, and is **immutable after
      first store submission**. Change it now if you want `app.lumo.<tld>` instead

If clearance fails, the fallback is **Orbit** — and the cost of switching rises
sharply once a store listing exists.

### Verify the rename

```bash
grep -ri "neuroshield\|insafe\|guardian" \
  --exclude-dir={node_modules,.git,dist,build,.turbo,coverage,.expo,android,ios} .
```

Expected remaining hits only: `docs/archive/*`, `docs/adr/0001`, `docs/adr/0007`,
this file, and the repo's own directory name.

---

## Voice and tone

The app is used by someone anxious, sometimes in the dark, sometimes with seconds to
spare. Copy should be:

- **Calm, never alarming.** "Help is on the way" beats "EMERGENCY ACTIVATED".
- **Concrete.** "Message sent to Mom and 2 others" beats "Notifying your contacts".
  Vagueness is exactly what made the old SOS screen misleading.
- **Honest about failure.** "Couldn't reach Dad — no signal. Retrying." A safety app
  that hides failure is worse than one that admits it.
- **Short.** Nobody reads a paragraph while frightened.
- **Second person, present tense.** "You're sharing your location with 2 people."
- **Never jargon.** No "geofence", no "SOS payload", no "neural".
