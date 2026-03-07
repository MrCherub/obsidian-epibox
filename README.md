
<img width="1449" height="1029" alt="Screenshot 2026-03-07 at 1 20 37 AM" src="https://github.com/user-attachments/assets/f63b94e3-cd0e-4325-9d65-cffbd5cbb320" />

# epibox Obsidian Integration

Turn LaTeX `epibox` environments into an Obsidian dashboard powered by DataviewJS.

This repo contains:

- `epibox-index.md`: the vault-ready dashboard note Obsidian actually renders
- `epibox-dataview.js`: the same dashboard logic in standalone JavaScript form
- `examples/latex/*.md`: sample source notes with `epibox` environments
- `examples/zettels/*.md`: sample linked zettels that connect by timestamp ID

## What It Does

- scans notes under `latex/`
- extracts `known`, `question`, `claim`, `pitfall`, and `epibox` blocks
- preserves timestamp IDs such as `202603031000`
- matches Epibox IDs to Obsidian zettels via `zettel_id`
- shows connection health, missing IDs, unlinked entries, and linked notes

The result is a dashboard rather than a raw parser dump.

## Requirements

1. Obsidian
2. Community plugin: `Dataview`
3. Dataview setting: `Enable JavaScript Queries`

Quick test:

````markdown
```dataviewjs
dv.paragraph("DataviewJS is working!")
```
````

## Files

### `epibox-index.md`

Copy this file into the root of your vault. This is the note Obsidian renders.

### `epibox-dataview.js`

This is the same logic as plain JavaScript for easier versioning and reuse.

## Vault Layout

```text
ObsidianVault/
├── latex/
│   ├── cs.md
│   ├── math.md
│   ├── philosophy.md
│   └── physics.md
├── zettels/
│   └── 202603031000-riemann-hypothesis.md
└── epibox-index.md
```

## Example Source Notes

See:

- `examples/latex/cs.md`
- `examples/latex/math.md`
- `examples/latex/philosophy.md`
- `examples/latex/physics.md`

These show the expected Epibox syntax:

```latex
\begin{question}[title=Question: 202603031000]
[id=202603031000]
What is the Riemann Hypothesis?
\end{question}

\begin{claim}{Church-Turing Thesis}
[id=202603031010]
Every effectively calculable function is computable by a Turing machine.
\end{claim}
```

## Example Zettels

See:

- `examples/zettels/202603031000-riemann-hypothesis.md`
- `examples/zettels/202603031015-dark-matter.md`

Example frontmatter:

```markdown
---
zettel_id: 202603031000
aliases: []
tags:
  - zettel
epibox_id: 202603031000
epibox_type: question
---

# Riemann Hypothesis
```

## Dashboard Features

- top summary cards for totals and connection state
- connection health bar
- per-type link rate
- `Needs Zettel` table
- `Linked` table
- `Missing ID` table
- `All Entries` table
- conditional `Zettel` column only when linked notes exist

## Setup

1. Copy `epibox-index.md` into your vault root.
2. Create a `latex/` folder and add notes using the example syntax.
3. Create a `zettels/` folder and add notes with `zettel_id` frontmatter.
4. Open `epibox-index.md` in Obsidian.

## Notes

- The dashboard matches Epibox `id` values to zettel `zettel_id` values.
- Obsidian graph connections still require real wikilinks; metadata matching alone does not create graph edges.
- Timestamp IDs are intentionally kept visible because they are the canonical bridge between LaTeX blocks and zettels.

## Screenshot

I can add the rendered screenshot to this README too, but I still need the image as a local file in the repo.
