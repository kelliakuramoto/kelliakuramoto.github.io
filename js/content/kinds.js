import { esc } from '../dom.js';
import { articleCard, bookCard, imageCard, podcastCard, quoteCard, textCard, flashCard } from '../cards.js';
import { all, connections, refKey } from './graph.js';
import { richText } from './richtext.js';

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
//   plain('I love [[free-bread|bread]] and [[gut-check]]') -> 'I love bread and gut-check'
const plain = text => text.replace(/\[\[(?:[a-z]+:)?([\w-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => label || id);

// Formats an ISO date for display. month is 'short' ("Nov 12, 2026") or 'long' ("November 12, 2026").
export const formatDate = (iso, month) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });

// The attributes that make a card clickable, the same for EVERY kind:
//   refAttrs(essay) -> 'data-ref="article:no-advice" tabindex="0" role="button" aria-label="Open: ..."'
// The single click handler in knowledge.js looks for data-ref and opens that page.
export const refAttrs = item =>
  `data-ref="${refKey(item.kind, item.id)}" tabindex="0" role="button" aria-label="Open: ${esc(item.title || item.word || item.text)}"`;

// ---- Media (the Consume board) --------------------------------------
// Cover colours for books that have no `color` of their own, picked by position in the library.
const BOOK_COLORS = ['#2f4858', '#1d3a2b', '#7a2a33', '#5b5266'];

// One drawing function per media `type` (the `type:` field in library.js).
// Add a new media type here and the board, the peeks and the connection lists all pick it up.
const MEDIA_CARDS = {
  book:    item => bookCard({ ...item, color: item.color || BOOK_COLORS[all('media').indexOf(item) % BOOK_COLORS.length], href: item.url }),
  podcast: item => podcastCard({ ...item, href: item.url }),
  poem:    item => imageCard({ src: item.image, ratio: '4/5', title: item.title, sub: item.by, href: item.url }),
  quote:   item => quoteCard(item),
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
  definition: (item, open) => articleCard({ title: item.word, sub: plain(item.text.split('\n')[0]), attrs: open ? refAttrs(item) : '' }),
  question: (item, open) => textCard({ text: item.text, attrs: open ? refAttrs(item) : '' }),
};

// THE card for any item, whatever its kind.
//   cardFor(essay)          clickable article row (Knowledge lists)
//   cardFor(book, false)    plain card with no click behaviour (Consume board)
// Can be passed straight to .map(): items.map(cardFor) works.
export const cardFor = (item, open = true) => CARDS[item.kind](item, open);

// The small preview shown when you hover a link inside an essay. Defaults to the item's own card;
// list a kind here only when its preview should look different.
const PEEKS = {
  definition: item => flashCard({ front: richText(item.text), back: esc(item.word), foot: item.word, attrs: '' }),
  question: () => '',   // no preview for questions
};

// The preview HTML for any item (returns '' when a kind has no preview).
export const peekFor = item => (PEEKS[item.kind] || (i => cardFor(i, false)))(item);

// ---- Connections ------------------------------------------------------
// Section titles for the "connected" lists, looked up as CONNECTION_LABELS[kind of the page][kind of the target].
//   '_' is the fallback for any kind not listed. This is only copy: edit the words freely.
const CONNECTION_LABELS = {
  definition: { media: 'Origin', article: 'Used in a sentence', _: 'Related' },
  media:      { article: 'Written about in', definition: 'Concepts', _: 'Related' },
  _:          { media: 'References', definition: 'Concepts', article: 'See also', experiment: 'See also', question: 'Questions', _: 'Related' },
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
  for (const other of connections(item, { kinds, filter: canSee })) {
    if (!groups.has(other.kind)) groups.set(other.kind, []);
    groups.get(other.kind).push(other);
  }
  return [...groups].map(([kind, items]) => {
    const cards = items.map(other => cardFor(other, kind !== 'media')).join('');   // media cards are external links, the rest open pages
    return `<section class="connections"><h2 class="definitions-related">${labelFor(item.kind, kind)}</h2>${cards}</section>`;
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
