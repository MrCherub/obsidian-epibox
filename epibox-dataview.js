// epibox-dataview.js
// DataviewJS script for Obsidian
// Place this in a .md file in your Obsidian vault to list all epibox environments

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
