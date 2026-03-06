# epibox Obsidian Integration

This project scans your LaTeX files and displays all epibox environments in Obsidian.

There are two files to know about:

- `epibox-dataview.js`: the source DataviewJS logic in plain JavaScript
- `epibox-index.md`: a vault-ready note template that wraps the script in a ````dataviewjs```` block

Obsidian runs the `.md` note, not the standalone `.js` file. The `.js` file exists so the script is easier to version, read, and reuse outside your vault.

## Quick Test - Is DataviewJS Working?

Before using the main script, test if DataviewJS works in your vault:

Create a new note with this code:

````markdown
```dataviewjs
dv.paragraph("DataviewJS is working!")
```
````

If you see "DataviewJS is working!" displayed, DataviewJS is working.

If not:
1. Go to Settings → Community plugins → Install & enable **Dataview**
2. Make sure "Enable JavaScript Queries" is ON in Dataview settings

---

## How it works

1. **Defines box types** - Lists all 5 epibox environments (known, question, claim, pitfall, epibox)

2. **Queries files** - Uses Dataview to find all files in your latex folder

3. **Extracts content** - Finds and extracts content from each box type, including titles

4. **Displays results** - Creates tables grouped by box type, with clickable links to source files

---

## The Script

Fastest path:

1. Copy `epibox-index.md` from this repo into your vault root
2. Open it in Obsidian

If you want to embed the script manually, create a new note (for example `epibox-index.md`) and add this code:

````markdown
```dataviewjs
const boxTypes = [
  { name: "known", label: "Known" },
  { name: "question", label: "Question" },
  { name: "claim", label: "Claim" },
  { name: "pitfall", label: "Pitfall" },
  { name: "epibox", label: "Note" }
];

const results = {};
boxTypes.forEach(b => results[b.name] = []);

const allPages = dv.pages();
const files = allPages.where(p => p.file.path.includes("latex"));

for (let f of files) {
  const content = await dv.io.load(f.file.path);
  
  for (let box of boxTypes) {
    const startTag = "\\begin{" + box.name + "}";
    const endTag = "\\end{" + box.name + "}";
    
    let pos = 0;
    while ((pos = content.indexOf(startTag, pos)) !== -1) {
      const endPos = content.indexOf(endTag, pos);
      if (endPos === -1) break;
      
      let body = content.substring(pos + startTag.length, endPos).trim();
      
      // Extract title from [title=...] if present
      let title = box.label;
      const titleMatch = body.match(/\[title=([^\]]+)\]/);
      if (titleMatch) {
        title = titleMatch[1];
        body = body.replace(/\[title=[^\]]+\]/, "").trim();
      }
      
      // For claim, extract title from {title}
      if (box.name === "claim") {
        const claimMatch = body.match(/\{([^}]+)\}/);
        if (claimMatch) {
          title = claimMatch[1];
          body = body.replace(/\{[^}]+\}/, "").trim();
        }
      }
      
      results[box.name].push({ file: f.file.name, title: title, body: body.substring(0, 100) });
      pos = endPos;
    }
  }
}

for (let box of boxTypes) {
  if (results[box.name].length > 0) {
    dv.paragraph("### " + box.label);
    dv.table(["Title", "Note", "File"], 
      results[box.name].map(r => [r.title, r.body, `[[${r.file}]]`])
    );
  }
}
```
````

## File Structure

Your vault should look like:

```
obsidian-vault/
├── latex/
│   ├── math.md
│   ├── physics.md
│   └── philosophy.md
├── zettels/
└── epibox-index.md   ← The script goes here
```

## Usage

1. Create a `latex` folder in your vault
2. Add LaTeX files with epibox environments:

```latex
\begin{known}
[id=202603031005][title=Known]
Euler's identity: $e^{i\pi} + 1 = 0$
\end{known}

\begin{question}[title=Question: 202603031000]
[id=202603031000]
What is the Riemann Hypothesis?
\end{question}

\begin{claim}{Church-Turing Thesis}
[id=202603031010]
Every effectively calculable function is computable by a Turing machine.
\end{claim}

\begin{pitfall}
[id=202603031020][title=Pitfall]
Do not confuse correlation with causation.
\end{pitfall}
```

3. Open `epibox-index.md` - it will show all boxes in tables!

## Zettelkasten Integration

Use timestamp IDs consistently across both Epibox and Obsidian zettels.

```latex
\begin{question}[title=Question: 202603031000]
[id=202603031000]
What is the Riemann hypothesis?
\end{question}
```

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

The Dataview index matches Epibox `id` values to zettel `zettel_id` values and shows the linked zettel in the table.
