// =====================================================
// CONTENT GRAPH: the one place that knows what exists and how it all connects.
// No DOM and no imports, so it runs in the browser AND in Node (scripts/check-content.mjs).
//
// THE MODEL
//   Every piece of content is a NODE with a kind and an id. Its key is "kind:id":
//     "article:no-advice"   "definition:free-bread"   "media:letters-to-a-young-poet"
//   Nodes are joined by EDGES, which come from three places and are ALWAYS two-way:
//     1. `links: ['definition:operating-system', 'free-bread']` written on an item   (explicit)
//     2. [[kind:id]] / [[kind:id|words]] written inside any of the item's texts (inline; the kind is always written)
//     3. `parent: 'book:some-book'` written on any item                       (same two-way edge as `links`;
//        it means "I belong to this media item"; the Consume board never shows an item that has a `parent`, see onBoard in kinds.js)
//   You declare a connection once, on whichever side is convenient, and BOTH items know about it.
//   HOW TO NAME AN ITEM when you write a link: media items by their `type` in library.js (book:, podcast:, poem:, quote:),
//   everything else by its kind (definition:, article:, experiment:, thought:). Example: 'book:letters-to-a-young-poet'.
//   HOUSE RULE: for any parent/child relationship, write it on the CHILD, pointing at its parent. The child can be a media item
//   (quote, book, podcast, poem), a thought or a definition; the parent is always a media item. `parent: 'book:id'` means "I belong
//   to this item": the child is never a card on the Consume board and shows on the parent's page. `links:` is the plain two-way
//   link for things that are merely related and stay where they are. A parent never lists its children.
//   Prose mentions are written inline as [[kind:id]] in the essay, e.g. [[book:letters-to-a-young-poet|live the questions]].
//   To see everything connected to each media item, run:  node scripts/check-content.mjs
//   Example: an essay writes [[book:letters-to-a-young-poet]]  ->  the book also lists the essay.
//
// HOW YOU USE IT (from other files)
//   register(kind, items, options)   fill the graph          (done once, in content/index.js)
//   all(kind)                        every item of a kind    all('article')
//   get('article:no-advice')         one item by key         (or get('article', 'no-advice'))
//   connections(item, options)       everything linked to an item, either direction
//   relations(item)                  every connection explained: who wrote it, which way, how  (used by scripts/check-content.mjs)
//   validate()                       list of broken links    (used by scripts/check-content.mjs)
// =====================================================

const kinds = new Map();   // kind -> { texts(item) -> string[], items: Map(id -> item) }
let origins = [];          // every connection as written: { from, to, via: 'links' | 'parent' | 'inline' }, for relations() below
let edges = null;          // Map(key -> Set(key)). null means "something changed, rebuild before the next query"
const problems = [];       // broken links found while building the edges (reported by validate())
const setupProblems = [];  // duplicate or missing ids found while registering (reported by validate())

// Builds the key used everywhere to name one item: refKey('article', 'no-advice') -> "article:no-advice".
export const refKey = (kind, id) => `${kind}:${id}`;

// Splits a reference string into its parts.
//   "article:no-advice" -> { kind: 'article', id: 'no-advice' }
//   "no-advice"         -> { kind: null,      id: 'no-advice' }   (kind unknown: resolve() will search every kind)
//   anything else       -> null
export function parseRef(ref) {
  const m = /^(?:([a-z]+):)?([\w-]+)$/.exec(String(ref).trim());
  return m ? { kind: m[1] || null, id: m[2] } : null;
}

// The pattern for an inline link inside text. The kind is always written, like `parent` and `links`:
//   [[kind:id]]   [[kind:id|words]]
// Capture groups: 1 = kind, 2 = id, 3 = custom link words (optional).
// A bracket pair without a kind, like [[id]], does not match: it stays as typed on the page and validate() reports it.
export const TOKEN = /\[\[([a-z]+):([\w-]+)(?:\|([^\]]+))?\]\]/g;
const NO_KIND = /\[\[(?![a-z]+:)([^\]|]*)(?:\|[^\]]*)?\]\]/g;   // [[id]] or [[id|words]]: written without a kind

// Turns any text into a short, URL-safe id: "Letters to a Young Poet" -> "letters-to-a-young-poet".
// Only used as a fallback when an item has no `id` of its own (first six words, apostrophes dropped).
const slug = text => String(text).toLowerCase()
  .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .split('-').slice(0, 6).join('-');

// REGISTER one kind of content. Calling it again for the same kind replaces what was there
// (that is how Supabase questions are added once they have loaded).
//   kind     'article', 'definition', 'media', ... (any lowercase word)
//   items    the array from a data file
//   texts    texts(item) -> the strings inside an item that may contain [[links]]
//   idOf     idOf(item)  -> what to build an id from when the item has none
// Side effects on each item: it gets `item.kind`, and `item.id` is filled in if missing
// (a duplicate id gets "-2", "-3"... and is reported by validate()).
export function register(kind, items, { texts = () => [], idOf = () => '' } = {}) {
  const map = new Map();
  for (const item of items) {
    let id = item.id || slug(idOf(item) || '');
    if (!id) { setupProblems.push(`${kind}: an item has no id and nothing to generate one from`); continue; }
    const base = id;
    for (let n = 2; map.has(id); n++) id = `${base}-${n}`;
    if (id !== base && item.id) setupProblems.push(`${kind}:${base} is used twice`);
    item.id = id;
    item.kind = kind;
    map.set(id, item);
  }
  kinds.set(kind, { texts, items: map });
  edges = null;   // the connections are now out of date: rebuild lazily on the next query
}

// Every item of one kind, in the order they were written in the data file.
//   all('article') -> [essay, essay, ...]      all('nothing') -> []
export const all = kind => [...(kinds.get(kind)?.items.values() || [])];

// Looks up ONE item. Two spellings, same result (null if it does not exist):
//   get('article:no-advice')      get('article', 'no-advice')
export function get(a, b) {
  const { kind, id } = b === undefined ? (parseRef(a) || {}) : { kind: a, id: b };
  return kinds.get(kind)?.items.get(id) || null;
}

// How a reference to an item is WRITTEN in links, parent and [[inline]] links. Media items are written by their `type` in
// library.js (book, podcast, poem, quote); every other kind is written by its kind (definition, article, experiment, thought).
//   writtenRef(book) -> "book:letters-to-a-young-poet"      writtenRef(definition) -> "definition:free-bread"
// (Internally every media item is still stored as "media:<id>", see refKey; you never write that form.)
export const writtenRef = item => `${item.kind === 'media' ? item.type : item.kind}:${item.id}`;

// Finds the item an inline link or `links` entry points at.
//   resolve('media', 'the-score')   explicit kind: exact lookup
//   resolve(null, 'free-bread')     no kind: every kind is searched; the first registered one wins
// Returns { item, ambiguous } or null. `ambiguous` is true when more than one kind has that id,
// which validate() reports so you know to write [[kind:id]] instead.
export function resolve(kind, id) {
  if (kind === 'media') return null;   // media is written by its type: book:id, podcast:id, poem:id, quote:id
  if (kind && !kinds.has(kind)) {       // a media type: the item must exist and really have that type
    const item = get('media', id);
    return item && item.type === kind ? { item, ambiguous: false } : null;
  }
  if (kind) { const item = get(kind, id); return item ? { item, ambiguous: false } : null; }
  const hits = [...kinds.keys()].map(k => get(k, id)).filter(Boolean);
  return hits.length ? { item: hits[0], ambiguous: hits.length > 1 } : null;
}

// The key of an item that has already been registered ("article:no-advice").
const nodeKey = item => refKey(item.kind, item.id);

// Records a two-way connection between two keys. Connecting something to itself is ignored.
// `via` is how it was written ('links', 'parent' or 'inline'); it is kept only so relations() can explain each connection.
function addEdge(a, b, via) {
  if (a === b) return;
  origins.push({ from: a, to: b, via });
  (edges.get(a) || edges.set(a, new Set()).get(a)).add(b);
  (edges.get(b) || edges.set(b, new Set()).get(b)).add(a);
}

// Builds every edge from scratch by reading every item's `links` and every [[link]] in its texts.
// Broken or ambiguous links are collected in `problems` rather than thrown, so the site keeps working.
// Called automatically the first time connections() or validate() runs after a register().
function build() {
  edges = new Map();
  origins = [];
  problems.length = 0;
  for (const [kind, { texts, items }] of kinds) {
    for (const item of items.values()) {
      const from = nodeKey(item);
      const note = text => problems.push(`${writtenRef(item)}: ${text}`);
      // "media:x" is the old spelling: say what to write instead
      const missing = (kind, id) => { const m = kind === 'media' && get('media', id); return m ? ` (write ${writtenRef(m)})` : ''; };

      // 1. explicit: links: ['definition:operating-system', ...]
      for (const ref of item.links || []) {
        const p = parseRef(ref);
        const hit = p && resolve(p.kind, p.id);
        if (!hit) { note(`links: "${ref}" does not exist${missing(p && p.kind, p && p.id)}`); continue; }
        if (hit.ambiguous) note(`links: "${ref}" matches several kinds, write kind:id`);
        addEdge(from, nodeKey(hit.item), 'links');
      }

      // 1b. parent: 'book:some-book'  (one string, on any item, pointing at a media item written by its type; a two-way edge like `links`)
      if (item.parent !== undefined) {
        const p = typeof item.parent === 'string' && parseRef(item.parent);
        const hit = p && resolve(p.kind, p.id);
        if (!hit) note(`parent: "${item.parent}" does not exist${missing(p && p.kind, p && p.id)}`);
        else if (hit.ambiguous) note(`parent: "${item.parent}" matches several kinds, write type:id`);
        else if (hit.item.kind !== 'media') note(`parent: "${item.parent}" is not a media item (a parent must be media)`);
        else addEdge(from, nodeKey(hit.item), 'parent');
      }

      // 2. inline: every [[...]] inside the item's texts
      for (const text of texts(item)) {
        for (const m of String(text || '').matchAll(TOKEN)) {
          if (m[1] === 'project') continue;   // [[project:id]] links to a case study (js/project-data.js), not to content
          const hit = resolve(m[1], m[2]);
          if (!hit) { note(`[[${m[1] ? m[1] + ':' : ''}${m[2]}]] does not exist${missing(m[1], m[2])}`); continue; }
          if (hit.ambiguous) note(`[[${m[2]}]] matches several kinds, write kind:id`);
          addEdge(from, nodeKey(hit.item), 'inline');
        }
        for (const m of String(text || '').matchAll(NO_KIND)) {
          const guess = resolve(null, m[1].trim());
          note(`${m[0]} needs a kind${guess ? `: write ${m[0].replace('[[', `[[${writtenRef(guess.item).split(':')[0]}:`)}` : ' (write [[kind:id]])'}`);
        }
      }
    }
  }
}

// EVERYTHING CONNECTED TO `item`, in either direction (it links there, or that links here).
//   connections(definition)                                  all neighbours
//   connections(media, { kinds: ['article', 'definition'] })  only those kinds
//   connections(essay, { filter: item => ... })              only what the predicate allows
// Order is stable: by kind (in registration order), then in data-file order.
export function connections(item, { kinds: only, filter } = {}) {
  if (!edges) build();
  const keys = edges.get(nodeKey(item));
  if (!keys) return [];
  return [...keys].map(key => get(key)).filter(Boolean)
    .filter(other => (!only || only.includes(other.kind)) && (!filter || filter(other)))
    .sort((a, b) => [...kinds.keys()].indexOf(a.kind) - [...kinds.keys()].indexOf(b.kind)
      || all(a.kind).indexOf(a) - all(b.kind).indexOf(b));
}

// EVERY CONNECTION OF `item`, explained: who wrote it, which way, and how. Used by scripts/check-content.mjs.
//   relations(book) -> [{ other, via: 'parent' | 'links' | 'inline', writtenHere: true | false }, ...]
//   via 'parent': `writtenHere` true means THIS item has the parent (it is the child); false means `other` is its child.
//   via 'links' / 'inline': `writtenHere` says whether this item wrote the link or `other` did.
export function relations(item) {
  if (!edges) build();
  const me = nodeKey(item);
  return origins
    .filter(o => o.from === me || o.to === me)
    .map(o => ({ other: get(o.from === me ? o.to : o.from), via: o.via, writtenHere: o.from === me }))
    .filter(r => r.other);
}

// A list of human-readable problems: links to things that do not exist, ids used twice,
// inline [[ids]] written without a kind, bare ids that match more than one kind. An empty array means everything is fine.
// Run it with:  node scripts/check-content.mjs
export function validate() {
  build();
  return [...setupProblems, ...problems];
}
