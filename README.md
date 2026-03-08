

<img width="1449" height="1029" alt="Screenshot 2026-03-07 at 4 19 01 AM" src="https://github.com/user-attachments/assets/79c2e46d-1064-47f7-acf6-675b884dcdc8" />
<img width="1449" height="1029" alt="Screenshot 2026-03-07 at 4 19 32 AM" src="https://github.com/user-attachments/assets/e57ceff4-3e3e-4828-a7f4-ba4c15e36f61" />

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

## How It Connects To Neovim

This workflow is designed to pair with a Neovim setup that creates zettels from the editor instead of manually renaming files in Obsidian.

On the Neovim side:

- TeX snippets generate Epibox blocks with timestamp-based `[id=...]` values
- `:ZettelNew` or `<leader>zn` creates a plain zettel with a human-readable slug filename and a `zettel_id` in frontmatter
- `:ZettelHub` or `<leader>zh` creates a hub zettel where `epibox_id` matches the note's own `zettel_id`
- `:ZettelLink` or `<leader>zl` creates a zettel linked to an existing Epibox ID and type
- `:ZettelBranch` or `<leader>zb` creates a branch note from the current hub, inherits topical tags, links back to the hub, and updates the hub's `## Branch Notes` section automatically

That means the system keeps two things separate on purpose:

- readable filenames for Obsidian graph labels
- stable timestamp IDs for Dataview matching and LaTeX-to-zettel references

So the Obsidian dashboard is not a standalone gimmick. It is the other half of a Neovim-to-Obsidian note pipeline.

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

## Neovim Workflow

A practical editor flow looks like this:

1. Capture a question or note in LaTeX with an Epibox snippet so it gets an `[id=...]`.
2. Use `:ZettelHub` to create the main zettel for that Epibox idea with a readable filename and matching metadata.
3. Open that hub later and use `:ZettelBranch` to grow subnotes without manually wiring the graph.
4. Let `epibox-index.md` show which Epibox entries have connected zettels and which still need work.

This keeps note creation fast in Neovim while preserving enough structure for Dataview and the Obsidian graph.

## Setup

1. Copy `epibox-index.md` into your vault root.
2. Create a `latex/` folder and add notes using the example syntax.
3. Create a `zettels/` folder and add notes with `zettel_id` frontmatter.
4. If you use Neovim, create zettels through `:ZettelNew`, `:ZettelHub`, or `:ZettelLink` so filenames stay readable while IDs remain stable.
5. Open `epibox-index.md` in Obsidian.

## Notes

- The dashboard matches Epibox `id` values to zettel `zettel_id` values.
- Obsidian graph connections still require real wikilinks; metadata matching alone does not create graph edges.
- Timestamp IDs are intentionally kept in metadata because they are the canonical bridge between LaTeX blocks and zettels.
- Human-readable filenames and aliases make the graph usable; IDs keep the pipeline reliable.

## Why IDs Matter

This project uses two different connection mechanisms on purpose:

- `zettel_id` / Epibox `id`: machine-facing canonical identifiers
- `[[wikilinks]]`: human-facing navigation and graph edges

If you only used Obsidian markdown, wikilinks alone could be enough. But this project bridges LaTeX Epibox blocks and Obsidian notes, so stable IDs matter.

The practical split is:

- IDs let Dataview match a LaTeX source block to a zettel even if note titles change
- Wikilinks make notes navigable in Obsidian and create graph edges

So the IDs are not replacing wikilinks. They are the durable key that makes the LaTeX-to-Obsidian connection reliable.

## Screenshot

I can add the rendered screenshot to this README too, but I still need the image as a local file in the repo.
