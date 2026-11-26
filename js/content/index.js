import { register } from './graph.js';
import { LIBRARY } from './data/library.js';
import { ESSAYS } from './data/essays.js';
import { EXPERIMENTS } from './data/experiments.js';
import { DEFINITIONS } from './data/definitions.js';
import { THOUGHTS, thoughtBlocks } from './data/thoughts.js';

// =====================================================
// The single registration point. Importing this file fills the graph.
// To add a new kind of content: add a data file, then one register() line here.
//   texts(item)  every string in the item that may contain [[links]]
//   idOf(item)   what to build an id from when the item has none
// Questions come from Supabase and are registered after they load (see js/knowledge/questions.js).
// =====================================================

// Essays and experiments keep their writing in `blocks`; this lists every string in them
// (paragraphs, headings, quotes and list items, and the same inside a `thought` block's own `blocks`) so the graph can find the [[links]] inside.
const blockTexts = item => (item.blocks || []).flatMap(block => [block.text, ...(block.items || []), ...(block.blocks ? blockTexts(block) : [])]);

// One line per kind of content. Order matters a little: it is the order connections are grouped in,
// and the order a bare [[id]] is searched in if two kinds share an id.
register('media',      LIBRARY,     { idOf: i => i.title || i.episode || i.text });
register('definition', DEFINITIONS, { texts: i => [i.text], idOf: i => i.word });
register('article',    ESSAYS,      { texts: blockTexts,     idOf: i => i.title });
register('experiment', EXPERIMENTS, { texts: blockTexts,     idOf: i => i.title });
register('thought',    THOUGHTS,    { texts: i => blockTexts({ blocks: thoughtBlocks(i) }), idOf: i => thoughtBlocks(i)[0].text });

// Re-exported so other files only ever import from './content/index.js'.
export { LIBRARY, ESSAYS, EXPERIMENTS, DEFINITIONS, THOUGHTS, thoughtBlocks };
export { all, get, connections, relations, validate, register, refKey, writtenRef } from './graph.js';
