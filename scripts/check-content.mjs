// Run after editing content:   node scripts/check-content.mjs
// 1. validate() reports links that point at nothing, ids used twice, bare [[ids]] shared by two kinds, and inline [[ids]] written without a kind.
// 2. Then it prints every connection, so you can confirm that an essay and a book really found each other.
// Exits with an error code when something is wrong, so it can also run in CI. Safe to run any time.
import { all, connections, relations, validate, writtenRef } from '../js/content/index.js';

const problems = validate();
console.log(problems.length ? `\n${problems.length} problem(s):\n - ${problems.join('\n - ')}\n` : '\nNo broken links.\n');

for (const kind of ['article', 'definition', 'media', 'experiment', 'thought']) {
  for (const item of all(kind)) {
    const links = connections(item).map(writtenRef);
    if (links.length) console.log(`${writtenRef(item)}  ->  ${links.join(', ')}`);
  }
}

// 3. The relationship report: every media item with everything connected to it, grouped by how it was written.
//    Run this whenever you add media, a quote, a thought or a link, to see that it landed where you meant.
//    'children'  = items whose `parent` is this one (hidden from the board, shown on this item's page)
//    'parent'    = this item's own `parent`
//    'linked'    = `links: []`, written on either side (the arrow says which side wrote it)
//    'mentioned' = [[inline]] references in essays, experiments and thoughts
const name = writtenRef;
const label = item => item.title || item.episode || item.word || (item.text || '').slice(0, 40);
const list = rels => rels.map(r => `${name(r.other)}${r.writtenHere ? ' (written here)' : ''}`);
console.log('--- Media relationships ---   (-> written on this item, <- written on the other item)');
for (const item of all('media')) {
  const rels = relations(item);
  const group = (via, writtenHere) => rels.filter(r => r.via === via && r.writtenHere === writtenHere);
  const rows = [
    ['parent', group('parent', true)],
    ['children', group('parent', false)],
    ['linked', rels.filter(r => r.via === 'links')],
    ['mentioned', rels.filter(r => r.via === 'inline')],
  ].filter(([, found]) => found.length);
  console.log(`\n${name(item)}  "${label(item)}"  ${item.parent ? '[hidden from board]' : '[on board]'}`);
  if (!rows.length) console.log('  (nothing connected)');
  for (const [title, found] of rows) {
    const text = (title === 'linked' ? found.map(r => `${name(r.other)} ${r.writtenHere ? '->' : '<-'}`) : list(found).map(t => t.replace(' (written here)', '')));
    console.log(`  ${title.padEnd(9)} ${text.join(', ')}`);
  }
}
console.log('');

process.exitCode = problems.length ? 1 : 0;
