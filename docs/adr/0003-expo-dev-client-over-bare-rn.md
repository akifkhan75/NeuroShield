# ADR-0003: Expo dev client over bare React Native

- **Status:** Accepted
- **Date:** 2026-10-04 (converted), 2026-10-26 (native dev build configured)
- **Deciders:** Project owner

## Context

The app started as bare React Native 0.80.1, with the native `android/` and `ios/`
projects committed and managed by hand. `PROJECT_AUDIT.md` recorded the tension at
the time: the requirements described an "Expo application" while the source was
bare RN, and the plan was to _preserve_ bare RN to avoid breaking changes.

That plan was reversed. Bare RN meant maintaining native build files by hand,
slow onboarding, and no managed build service — on a project whose next phase adds
location, push notifications, background tasks and secure storage, all of which
have well-maintained Expo modules.

The complication: `@react-native-voice/voice` is a native module with **no Expo Go
support**, and voice-triggered SOS is a core feature.

## Decision

We will use the **Expo prebuild / dev-client** workflow: Expo SDK 58 with
`expo-dev-client`, native projects generated from `app.json` rather than
hand-edited, and `expo run:android` / `expo run:ios` to produce a custom dev build.

`useVoiceActivation` checks `NativeModules.Voice` at runtime and **degrades
quietly** when absent, so the app still runs in Expo Go — without voice.

`@react-native-voice/voice@3.2.4` is pinned and **patched** for modern Gradle via
`pnpm.patchedDependencies`.

## Alternatives considered

| Option                       | Why not                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Stay bare RN                 | Hand-maintained native projects; no EAS; every Expo module needs manual linking |
| Fully managed (Expo Go only) | Impossible — the voice module has no Expo Go support                            |
| Drop voice activation        | It is a genuine differentiator and already works                                |
| Fork the voice module        | A 1-file patch is cheaper and reversible                                        |

## Consequences

**Good**

- Permissions, plugins and identity are declared once in `app.json`
- `expo-sensors`, `expo-secure-store`, `expo-location`, `expo-notifications` are all
  available for the roadmap
- EAS Build is a straight path to store builds
- Voice degrades instead of crashing, so Expo Go remains usable for UI work

**Bad / accepted cost**

- Contributors need a native toolchain (Android Studio / Xcode, JDK 17) for the
  full feature set
- The patch is a maintenance liability: bumping `@react-native-voice/voice` without
  regenerating it **breaks the Android build**
- A remote builder must apply `patches/` — the most likely first-EAS-build failure
- A stray top-level `/android/` directory of Gradle output remains from the bare-RN
  era ([KI-13](../KNOWN_ISSUES.md))

**Follow-on**

- No `eas.json` yet ([DEPLOYMENT.md](../DEPLOYMENT.md))
- iOS has not been built or tested

## Revisit when

An on-device wake-word engine replaces `@react-native-voice/voice` — which would
remove the patch, and is wanted anyway for battery and privacy.
