// epibox-dataview.js
// DataviewJS script for Obsidian
// Place this in a .md file in your Obsidian vault to list all epibox environments

const latexFolder = "latex/"; // Adjust to your LaTeX files folder

const boxTypes = [
  { name: "known", color: "green", icon: "✓" },
  { name: "unclear", color: "orange", icon: "?" },
  { name: "question", color: "red", icon: "❓" },
  { name: "claim", color: "blue", icon: "💡" },
  { name: "pitfall", color: "purple", icon: "⚠" },
  { name: "epibox", color: "gray", icon: "📝" }
];

// Regex patterns for each box type
const patterns = {
  known: /\\begin{known}(?:\[([^\]]*)\])?([\s\S]*?)\\end{known}/g,
  unclear: /\\begin{unclear}(?:\[([^\]]*)\])?([\s\S]*?)\\end{unclear}/g,
  question: /\\begin{question}(?:\[([^\]]*)\])?([\s\S]*?)\\end{question}/g,
  claim: /\\begin{claim}\{([^}]*)\}(?:\[([^\]]*)\])?([\s\S]*?)\\end{claim}/g,
  pitfall: /\\begin{pitfall}(?:\[([^\]]*)\])?([\s\S]*?)\\end{pitfall}/g,
  epibox: /\\begin{epibox}(?:\[([^\]]*)\])?([\s\S]*?)\\end{epibox}/g
};

const results = { known: [], unclear: [], question: [], claim: [], pitfall: [], epibox: [] };

// Query all LaTeX files
const files = dv.pages(`"${latexFolder}"`).where(p => p.file.name.endsWith(".tex"));

for (const file of files) {
  const content = await app.vault.read(file.file);
  
  // Extract all types
  for (const [type, pattern] of Object.entries(patterns)) {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[1] || "";
      const claimTitle = match[1] || "";
      const body = match[match.length - 1].trim().substring(0, 200);
      
      results[type].push({
        file: file.file.name,
        path: file.file.path,
        title: type === "claim" ? claimTitle : title,
        body: body.replace(/\\item/g, '').replace(/\\/g, '').trim()
      });
    }
  }
}

// Display results by type
for (const box of boxTypes) {
  if (results[box.name].length > 0) {
    dv.heading(2, `${box.icon} ${box.name.charAt(0).toUpperCase() + box.name.slice(1)}`);
    
    const tableData = results[box.name].map(b => [
      `[${b.title || box.name}](${b.path})`,
      b.body.substring(0, 100) + (b.body.length > 100 ? "..." : "")
    ]);
    
    dv.table(["Title", "Preview"], tableData);
  }
}
