# kelliakuramoto.github.io

A portfolio site: plain HTML, CSS and JavaScript ES modules. There is no build step. Open it with any static server
(`python3 -m http.server`) or push to GitHub Pages.

## How it is organised

```
index.html              all the page markup (case studies are written here)
styles.css              all the styles, in numbered sections
js/main.js              the entry point: imports every feature below

js/dom.js               tiny shared helpers: $, $$, on, esc, showOnly, setOverlay, formatDate, setHash, shuffle
js/navigation.js        sidebar, overview grid, Create / Consume toggle, mobile
js/project-data.js      the four case studies (title, question, thumbnail) for the grid and sidebar
js/photobook.js         the page-flip photobook
js/photography.js       draws the Photography boards     js/photography-data.js   the photos themselves
js/lightbox.js          the one "enlarge an image" overlay for the whole site
js/media.js             videos and carousels
js/cursor.js            custom cursor (mouse only)
js/password-gate.js     restricted content
js/supabase.js          the Supabase client

js/cards.js             the card system: image, quote, book, podcast, article, text, flash cards
js/blocks.js            how a block of writing is drawn, for an essay page and for a thought card (one table, BLOCKS)
js/consume.js           the Consume board          js/detail.js   a Consume item's detail page

js/content/             all content, and how it connects
  data/                 essays, definitions, experiments, thoughts, library (books, podcasts, poems, quotes)
  graph.js              registry + two-way links + validation (no DOM, runs in Node)
  richtext.js           the one [[link]] syntax
  kinds.js              how each kind of content looks (cards, previews, section titles)
  index.js              the only file that imports data (one register() line per kind)

js/knowledge.js         entry point for the Knowledge view; imports js/knowledge/index.js
js/knowledge/           the Knowledge view, one job per file
  state.js              its elements and the shared `nav` state
  access.js             password unlock and who can see what
  collections.js        the overview: every collection of cards
  reader.js             a page open in the reader (essay, definition, experiment, question)
  peek.js               "Peek into my mind" previews
  responses.js          visitors' responses to a question, and moderation
  editor.js             the add-a-question modal
  questions.js          loads questions from Supabase
  motion.js, urls.js    transitions, and the address bar
  index.js              opens and closes the layer, wires everything together

scripts/check-content.mjs   `node scripts/check-content.mjs` lists broken links and the connection map
```

Shared behaviour lives in one place: `setOverlay` (dom.js) opens and closes every overlay, `thoughtCard` and
`pageBlocks` (blocks.js) draw writing, and `openLightbox` (lightbox.js) enlarges images.

## Adding content

- **Essay, definition, experiment:** add an entry to its file in `js/content/data/`. Done.
- **Media (book, podcast, poem, quote):** add an entry to `js/content/data/library.js`. Give it an `id` if you want to link to it by hand.
- **Thought:** add an entry to `js/content/data/thoughts.js` (its header explains every field).
- **Photo:** add `{ src, ratio }` to a section in `js/photography-data.js`. Add `alt` to describe it; without one it reads
  "San Francisco, photo 3 of 9".
- **A new kind of content (e.g. recipes):** a data file, one `register()` line in `js/content/index.js`, and one entry in `CARDS` (kinds.js).
- **A new block type in writing:** one entry in `BLOCKS` (blocks.js), with how it looks on a page and in a thought card.

After changing content, run `node scripts/check-content.mjs`.

## Linking (declare once, both sides know)

In any text: `[[free-bread]]`, `[[id|custom words]]`, `[[media:the-score]]` (add the prefix only if ids clash).
On any item: `links: ['definition:gut-check', 'article:no-advice']`.
Every link carries `data-ref="kind:id"`, so one click handler opens every kind of page and one hover handler shows every preview.

## Questions (Supabase)

Questions are stored in Supabase and register into the graph after they load, so an essay can `[[link]]` to a question by its id
(the id is the last part of the question's address: `#mymind/question/<id>`).
A question links out the same way: write `[[book:the-score|these words]]` inside its text, or add a `links text[]` column to
`questions` and list `book:the-score`, `article:no-advice`... in it. Either way both sides know: the question is listed on that
Consume item's detail page, and hovering the link inside an essay or experiment previews the question.
