# Lumo Documentation

Written so that a person — or a model — arriving with no context can be productive
in one read. Everything here was **verified against the code on 2026-10-26**; where
a doc states a limitation, it was confirmed by reading the file it names.

---

## Start here

| Read this                              | If you want to                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [**../CLAUDE.md**](../CLAUDE.md)       | Get oriented fast. Agent context: commands, conventions, and the five facts that trip everyone up. **Read first.** |
| [**FEATURES.md**](FEATURES.md)         | Know what is **real vs mock**. Half the UI is a prototype. Non-negotiable before planning or demoing.              |
| [**KNOWN_ISSUES.md**](KNOWN_ISSUES.md) | See the verified gaps (`KI-1` … `KI-15`), prioritized. Read before building anything.                              |
| [**DEVELOPMENT.md**](DEVELOPMENT.md)   | Get it running locally.                                                                                            |

---

## Reference

| Doc                                                | Contents                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)                 | System diagram, monorepo rationale, module layout, request flow, navigation, state model             |
| [API.md](API.md)                                   | Every endpoint: shapes, validation, errors, and the quirks — plus endpoints the product still needs  |
| [DATABASE.md](DATABASE.md)                         | Prisma schema, delete semantics, the three-spelling enum trap, seeding, the geo migration we need    |
| [MOBILE.md](MOBILE.md)                             | File map, navigation tree, state model, the three sensor hooks, screen-by-screen reality check       |
| [TESTING.md](TESTING.md)                           | Three suites, two runners, the global native mocks, gaps, and a ready-to-use CI workflow             |
| [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md) | Current posture, six threats (incl. _the attacker holds the phone_), hardening checklist, compliance |
| [DEPLOYMENT.md](DEPLOYMENT.md)                     | Why nothing is deployable yet, target topology, a Dockerfile, EAS, store compliance, monitoring      |
| [GLOSSARY.md](GLOSSARY.md)                         | Domain and codebase vocabulary, and the naming drift to watch for                                    |

## Product & direction

| Doc                                                | Contents                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) | Feature matrix vs Google Personal Safety and Life360; where we can win, and where not to compete     |
| [ROADMAP.md](ROADMAP.md)                           | Six phases, dependency-ordered, each with an exit criterion                                          |
| [BRANDING.md](BRANDING.md)                         | The app has **three names**. A recommendation (**Haven**), alternatives, and a full rename checklist |

## Process

| Doc                                | Contents                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, commit style, definition of done, and four rules specific to a safety app |
| [adr/](adr/README.md)              | Architecture Decision Records — _why_ the code looks like this (0001–0006)          |

## Archive

| Doc                                                        | Status                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [archive/PRODUCTION_AUDIT.md](archive/PRODUCTION_AUDIT.md) | ⚠️ **Historical, contains false claims.** Superseded by KNOWN_ISSUES.md               |
| [archive/PROJECT_AUDIT.md](archive/PROJECT_AUDIT.md)       | 📄 Historical migration plan, useful for understanding why things are shaped this way |

---

## The three things to know before you touch anything

1. **The SOS screen contacts nobody.** It says "Emergency Calling…", renders a ring
   of hardcoded contacts and "Notifying Nearby Volunteers…", and performs no call,
   SMS, push or location upload. ([KI-3](KNOWN_ISSUES.md))
2. **There are no real coordinates.** Danger zones are CSS percentages over a JPEG,
   and the server _invents_ the position of every new report. No map SDK, no
   geolocation. ([KI-2](KNOWN_ISSUES.md))
3. **The API URL is a hardcoded LAN IP** (`192.168.100.81:3005`) and the API's own
   port default (3001) disagrees with it. Nothing works on a new machine until you
   fix both. ([KI-1](KNOWN_ISSUES.md))

The parts that _are_ real — the sensor hooks, module boundaries, shared types, AI
fallbacks and test suites — are well built. The gap is that the response half of
the product was built as UI first.

---

## Keeping these honest

This repo already shipped an audit claiming migrations were tracked when they had
never existed. That is the failure mode to avoid.

- Update the relevant doc **in the same PR** as the code — the mapping is in
  [CONTRIBUTING.md](CONTRIBUTING.md#docs-that-must-move-with-the-code).
- When a mock becomes real, [FEATURES.md](FEATURES.md) changes first.
- Verify before asserting. Read the file, then write the sentence.
- Spent twenty minutes learning something non-obvious? Write it down so the next
  person spends zero.
