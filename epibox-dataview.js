// epibox-dataview.js
// Standalone version of the epibox dashboard logic used by epibox-index.md

const LATEX_FOLDER = 'latex/';
const INDEX_NOTE = 'epibox-index';
const EXCERPT_LENGTH = 140;

const boxTypes = [
  { name: 'known', label: 'Known', icon: '●' },
  { name: 'question', label: 'Question', icon: '?' },
  { name: 'claim', label: 'Claim', icon: '◆' },
  { name: 'pitfall', label: 'Pitfall', icon: '!' },
  { name: 'epibox', label: 'Note', icon: '✦' },
];

const TYPE_ICON = Object.fromEntries(boxTypes.map(box => [box.label, box.icon]));
const TYPE_LABEL = Object.fromEntries(boxTypes.map(box => [box.name, box.label]));

const extractBracketValue = (body, key) => {
  const match = body.match(new RegExp(`\\[${key}=([^\\]]+)\\]`));
  return match ? match[1].trim() : null;
};

const stripBracketMeta = body => body.replace(/\[(id|title)=[^\]]+\]/g, '').trim();
const compactQuestionTitle = title => title.replace(/^Question:\s*/i, '').trim();
const compareByNewestId = (a, b) => String(b.id || '').localeCompare(String(a.id || ''));
const fmtId = id => (id ? `\`${id}\`` : '—');
const excerptFor = text => (text.length > EXCERPT_LENGTH ? `${text.substring(0, EXCERPT_LENGTH)}…` : text);

const ratioBar = (current, total, width = 10) => {
  if (!total) return '□□□□□□□□□□';
  const filled = Math.max(0, Math.min(width, Math.round((current / total) * width)));
  return '■'.repeat(filled) + '□'.repeat(width - filled);
};

const connectionBadge = row => {
  if (!row.id) return '<span style="color:#f59e0b; font-weight:600;">Missing ID</span>';
  if (row.hasZettel) return '<span style="color:#22c55e; font-weight:700;">Linked</span>';
  return '<span style="color:#f97316; font-weight:700;">Needs Zettel</span>';
};

const linkBridge = row => {
  if (!row.hasZettel) return '';
  return `<span style="color:#67e8f9; font-weight:600;">${row.id} ↔ zettel</span>`;
};

const zettelPages = dv
  .pages()
  .where(p => !p.file.path.includes(LATEX_FOLDER) && p.file.name !== INDEX_NOTE && p.zettel_id);

const zettelById = {};
for (const page of zettelPages) {
  zettelById[String(page.zettel_id)] = page;
}

const results = {};
boxTypes.forEach(box => {
  results[box.name] = [];
});

const latexFiles = dv.pages().where(p => p.file.path.includes(LATEX_FOLDER));

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
        if (questionTitle) title = questionTitle[1].trim();
      }

      body = stripBracketMeta(body);
      if (box.name === 'question') title = compactQuestionTitle(title);

      const zettel = id ? zettelById[id] : null;
      results[box.name].push({
        type: TYPE_LABEL[box.name],
        id: id || '',
        title,
        excerpt: excerptFor(body),
        source: f.file.link,
        zettel: zettel ? zettel.file.link : '',
        hasZettel: Boolean(zettel),
      });

      pos = endPos + endTag.length;
    }
  }
}

const allEntries = Object.values(results).flat().sort(compareByNewestId);
const linkedEntries = allEntries.filter(entry => entry.hasZettel);
const unlinkedEntries = allEntries.filter(entry => entry.id && !entry.hasZettel);
const missingIdEntries = allEntries.filter(entry => !entry.id);

const renderCards = () => {
  const linked = linkedEntries.length;
  const total = allEntries.length;
  const cards = [
    ['Total Entries', total, '#93c5fd'],
    ['Linked Zettels', linked, '#86efac'],
    ['Needs Zettel', unlinkedEntries.length, '#fdba74'],
    ['Missing IDs', missingIdEntries.length, '#fcd34d'],
  ];

  const html = cards
    .map(
      ([label, value, color]) => `
    <div style="flex:1; min-width:140px; border:1px solid var(--background-modifier-border); border-radius:12px; padding:12px 14px; background:linear-gradient(180deg, var(--background-secondary), var(--background-primary));">
      <div style="font-size:0.8rem; opacity:0.8; margin-bottom:6px;">${label}</div>
      <div style="font-size:1.5rem; font-weight:700; color:${color};">${value}</div>
    </div>`
    )
    .join('');

  dv.paragraph(`<div style="display:flex; gap:10px; flex-wrap:wrap; margin:0.5rem 0 1rem 0;">${html}</div>`);
  dv.paragraph(`**Connection Health:** ${ratioBar(linked, total)} ${linked}/${total} linked`);
};

const renderTypeHealth = () => {
  const rows = boxTypes.map(box => {
    const entries = results[box.name];
    const linked = entries.filter(entry => entry.hasZettel).length;
    const withIds = entries.filter(entry => entry.id).length;
    return [
      `${box.icon} ${box.label}`,
      entries.length,
      withIds,
      linked,
      `${ratioBar(linked, entries.length)} ${linked}/${entries.length || 0}`,
    ];
  });

  dv.header(2, 'Type Health');
  dv.table(['Type', 'Entries', 'With IDs', 'Linked', 'Link Rate'], rows);
};

const renderTable = (title, rows) => {
  if (rows.length === 0) return;
  const hasAnyZettel = rows.some(row => row.hasZettel);
  const hasMeaningfulTitle = rows.some(row => row.title && row.title !== row.type);
  const headers = ['Type', 'ID', 'Status'];
  if (hasMeaningfulTitle) headers.push('Title');
  headers.push('Excerpt', 'Source');
  if (hasAnyZettel) headers.push('Zettel', 'Bridge');

  dv.header(2, title);
  dv.table(
    headers,
    rows.map(row => {
      const cells = [`${TYPE_ICON[row.type] || '•'} ${row.type}`, fmtId(row.id), connectionBadge(row)];
      if (hasMeaningfulTitle) cells.push(row.title === row.type ? '' : row.title);
      cells.push(row.excerpt, row.source);
      if (hasAnyZettel) cells.push(row.zettel, linkBridge(row));
      return cells;
    })
  );
};

renderCards();
renderTypeHealth();
renderTable('Needs Zettel', unlinkedEntries);
renderTable('Linked', linkedEntries);
renderTable('Missing ID', missingIdEntries);
renderTable('All Entries', allEntries);
