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

3. **Extracts content** - Uses regex to find and extract content from each box type

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

// Get all pages and filter to latex folder
const allPages = dv.pages();
const files = allPages.where(p => p.file.path.includes("latex"));

for (let f of files) {
  const content = await dv.io.load(f.file.path);
  
  for (let box of boxTypes) {
    // Regex to match from \begin{box} to \end{box}
    const regex = new RegExp("\\\\begin\\{" + box.name + "\\}([\\s\\S]*?)\\\\end\\{" + box.name + "\\}", "g");
    const matches = content.match(regex);
    
    if (matches) {
      for (let match of matches) {
        // Extract body between \begin{...} and \end{...}
        const body = match
          .replace(/\\begin\{[^}]+\}/g, "")
          .replace(/\\end\{[^}]+\}/g, "")
          .trim()
          .substring(0, 100);
        
        results[box.name].push({ file: f.file.name, title: box.label, body: body });
      }
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
│   └── physics.md
└── epibox-index.md   ← The script goes here
```

## Usage

1. Create a `latex` folder in your vault
2. Add LaTeX files with epibox environments:

```latex
\begin{known}
Euler's identity: $e^{i\pi} + 1 = 0$
\end{known}

\begin{question}
What is the Riemann Hypothesis?
\end{question}

\begin{claim}{P vs NP}
Is P equal to NP?
\end{claim}

\begin{pitfall}
Do not confuse correlation with causation.
\end{pitfall}
```

3. Open `epibox-index.md` - it will show all boxes in tables!

## Zettelkasten Integration

For timestamp-based linking:

```latex
\begin{question}
What is the Riemann hypothesis?
\end{question}
```

Use the question content to create links between notes in Obsidian.
