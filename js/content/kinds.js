import { esc, formatDate, shuffle } from '../dom.js';
import { articleCard, bookCard, imageCard, podcastCard, quoteCard, textCard, flashCard } from '../cards.js';
import { thoughtCard } from '../blocks.js';
import { all, connections, parseRef, refKey, resolve } from './graph.js';
import { richText, URL_TOKEN, urlWords } from './richtext.js';
import { thoughtBlocks } from './data/thoughts.js';

// =====================================================
// KINDS: how each kind of content LOOKS.
// (graph.js knows what exists and how it connects; this file only draws it.)
//
// ADDING A NEW KIND (say "recipe"):
//   1. a data file, and one register() line in content/index.js
//   2. one entry in CARDS below (and in PEEKS if its hover preview should differ from its card)
//   3. optionally: link words in richtext.js (DEFAULT_WORDS) and section titles in CONNECTION_LABELS below
// Nothing else in the site needs to learn about it.
// =====================================================

// Link markup removed, for places that show text without links:
//   plain('I love [[free-bread|bread]] and [[operating-system]]') -> 'I love bread and operating-system'
const plain = text => text
  .replace(URL_TOKEN, (m, address, label) => urlWords(address, label))
  .replace(/\[\[(?:[a-z]+:)?([\w-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => label || id);

// The attributes that make a card clickable, the same for EVERY kind:
//   refAttrs(essay) -> 'data-ref="article:no-advice" tabindex="0" role="button" aria-label="Open: ..."'
// The single click handler in js/knowledge/index.js looks for data-ref and opens that page.
export const refAttrs = item =>
  `data-ref="${refKey(item.kind, item.id)}" tabindex="0" role="button" aria-label="Open: ${esc(plain(item.title || item.word || item.text))}"`;

// ---- Media (the Consume board) --------------------------------------
// Cover colours for books that have no `color` of their own, picked by position in the library.
const BOOK_COLORS = ['#2f4858', '#1d3a2b', '#7a2a33', '#5b5266'];

// One drawing function per media `type` (the `type:` field in library.js).
// Add a new media type here and the board, the peeks and the connection lists all pick it up.
// `extra` (href, attrs) overrides the defaults, e.g. detailCard() below removes the link and adds a click hook.
const MEDIA_CARDS = {
  book:    (item, extra) => bookCard({ ...item, color: item.color || BOOK_COLORS[all('media').indexOf(item) % BOOK_COLORS.length], href: item.url, ...extra }),
  podcast: (item, extra) => podcastCard({ ...item, href: item.url, ...extra }),
  poem:    (item, extra) => imageCard({ src: item.image, ratio: '4/5', title: item.title, sub: item.by, href: item.url, ...extra }),
  quote:   (item, extra) => quoteCard({ ...item, ...extra }),
};

// ---- One card per kind ------------------------------------------------
// Each function draws one item. `open` = true makes the card open that item's page in Knowledge
// (adds data-ref); false makes it display-only (the Consume board, hover previews).
const CARDS = {
  media: item => MEDIA_CARDS[item.type](item),
  article: (item, open) => articleCard({
    title: item.title, sub: item.subheader, date: item.date,
    dateLabel: item.date && formatDate(item.date, 'short'),
    attrs: open ? refAttrs(item) : '',
  }),
  experiment: (item, open) => bookCard({
    title: item.title, by: item.byline, color: item.color || '#e8e8e8', image: item.image,
    ink: 'var(--text)', attrs: open ? refAttrs(item) : '',
  }),
  thought: (item, open) => thoughtCard({
    blocks: thoughtBlocks(item), date: item.date, dateLabel: item.date && formatDate(item.date, 'short'),
    attrs: open ? thoughtAttrs(item) : '',
    format: text => richText(text, { canSee: isPublic }),   // [[links]] in a thought work on a detail page too
    className: item.wide ? 'c-card--wide' : '',   // wide: true in thoughts.js spans both columns on a detail page
  }),
  definition: (item, open) => articleCard({ title: item.word, sub: plain(item.text.split('\n')[0]), attrs: open ? refAttrs(item) : '' }),
  question: (item, open) => textCard({ text: plain(item.text), attrs: open ? refAttrs(item) : '' }),   // a question may hold [[links]]: cards show just the words
};

// A thought has no page of its own: clicking it opens the detail page of the media it belongs to (when that has one).
const parentOf = item => {
  const ref = item.parent && parseRef(item.parent);
  return ref && resolve(ref.kind, ref.id)?.item;
};
const thoughtAttrs = item => {
  const parent = parentOf(item);
  return parent && hasDetail(parent) ? detailAttrs(parent) : '';
};

// THE card for any item, whatever its kind.
//   cardFor(essay)          clickable article row (Knowledge lists)
//   cardFor(book, false)    plain card with no click behaviour (Consume board)
// Can be passed straight to .map(): items.map(cardFor) works.
export const cardFor = (item, open = true) => CARDS[item.kind](item, open);

// The small preview shown when you hover a link inside an essay. Defaults to the item's own card;
// list a kind here only when its preview should look different.
const PEEKS = {
  definition: item => flashCard({ front: richText(item.text), back: esc(item.word), attrs: '' }),
};

// The preview HTML for any item (returns '' when a kind has no preview).
export const peekFor = item => (PEEKS[item.kind] || (i => cardFor(i, false)))(item);

// ---- Connections ------------------------------------------------------
// Section titles for the "connected" lists, looked up as CONNECTION_LABELS[kind of the page][kind of the target].
//   '_' is the fallback for any kind not listed. This is only copy: edit the words freely.
const CONNECTION_LABELS = {
  definition: { media: 'Origin', article: 'Used in a sentence', _: 'Related' },
  media:      { article: 'Written about in', definition: 'Concepts', _: 'Related' },
  _:          { media: 'References', definition: 'Concepts', article: 'See also', experiment: 'See also', question: 'Questions', thought: 'Thoughts', _: 'Related' },
};

// The heading for one group of connections, e.g. labelFor('definition', 'media') -> "Origin".
const labelFor = (owner, target) => {
  const table = CONNECTION_LABELS[owner] || CONNECTION_LABELS._;
  return table[target] || table._ || CONNECTION_LABELS._[target] || 'Related';
};

// EVERYTHING CONNECTED TO `item`, as ready-made cards grouped by kind under a heading.
// This is how definitions get "Origin" / "Used in a sentence" in the Definitions page's right column.
// You never list these by hand: they come from [[links]] and `links:` via the graph.
//   canSee   hides anything the viewer may not open
//   kinds    limit to some kinds, e.g. ['media']
// Empty groups are left out; nothing connected returns ''.
export function connectionsHTML(item, { canSee = () => true, kinds } = {}) {
  const groups = new Map();
  const listed = new Set(connections(item, { filter: canSee }).map(other => refKey(other.kind, other.id)));   // so nothing shows twice
  for (const other of connections(item, { kinds, filter: canSee })) {
    const parent = other.kind === 'thought' && parentOf(other);   // a thought shows as the media it belongs to
    const shown = parent || other;
    if (parent && (listed.has(refKey(parent.kind, parent.id)) || !canSee(parent))) continue;
    if (parent) listed.add(refKey(parent.kind, parent.id));
    if (!groups.has(shown.kind)) groups.set(shown.kind, []);
    groups.get(shown.kind).push(shown);
  }
  return [...groups].map(([kind, items]) => {
    // media with a detail page opens it (like on the Consume board), otherwise it links out to its own url; the rest open pages
    const cards = items.map(other => (hasDetail(other) ? detailCard(other) : cardFor(other, kind !== 'media'))).join('');
    return `<section class="connections">${cards}</section>`;
  }).join('');
}

// ---- "Peek into my mind" ------------------------------------------------
// Button labels by kind, used when a media item connects to more than one page.
const PEEK_LABELS = { article: 'ESSAY', definition: 'CONCEPT', experiment: 'EXPERIMENT', question: 'QUESTION' };

// The buttons for the "Peek into my mind" overlay on a Consume card: one per page it connects to.
//   peekLinks(book) -> [{ ref: 'article:no-advice', label: 'PEEK INTO MY MIND' }]
// An item with no connections returns [], so it gets no overlay at all.
// Labels are generic on purpose (never the essay's title), so nothing about a locked essay
// is revealed before the password prompt.
export function peekLinks(item) {
  const links = connections(item, { kinds: Object.keys(PEEK_LABELS) });
  return links.map(other => ({
    ref: refKey(other.kind, other.id),
    label: links.length === 1 ? 'PEEK INTO MY MIND' : PEEK_LABELS[other.kind],
  }));
}

// ---- Consume detail page ------------------------------------------------
// A book, podcast or poem with things attached to it opens a detail page (js/detail.js).
// What is attached comes from the graph: quotes (media of type 'quote'), definitions, thoughts and questions that link to it,
// plus essays / experiments that [[link]] to it. Nothing is listed by hand on the item.
// Quotes, definitions, thoughts and questions with an `access` list are never drawn here (the Consume board is public).
// Essays and experiments are listed by title; opening one goes through the password prompt.
const isPublic = other => !other.access;

export function detailParts(item) {
  const linked = connections(item);
  return {
    quotes: linked.filter(o => o.kind === 'media' && o.type === 'quote' && isPublic(o)),
    media: linked.filter(o => o.kind === 'media' && o.type !== 'quote' && isPublic(o)),   // books, podcasts, poems linked in (either direction)
    definitions: linked.filter(o => o.kind === 'definition' && isPublic(o)),
    thoughts: linked.filter(o => o.kind === 'thought' && isPublic(o)),
    questions: linked.filter(o => o.kind === 'question' && isPublic(o)),
    pages: linked.filter(o => o.kind === 'article' || o.kind === 'experiment'),
  };
}

// One entry per attached item, as the name of its kind ('quote', 'definition', 'thought', 'question', 'page'), for the sticky notes on the board.
export const attachedKinds = item => {
  const parts = detailParts(item);
  return [
    ...parts.quotes.map(() => 'quote'), ...parts.media.map(() => 'media'), ...parts.definitions.map(() => 'definition'), ...parts.thoughts.map(() => 'thought'),
    ...parts.questions.map(() => 'question'), ...parts.pages.map(() => 'page'),
  ];
};

// An item with a `parent` (library.js) belongs to that parent: it is not a card on the Consume board, it shows on the parent's
// detail page. Change `parent` to `links` on the item and it returns to the board.
export const onBoard = item => !item.parent;

// Every media item with something attached (a book, podcast, poem or quote) gets sticky notes on hover and a detail page.
export const hasDetail = item => item.kind === 'media'
  && Object.values(detailParts(item)).some(list => list.length);

// The board card for an item with a detail page: no outside link, clicking it opens the page instead.
const detailAttrs = item =>
  `data-detail="${refKey(item.kind, item.id)}" tabindex="0" role="button" aria-label="Open notes: ${esc(item.title || item.episode || item.text)}"`;

export const detailCard = item => MEDIA_CARDS[item.type](item, { href: '', attrs: detailAttrs(item) });

// The cards for what is attached to an item on its detail page (quotes, definitions, thoughts, questions), unshuffled.
// Definitions and questions open their Knowledge page when clicked.
// Quotes on a detail page show no author, since they belong to the book, podcast or poem the page is about.
const attachedCards = ({ quotes, media, definitions, thoughts, questions }) => [
  ...quotes.map(q => MEDIA_CARDS.quote(q, { by: '' })),
  ...media.map(m => MEDIA_CARDS[m.type](m)),   // the normal card, linking out to its own url
  ...definitions.map(term => flashCard({
    front: richText(term.text, { canSee: isPublic }), back: esc(term.word), attrs: refAttrs(term),
  })),
  ...thoughts.map(t => cardFor(t, false)),
  ...questions.map(q => cardFor(q)),
];

// The detail page content, laid out like an essay: title, deck, then the attached cards.
// Pieces are shuffled, so the order is different every time the page opens.
export function detailHTML(item) {
  const parts = detailParts(item);
  const cards = [
    ...attachedCards(parts),
    ...parts.pages.map(page => cardFor(page)),   // opens through the password prompt when the essay has an `access` list
  ];
  // [ VIEW ] opens the book, podcast or poem itself, to the right of the title
  const view = item.url
    ? `<a class="consume-view-btn" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">[ VIEW ]</a>` : '';
  // The same three-column layout as an essay (.essay in styles.css): everything sits in the middle column, the cards one under another.
  return `<div class="essay"><div class="knowledge-column">
    <header class="knowledge-article-header">
      <div class="consume-detail-title"><h1>${esc(item.title || item.episode || item.text)}</h1>${view}</div>
      <p class="knowledge-deck">${esc(item.by || item.show || '')}</p>
    </header>
    <div class="consume-detail-cards"><div class="consume-detail-board">${shuffle(cards).join('')}</div></div>
  </div><aside class="knowledge-column essay-aside" aria-hidden="true"><div class="consume-peek"></div></aside></div>`;
}
