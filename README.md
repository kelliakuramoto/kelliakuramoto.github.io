# Content graph refactor

## What changed
js/content/            NEW. All content + how it connects
  data/essays.js        essays (kind "article")
  data/definitions.js   definitions
  data/experiments.js   experiments
  data/library.js       Consume media: books, podcasts, poems, quotes
  graph.js              registry + two-way links + validation (no DOM, runs in Node)
  richtext.js           the one [[link]] syntax
  kinds.js              how each kind looks (cards, previews, section titles)
  index.js              the only file that imports data (one register() line per kind)
scripts/check-content.mjs   `node scripts/check-content.mjs` lists broken links + the connection map
js/consume.js, js/knowledge.js, js/cards.js (peekFrame), js/cursor.js   rewired
js/definitions.js       DELETE (moved to js/content/data/definitions.js)
styles.css              1 small edit (search "data-ref^=")

## Adding content
Essay / definition / experiment: add an entry to its data file. Done.
Media: add an entry to library.js. Give it an `id` if you want to link to it by hand.

## Linking (declare once, both sides know)
In any text:   [[free-bread]]   [[id|custom words]]   [[media:the-score]] (prefix only if ids clash)
On any item:   links: ['definition:gut-check', 'article:no-advice']
Examples already in your data: no-advice mentions [[letters-to-a-young-poet]], so the book shows
"Peek into my mind" -> that essay, with no extra fields.

## Old -> new
{{media-id}} and ((essay-id)) -> [[id]]      term: 'x' -> links: ['x']      essay: 'x' -> (delete, inline link covers it)
data-term / data-essay / data-knowledge-kind -> data-ref="kind:id"

## New kind of content (e.g. recipes)
data file + register() line in index.js + one entry in CARDS (kinds.js). Nothing else changes.

## Questions (Supabase)
They register into the graph after loading, so essays can [[link]] to a question by its id.
Optional: add a `links text[]` column to `questions` so a question can point at others.
