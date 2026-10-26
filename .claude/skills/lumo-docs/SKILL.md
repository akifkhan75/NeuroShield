---
name: lumo-docs
description: Maintain consistency across Lumo's documentation set. Use after editing anything under docs/, when adding a requirement, when a feature moves from mock to real, or before committing documentation. Keeps requirement IDs aligned across PRD, feature catalog, audit and roadmap, and runs the link and format checks.
---

# Lumo Docs Consistency

## Requirement IDs

Defined once in `docs/product/PRD.md`, prefixed by pillar:
`PREV-` `DET-` `RES-` `PRO-` `REC-` `PLAT-`.

Rules:
- An ID is assigned in the PRD and **never reused or renumbered**
- Every ID appears in **exactly one** phase in `docs/product/ROADMAP.md`
- Every ID in the PRD has testable acceptance criteria
- `docs/audit/FEATURES.md` and `docs/audit/REQUIREMENTS_AUDIT.md` reference IDs, never
  restate requirements

Check: `grep -roE '\b(PREV|DET|RES|PRO|REC|PLAT)-[0-9]+' docs/ | sort -u`

## The honesty rule — the most important one

When a feature moves from mock to real, **`docs/audit/FEATURES.md` changes first**.

This repo already shipped an audit claiming Prisma migrations were tracked when
`prisma/migrations/` had never existed. Never add to that. Verify by reading the file,
then write the sentence.

## Docs that must move with the code

| Changed | Update |
| --- | --- |
| An endpoint | `engineering/API.md`, `specs/API_SPEC.md`, `ApiClient` |
| `schema.prisma` | `engineering/DATABASE.md`, `specs/DATA_MODEL.md`, a migration |
| A screen or navigation | `engineering/MOBILE.md`, `design/UX_SPEC.md` |
| An emergency behaviour | the relevant `specs/` doc **and** `audit/EDGE_CASES.md` |
| Mock → real | `audit/FEATURES.md` first |
| An architectural decision | a new ADR (never edit an accepted one — supersede it) |
| A gap found | `audit/KNOWN_ISSUES.md` |

## Before committing

```bash
# links (expect only the ADR template placeholder)
for f in README.md CLAUDE.md $(find docs -name "*.md"); do d=$(dirname "$f"); \
  grep -oE '\]\([^)#][^)]*\)' "$f" | sed -E 's/^\]\(//; s/\)$//' | grep -v '^http' | \
  while read -r l; do t="${l%%#*}"; [ -z "$t" ] && continue; \
  [ -e "$d/$t" ] || echo "BROKEN: $f -> $l"; done; done

npx prettier --check "README.md" "CLAUDE.md" "docs/**/*.md"
```
