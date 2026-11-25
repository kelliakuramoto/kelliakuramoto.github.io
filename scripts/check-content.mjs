// Run after editing content:   node scripts/check-content.mjs
// 1. validate() reports links that point at nothing, ids used twice, and bare [[ids]] shared by two kinds.
// 2. Then it prints every connection, so you can confirm that an essay and a book really found each other.
// Exits with an error code when something is wrong, so it can also run in CI. Safe to run any time.
import { all, connections, validate } from '../js/content/index.js';

const problems = validate();
console.log(problems.length ? `\n${problems.length} problem(s):\n - ${problems.join('\n - ')}\n` : '\nNo broken links.\n');

for (const kind of ['article', 'definition', 'media', 'experiment', 'thought']) {
  for (const item of all(kind)) {
    const links = connections(item).map(o => `${o.kind}:${o.id}`);
    if (links.length) console.log(`${kind}:${item.id}  ->  ${links.join(', ')}`);
  }
}
process.exitCode = problems.length ? 1 : 0;
