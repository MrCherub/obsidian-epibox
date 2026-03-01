# epibox Obsidian Integration

This directory contains tools for using epibox with Obsidian.

## Option 1: DataviewJS Script

Create a new note in Obsidian and add this inline DataviewJS code:

````javascript
```dataviewjs
const boxTypes = [
  { name: "known", color: "🟢", label: "Known" },
  { name: "unclear", color: "🟠", label: "Unclear" },
  { name: "question", color: "🔴", label: "Question" },
  { name: "claim", color: "🔵", label: "Claim" },
  { name: "pitfall", color: "🟣", label: "Pitfall" },
  { name: "epibox", color: "⚫", label: "Note" }
];

const patterns = {
  known: /\\begin{known}(?:\[([^\]]*)\])?([\s\S]*?)\\end{known}/g,
  unclear: /\\begin{unclear}(?:\[([^\]]*)\])?([\s\S]*?)\\end{unclear}/g,
  question: /\\begin{question}(?:\[([^\]]*)\])?([\s\S]*?)\\end{question}/g,
  claim: /\\begin{claim}\{([^}]*)\}(?:\[([^\]]*)\])?([\s\S]*?)\\end{claim}/g,
  pitfall: /\\begin{pitfall}(?:\[([^\]]*)\])?([\s\S]*?)\\end{pitfall}/g,
  epibox: /\\begin{epibox}(?:\[([^\]]*)\])?([\s\S]*?)\\end{epibox}/g
};

const results = {};
boxTypes.forEach(b => results[b.name] = []);

const files = dv.pages('"path/to/your/latex/notes"');
for (const file of files) {
  const content = await app.vault.read(file.file);
  for (const box of boxTypes) {
    const regex = new RegExp(patterns[box.name].source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[1]?.trim() || (box.name === "claim" ? match[1] : "");
      const body = match[match.length-1].trim().replace(/\\item/g, '').replace(/\\/g, '').substring(0, 150);
      results[box.name].push({ file: file.file.name, path: file.file.path, title, body });
    }
  }
}

for (const box of boxTypes) {
  if (results[box.name].length > 0) {
    dv.heading(3, `${box.color} ${box.label}`);
    dv.table(["Title", "Note", "File"], 
      results[box.name].map(r => [
        r.title || box.label, 
        r.body, 
        `[[${r.file}]]`
      ])
    );
  }
}
```
````

## Option 2: Simple Dataview Query

If you just want to link to your LaTeX files:

````dataview
TABLE WITHOUT ID
  file.link as "LaTeX Notes",
  dateformat(file.mday, "yyyy-MM-dd") as "Modified"
FROM "path/to/your/latex/notes"
SORT file.mday DESC
````

## Option 3: Obsidian Shell Commands

Add a shell command to compile LaTeX and auto-refresh:

1. Install [Obsidian Shell Commands](https://github.com/Taitava/obsidian-shell-commands)
2. Create command:
   - Name: "Compile LaTeX"
   - Command: `cd /path/to/latex && pdflatex -interaction=nonstopmode %.tex`

## File Structure Example

```
obsidian-vault/
├── latex/           # Symlink or folder for .tex files
│   ├── notes/
│   │   ├── math.tex
│   │   ├── physics.tex
│   └── index.md     # Dataview script here
```

## Zettelkasten Integration

For timestamp-based linking:

```latex
\begin{question}[title=Question: 202602281530]
    What is the Riemann hypothesis?
\end{question}
```

Use the timestamp `202602281530` to create links between notes:
- `[[202602281530]]` - Links to that specific question
- In Obsidian: create note named `202602281530.md` for detailed answers
