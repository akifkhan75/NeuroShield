# Lumo — mobile app

Expo 58 / React Native 0.88 client. **Setup and troubleshooting live in the repo
root docs**, not here — this app cannot be built standalone, it depends on
`@lumo/types` and `@lumo/api-client` being built first.

- **Get it running:** [`../../docs/DEVELOPMENT.md`](../../docs/engineering/DEVELOPMENT.md)
- **Structure, navigation, state model, sensor hooks:** [`../../docs/MOBILE.md`](../../docs/engineering/MOBILE.md)
- **What is real vs mock:** [`../../docs/FEATURES.md`](../../docs/audit/FEATURES.md)
- **Orientation for agents and new contributors:** [`../../CLAUDE.md`](../../CLAUDE.md)

```bash
# from the repo root
pnpm install && pnpm build
pnpm --filter mobile start      # Metro
pnpm --filter mobile android    # needs a custom dev build (voice module)
```

> The previous contents of this file described a pre-monorepo setup — an Express
> `server/` directory, npm, `react-native-cli`, port 3001 — none of which exists
> any more. It was removed rather than updated.
