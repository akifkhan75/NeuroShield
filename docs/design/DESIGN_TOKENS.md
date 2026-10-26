# Design Tokens

> Prerequisite for dark mode and for the contrast guarantees in
> [`ACCESSIBILITY.md`](ACCESSIBILITY.md). There is no token file today — colours are
> loose Tailwind hexes inherited from the web original, and `app.json` pins
> `userInterfaceStyle: "light"`.

## Semantic, not literal

Tokens are named by **role**, never by colour, so a theme change is a token change:

```
color.bg.default / raised / overlay
color.text.primary / secondary / inverse
color.action.primary / onPrimary
color.emergency.default / onEmergency      ← SOS
color.state.success / warning / danger / info / unknown
color.hazard.lighting / obstruction / reported
color.border.default / strong
```

`color.state.unknown` exists because the Delivery Ledger has an `UNKNOWN` state that
must be visually distinct from both success and failure. A design system without it
forces a lie.

## Current values to migrate

| Role                     | Current hex           |
| ------------------------ | --------------------- |
| action.primary           | `#4f46e5`             |
| emergency / danger       | `#dc2626` / `#ef4444` |
| warning                  | `#f59e0b`             |
| info                     | `#3b82f6`             |
| success                  | `#16a34a`             |
| text.primary / secondary | `#1f2937` / `#4b5563` |
| bg.default / raised      | `#ffffff` / `#f3f4f6` |

## Constraints

- Every text pair ≥ **4.5:1**, every UI component ≥ **3:1**, verified in **both**
  themes. A token that fails contrast is not shipped
- **Never colour alone** for state — always paired with an icon and text
- Emergency red is reserved for the emergency path. Using it for a destructive
  settings action trains users to ignore it
- Type scale respects OS scaling to 200% without clipping
- Spacing on a 4pt grid; minimum touch target 44pt
- RTL-safe: logical properties (`start`/`end`), never `left`/`right`

## Dark mode

Blocked on this file. Night-time is the product's primary context, so a true dark
theme — not an inverted light one — matters more here than in most apps.
