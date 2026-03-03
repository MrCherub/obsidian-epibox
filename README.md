# epibox Obsidian Integration

This script scans your LaTeX files and displays all epibox environments in Obsidian.

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

Create a new note (e.g., `epibox-index.md`) and add this code:

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
└── epibox-index.md   ← The script goes here
```

## Usage

1. Create a `latex` folder in your vault
2. Add LaTeX files with epibox environments:

```latex
\begin{known}
Euler's identity: $e^{i\pi} + 1 = 0$
\end{known}

\begin{question}[title=Question: 202603031000]
What is the Riemann Hypothesis?
\end{question}

\begin{claim}{Church-Turing Thesis}
Every effectively calculable function is computable by a Turing machine.
\end{claim}

\begin{pitfall}
Do not confuse correlation with causation.
\end{pitfall}
```

3. Open `epibox-index.md` - it will show all boxes in tables!

## Zettelkasten Integration

Use timestamps in questions for Zettelkasten:

```latex
\begin{question}[title=Question: 202603031000]
What is the Riemann hypothesis?
\end{question}
```

The timestamp enables unique identification for linking notes.
