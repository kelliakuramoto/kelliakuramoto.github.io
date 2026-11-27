import { $ } from '../dom.js';
import { articleCard } from '../cards.js';
import { all } from '../content/index.js';
import { cardFor, refAttrs } from '../content/kinds.js';

// =====================================================
// COLLECTIONS: the lists on the Knowledge overview (the definitions row, articles, experiments; questions are in questions.js).
// =====================================================

// Every definition, read from the graph each time (so a definition added to data/definitions.js just appears).
// A function rather than a constant, because the graph is the single source of truth.
export const DEFINITIONS = () => all('definition');

// The single row that opens the definitions: the same articleCard as the articles below it
const definitionsRow = () => articleCard({
  title: 'Shortcuts to my shared language',
  sub: `${DEFINITIONS().length} concepts to help you understand my mind`,
  attrs: refAttrs({ kind: 'definition', id: DEFINITIONS()[0].id, title: 'Shortcuts to my shared language' }),
});

export function renderInto(selector, items, toHTML) {
  const root = $(selector);
  if (root) root.innerHTML = items.map(item => toHTML(item)).join('');
}

// Newest first. ISO dates (YYYY-MM-DD) sort correctly as plain strings.
const newestFirst = (a, b) => (b.date || '').localeCompare(a.date || '');

export function renderCollections() {
  const articles = all('article').sort(newestFirst).map(item => cardFor(item)).join('');
  const root = $('#knowledgeArticles');
  if (root) root.innerHTML = definitionsRow() + articles;   // definitions always sit on top
  renderInto('#knowledgeExperiments', all('experiment'), cardFor);
}
