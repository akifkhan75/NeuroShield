# Test Matrix

> **Pass/fail criteria are fixed before a test runs and never adjusted after seeing
> results.** That rule is the matrix's whole value.

Sources: `../audit/EDGE_CASES.md` (60 cases) and each spec's "Required tests".

## Gate

| Severity | Requirement to launch                                                |
| -------- | -------------------------------------------------------------------- |
| 🔴       | A passing test. No exceptions                                        |
| 🟠       | A passing test, **or** a documented limitation stated **in-product** |
| 🟡       | A test or a tracked issue                                            |
| ⚪       | Best effort                                                          |

## Layers

| Layer                | Tool               | Scope                                                                  |
| -------------------- | ------------------ | ---------------------------------------------------------------------- |
| `safety-domain` unit | Vitest             | **100% branch coverage, CI-enforced.** Exhaustive (state × event)      |
| API unit             | Vitest             | Modules with `PrismaService` mocked                                    |
| API integration      | Vitest + supertest | Real DB; idempotency, authz, tenancy                                   |
| Client unit          | Jest + jest-expo   | Hooks, screens, native mocks                                           |
| Contract             | Vitest             | `ApiClient` against the real API — catches shape drift the mocks hide  |
| E2E device           | Maestro/Detox      | **Real hardware.** Emulators do not reproduce the failures that matter |
| Chaos                | manual + scripted  | Provider outage, backend down, process kill                            |
| Accessibility        | manual + axe       | Screen reader both platforms, 200% text, contrast, RTL                 |
| Load                 | k6                 | SOS burst, fan-out, spend cap                                          |

## Device minimum

Two Android OEMs × two OS majors — **one with aggressive battery management** — plus
two iPhones × two OS majors. iOS has never been built; that alone blocks launch.

## The failure-mode suite (must all pass)

| #   | Scenario                         | Pass criterion                                                                          |
| --- | -------------------------------- | --------------------------------------------------------------------------------------- |
| F1  | Offline at activation            | `SUSPENDED` shown; nothing claims sent; pre-filled SMS offered; dispatches on reconnect |
| F2  | Location permission denied       | Dispatches with "location unavailable"                                                  |
| F3  | Permission revoked after grant   | Detected on resume; trigger shown disarmed                                              |
| F4  | Battery < 5%                     | Sampling reduced; dispatch prioritised over evidence                                    |
| F5  | Battery dies mid-session         | Server watchdog notifies contacts phone went offline                                    |
| F6  | Phone reboot mid-session         | Android resumes; iOS resumes on launch; watchdog covers the gap                         |
| F7  | Process killed mid-countdown     | Resumes or dispatches. Never silently lost                                              |
| F8  | Push provider outage             | SMS fallback; incident reaches a truthful state                                         |
| F9  | SMS provider failure             | Device-direct path offered                                                              |
| F10 | Backend fully down               | Device-direct SMS works; siren works                                                    |
| F11 | Duplicate requests ×5            | One incident, one attempt set                                                           |
| F12 | Expired journey link             | Access refused; no data leaked                                                          |
| F13 | Cross-account evidence access    | Refused and logged                                                                      |
| F14 | Cross-tenant data access         | Refused. **Zero tolerance**                                                             |
| F15 | DB interruption mid-dispatch     | No partial incident; retry converges                                                    |
| F16 | Interrupted upload               | Resumes; gap reported in the Integrity Report                                           |
| F17 | Device clock wrong by 1h         | Ordering and idempotency correct                                                        |
| F18 | GPS drift / poor accuracy        | Accuracy and age always shown                                                           |
| F19 | Accidental voice trigger         | Countdown absorbs it; repeated cancels reduce sensitivity                               |
| F20 | Conflicting sensor signals       | No escalation without confirmation                                                      |
| F21 | Expired auth token at activation | Dispatches via emergency token                                                          |
| F22 | Spend cap reached                | Remaining attempts `FAILED/SPEND_CAP`; user told                                        |
| F23 | DND / silent mode                | Alert overrides, or the limitation is stated in-app                                     |
| F24 | OS background limits             | Trigger shown as not armed when it is not                                               |
| F25 | All channels fail                | Full-screen `ALL_CHANNELS_FAILED` + dial; pages on-call                                 |

## Simulated emergencies

Run with **informed participants only**. Never create a live emergency that could
involve real responders. Practice Mode (RES-18) is the supported mechanism and
exercises the full pipeline while notifying nobody.
