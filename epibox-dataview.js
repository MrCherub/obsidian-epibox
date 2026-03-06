// epibox-dataview.js
// DataviewJS script for Obsidian
// Place this in a .md file in your Obsidian vault to list all epibox environments

const boxTypes = [
  { name: "known", label: "Known" },
  { name: "question", label: "Question" },
  { name: "claim", label: "Claim" },
  { name: "pitfall", label: "Pitfall" },
  { name: "epibox", label: "Note" },
];

const extractBracketValue = (body, key) => {
  const match = body.match(new RegExp(`\\[${key}=([^\\]]+)\\]`));
  return match ? match[1].trim() : null;
};

const stripBracketMeta = body => body.replace(/\[(id|title)=[^\]]+\]/g, '').trim();

const zettelPages = dv
  .pages()
  .where(p => !p.file.path.includes('latex/') && p.file.name !== 'epibox-index' && p.zettel_id);

const zettelById = {};
for (const page of zettelPages) {
  zettelById[String(page.zettel_id)] = page;
}

const results = {};
boxTypes.forEach(box => {
  results[box.name] = [];
});

const latexFiles = dv.pages().where(p => p.file.path.includes('latex/'));

for (const f of latexFiles) {
  const content = await dv.io.load(f.file.path);

  for (const box of boxTypes) {
    const startTag = `\\begin{${box.name}}`;
    const endTag = `\\end{${box.name}}`;

    let pos = 0;
    while ((pos = content.indexOf(startTag, pos)) !== -1) {
      const blockStart = content.indexOf('}', pos);
      const endPos = content.indexOf(endTag, pos);
      if (blockStart === -1 || endPos === -1) break;

      let body = content.substring(blockStart + 1, endPos).trim();
      let id = extractBracketValue(body, 'id');
      let title = extractBracketValue(body, 'title') || box.label;

      if (box.name === 'claim') {
        const claimMatch = content.substring(pos, endPos).match(/\\begin\{claim\}\{([^}]+)\}/);
        if (claimMatch) {
          title = claimMatch[1].trim();
          body = body.replace(/^\{[^}]+\}/, '').trim();
        }
      }

      if (box.name === 'question' && title === box.label) {
        const questionTitle = content.substring(pos, blockStart + 1).match(/\[title=([^\]]+)\]/);
        if (questionTitle) {
          title = questionTitle[1].trim();
        }
      }

      body = stripBracketMeta(body);
      const zettel = id ? zettelById[id] : null;

      results[box.name].push({
        id: id || '',
        title,
        body: body.substring(0, 140),
        source: f.file.link,
        zettel: zettel ? zettel.file.link : '',
      });

      pos = endPos + endTag.length;
    }
  }
}

for (const box of boxTypes) {
  if (results[box.name].length > 0) {
    dv.paragraph(`### ${box.label}`);
    dv.table(
      ['ID', 'Title', 'Excerpt', 'Source', 'Zettel'],
      results[box.name].map(r => [r.id, r.title, r.body, r.source, r.zettel])
    );
  }
}
