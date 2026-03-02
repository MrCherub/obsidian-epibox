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

If you see "DataviewJS is working!" displayed (not just as text), DataviewJS is working.

If not:
1. Go to Settings → Community plugins → Install & enable **Dataview**
2. Make sure "Enable JavaScript Queries" is ON in Dataview settings

---

## What does the script do?

1. **Defines box types** - Lists all 6 epibox environments (known, unclear, question, claim, pitfall, epibox) with colors and icons

2. **Creates regex patterns** - Each box type has a pattern to find it in LaTeX files

3. **Queries LaTeX files** - Uses Dataview to find all `.tex` files in your specified folder

4. **Extracts content** - For each file, searches for all box types and extracts:
   - Title (from the optional argument like `[title=Question: 123]`)
   - Body text (the content inside the environment)

5. **Displays results** - Creates a table grouped by box type, showing title, preview, and link to the file

In short: It scans your LaTeX files and builds an index of all your epistemic boxes so you can browse them in Obsidian.

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
