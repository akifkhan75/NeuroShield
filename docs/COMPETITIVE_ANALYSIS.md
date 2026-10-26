# Competitive Analysis

The stated goal is to beat **Google's Personal Safety app** with "much more and
advanced features". This document says where we stand, where Google is strong, and
where a small independent app can actually win.

> ⚠️ **Verify before relying on this.** The competitor columns are written from
> general product knowledge, not from a live audit, and these apps change often —
> Google's feature availability in particular varies by device, country and
> carrier. Re-check every competitor row against the current product and terms
> before using any of it in marketing, a pitch, or a store listing. The
> Lumo column is verified against this codebase
> ([FEATURES.md](FEATURES.md)).

---

## The honest starting position

Google's Personal Safety app is not primarily a better app — it is a better
_position_. It ships preinstalled on Pixel, hooks into the power button at the OS
level, can run reliably in the background, uses crash-detection models tuned on
sensor data at Google's scale, and on recent Pixels can reach emergency services
over satellite. No third-party app can match those, because they are privileges of
the platform owner, not features.

So "more features" is not the winning strategy. **Being a safety _network_ rather
than a safety _button_** is — and that is a space Google has largely left alone.

---

## Feature matrix

| Capability                   | Google Personal Safety       | Life360       | Lumo today            | Lumo planned                    |
| ---------------------------- | ---------------------------- | ------------- | --------------------- | ------------------------------- |
| **Trigger**                  |                              |               |                       |                                 |
| Hardware-button SOS          | ✅ Power ×5 (OS-level)       | ⚠️ in-app     | ❌                    | ⚠️ widget / volume keys only    |
| In-app SOS button            | ✅                           | ✅            | ⛔ UI only            | ✅                              |
| Shake to trigger             | ❌                           | ❌            | ✅ 2.5 G              | ✅ tunable                      |
| Voice activation             | ⚠️ via Assistant             | ❌            | ✅ custom wake phrase | ✅ on-device wake word          |
| Crash detection              | ✅ Pixel, limited regions    | ✅ paid tier  | ✅ 6 G heuristic      | ✅ + confirmation countdown     |
| Fall detection               | ⚠️ Wear OS                   | ❌            | ❌                    | ✅                              |
| **Response**                 |                              |               |                       |                                 |
| Calls emergency services     | ✅                           | ✅ paid       | ⛔                    | ⚠️ regional, legal review first |
| Alerts trusted contacts      | ✅                           | ✅            | ⛔ stored, unused     | ✅ SMS + push + call            |
| Live location to contacts    | ✅ Emergency Sharing         | ✅ core       | ⛔                    | ✅                              |
| Loud siren                   | ❌                           | ❌            | ⛔ label only         | ✅ offline-capable              |
| Audio/video evidence capture | ⚠️ limited                   | ❌            | ⛔                    | ✅ auto-upload                  |
| Works offline / no data      | ✅ SMS, satellite on Pixel 9 | ⚠️            | ❌                    | ✅ SMS fallback + queue         |
| **Prevention**               |                              |               |                       |                                 |
| Community hazard map         | ❌                           | ⚠️ crime data | 🟨 fake positions     | ✅ real geo                     |
| Proximity warnings           | ❌                           | ❌            | ❌                    | ✅ **differentiator**           |
| Journey/route sharing        | ⚠️ via Maps                  | ✅            | ⛔ fake link          | ✅                              |
| Route deviation alert        | ❌                           | ⚠️            | ❌                    | ✅ **differentiator**           |
| Check-in timer               | ✅ Safety Check              | ❌            | 🟨 in-process only    | ✅ server-side                  |
| Fake call escape tool        | ❌                           | ❌            | ✅ AI-generated       | ✅ **differentiator**           |
| AI safety assistant          | ❌                           | ❌            | 🟨 stateless          | ✅ context-aware                |
| Nearby-helper network        | ❌                           | ❌            | ⛔ label only         | ✅ **differentiator**           |
| Crisis / disaster alerts     | ✅ strong                    | ❌            | ❌                    | ⚠️ via public feeds             |
| Earthquake early warning     | ✅ unique to Google          | ❌            | ❌                    | ❌ not realistic                |
| **Platform**                 |                              |               |                       |                                 |
| Android                      | ✅ preinstalled on Pixel     | ✅            | ✅                    | ✅                              |
| iOS                          | ❌                           | ✅            | ⚠️ untested           | ✅                              |
| Wearables                    | ⚠️ Wear OS                   | ⚠️            | ❌                    | ✅                              |
| Stealth / disguised mode     | ❌                           | ❌            | ❌                    | ✅ **differentiator**           |
| No-ads, no-data-sale pledge  | ⚠️ Google's model            | ❌ ads + data | ✅ by default         | ✅ **positioning**              |

✅ real · 🟨 partial · ⚠️ conditional or indirect · ⛔ mock · ❌ absent

---

## Where we can actually win

### 1. Prevention, not just response

Google's app is a **panic button**: it is excellent once something has gone wrong
and silent before. Nothing in it tells you the underpass ahead has three assault
reports this month. A real community hazard map plus proximity warnings is the
clearest gap in the category — and it is the thing this codebase was already
reaching for, just without coordinates.

### 2. Escape tools before escalation

Most unsafe moments are not 911 moments. They are "this person is following me",
"I need a reason to leave". The AI fake call is genuinely novel, already works,
and is the kind of feature a platform vendor will not build because it does not
fit the emergency framing. Build out the category: fake conversations, a
plausible-excuse generator, a discreet "get me out" flow.

### 3. A human network

"Notifying Nearby Volunteers…" is a label today, but it points at the real
differentiator: a verified responder network — neighbours, campus security,
vetted volunteers — reachable in the gap between "I am uneasy" and "dispatch the
police". Nobody at scale is doing this well. It is also the hardest thing here:
verification, liability and safety-of-responders are all serious problems. Treat
it as a Phase 4 bet, not a Phase 1 feature.

### 4. Stealth and coercion-aware design

Every mainstream safety app assumes the threat is a stranger. Often it is someone
with access to the phone. A disguised icon, a discreet trigger, no visible alert
state, and a panic wipe of local traces — this is a design philosophy a big
vendor is unlikely to adopt, and it serves the users who need the app most. See
T1 in [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md).

### 5. Privacy as the product

Google's safety app is credible but sits inside an advertising company; Life360
has been publicly criticised for selling location data. "Your location is never
sold, never used for ads, never used to train a model, and expires by default" is
a true claim we can make, and it is the one that matters to the exact audience
that buys a safety app.

### 6. Cross-platform and off-Pixel

Google's best features — crash detection, satellite SOS, power-button SOS — are
Pixel-first and region-limited, and there is no iOS version. The addressable
market of "Android users without those features, plus all iPhone users" is most
of the market.

---

## Where we should not compete

Be disciplined about this; each of these burns months for a worse result:

- **Earthquake early warning / crisis alerts.** Google aggregates seismic data
  from millions of handsets. Not reproducible. Integrate public feeds if ever, and
  do not market it.
- **Satellite SOS.** Requires carrier and hardware partnerships.
- **OS-level triggers.** The power button is not available to third-party apps;
  a widget, Quick Settings tile or volume-key gesture is the ceiling.
- **Direct 911/112 dispatch integration.** Heavily regulated, country-specific,
  and a liability minefield. Place a normal phone call instead, and never imply
  dispatch integration you do not have.
- **Crash detection accuracy parity.** A 6 G threshold is a heuristic, not a
  model. It is fine as a _secondary_ signal with a confirmation countdown; do not
  market it as equivalent.

---

## Positioning

> **A safety network, not a panic button.**
> Know the risk before you walk into it; get help from the people nearest you;
> never pay for it with your location data.

Three pillars to build the roadmap and the store listing around:

1. **See it coming** — community hazard map, proximity warnings, route checks
2. **Get out quietly** — fake calls, discreet triggers, stealth mode
3. **Reach real people fast** — contacts, then responders, with location, offline-capable

---

## Credibility rules

A safety app that over-promises is worse than no safety app, and it is also a
legal exposure.

1. Never claim a feature that is a mock. [FEATURES.md](FEATURES.md) is the source
   of truth.
2. The SOS screen must not imply contact has been made until it has, and it must
   show real delivery state (sending / delivered / failed per contact).
3. Never imply emergency-service dispatch integration without one.
4. State regional and device limits plainly, the way Google does for crash
   detection.
5. Publish the failure modes: no signal, phone off, permission denied. Users
   deserve to know the edges of what they are trusting.
