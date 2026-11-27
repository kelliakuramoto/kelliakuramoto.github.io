import { $, $$, esc, formatDate, on, showOnly } from '../dom.js';
import { flashCard } from '../cards.js';
import { pageBlocks } from '../blocks.js';
import { animateScrollTo } from '../navigation.js';
import { get } from '../content/index.js';
import { richText } from '../content/richtext.js';
import { connectionsHTML } from '../content/kinds.js';
import { carouselHTML, initCarousels } from '../media.js';
import { OPENABLE, closeButton, hooks, isOpen, nav, overview, reader, readerContent, readerType, view } from './state.js';
import { DEFINITIONS } from './collections.js';
import { instant, present } from './motion.js';
import { hashFor, setUrl } from './urls.js';
import { loadResponses, responsesSection } from './responses.js';

// =====================================================
// READER: the pages that open over the Knowledge overview (an article, an experiment, a question, the definitions deck).
//   openPage(kind, id, trigger)   THE way to open any page, whatever its kind
//   goBack()                      [ CLOSE ]: back to the page you came from, or the overview
//   closeReader()                 straight back to the overview
// =====================================================

const READER_LABELS = {
  article: 'WHAT I THINK I KNOW',
  experiment: 'WHAT I WANT TO KNOW',
  question: 'WHAT I DON’T KNOW',
  definition: 'WHAT I HAVE DEFINED',
};

// Text on the reading page: [[links]] work.
const linked = richText;

// Swaps the overview for the reader and focuses [ CLOSE ].
// Scroll: animated to the top when coming from the overview, otherwise set at once (the old page is already hidden)
// or restored to `top` when returning to a page.
function showReader(label, wide = false, top = 0) {
  const fromOverview = isOpen() && !reader.classList.contains('is-open');
  readerType.textContent = `[ ${label} ]`;
  readerContent.classList.toggle('is-wide', wide);
  const show = () => showOnly([overview, reader], reader);
  if (isOpen()) show(); else instant(show);          // the layer is hidden (opened from Consume): it only fades in
  if (fromOverview && !top) animateScrollTo(view, 0);
  else view.scrollTop = top;
  closeButton.focus({ preventScroll: true });
}

// ---- Going back ---------------------------------------------------
// Opening something from a page that is already open (an article from the definitions, a definition from an
// article, a definition from Consume...) shows it as a second layer. [ CLOSE ] then returns to the page you
// came from, on the same article / definition and scroll position, instead of the Knowledge overview.
//   current  what the reader shows now: { kind, id } or null for the overview
//   trail    the pages to go back to: { kind, id, scroll }, or 'outside' when Knowledge itself was opened from
//            somewhere else (Consume), so closing the last page closes the whole layer

// Call when a page opens. `back` is the trail entry when [ CLOSE ] is returning to it (nothing to remember then).
function enter(state, trigger, back) {
  if (!back) {
    if (!nav.current) nav.returnFocus = trigger;   // opened from the overview: focus returns to that card
    else if (!(nav.current.kind === 'definition' && state.kind === 'definition')) {   // definition -> definition just swaps
      nav.trail.push({ ...nav.current, scroll: view.scrollTop });
    }
  }
  nav.current = state;
  setUrl(hashFor(state))
}

export function goBack() {
  const back = nav.trail.pop();
  if (back === 'outside') { hooks.closeLayer(); return; }
  if (!back) { closeReader(); return; }
  openPage(back.kind, back.id, null, back);
}

// THE way to open any page in the reader, whatever its kind:
//   openPage('article', 'no-advice', triggerElement)
// It picks the right screen (the definitions deck for definitions, the reader for the rest),
// and refuses (returns false) when the item does not exist, has no page of its own (media),
// `back` is only used by [ CLOSE ] to return to a page.
// Opens any page by kind + id. Returns false when there is nothing to open.
export function openPage(kind, id, trigger, back = null) {
  const item = get(kind, id);
  if (!item || !OPENABLE.has(kind)) return false;
  if (kind === 'definition') openDefinitions(id, trigger, back);
  else openReader(kind, id, trigger, back);
  return true;
}

function openReader(kind, id, trigger, back = null) {
  const item = get(kind, id);
  if (!item) return;
  enter({ kind, id }, trigger, back);
  present(() => {

    // Articles and questions have a date; experiments get no byline
    const byline = item.date
    ? `<div class="knowledge-byline"><time datetime="${esc(item.date)}">${formatDate(item.date, 'long')}</time></div>`
    : '';

    const header = `
      <header class="knowledge-article-header">
        <h1>${kind === 'question' ? linked(item.text) : esc(item.title || item.text)}</h1>
        <p class="knowledge-deck">${esc(item.subheader || item.byline || '')}</p>
        ${byline}
      </header>`;
    const prose = `<div class="knowledge-prose">${kind === 'question' ? responsesSection(item) : pageBlocks(item.blocks || [], { text: linked })}</div>`;

    // Articles and experiments use the Knowledge overview's three columns: the text in the middle, and the right
    // column holds the Consume card for whichever {{link}} is hovered. Questions keep the single narrow column.
    const essay = kind !== 'question';
    readerContent.innerHTML = essay
      ? `<div class="essay">
          <div class="knowledge-column">${header}${prose}</div>
          <aside class="knowledge-column essay-aside" aria-hidden="true"><div class="consume-peek"></div></aside>
        </div>`
      : header + prose;

    showReader(READER_LABELS[kind], essay, back?.scroll);
    nav.currentQuestionId = kind === 'question' ? item.id : null;
    if (kind === 'question') loadResponses(item.id);
  });
}

export function closeReader() {
  if (!reader.classList.contains('is-open')) return;
  nav.current = null;
  nav.trail = [];
  setUrl('#mymind');
  showOnly([overview, reader], overview);
  animateScrollTo(view, 0);
  nav.returnFocus?.focus?.({ preventScroll: true });
}

// ---- Definitions ------------------------------------------------
// One carousel of flash cards (js/media.js). The related column beside it follows the card on screen.

// The right column: whatever connects to this term (media it came from, essays that use it, ...).
// Nothing to maintain: connections come from the graph (js/content/graph.js).
const EXAMPLE_KINDS = ['article', 'experiment', 'question', 'thought', 'definition'];   // everything except media, which is where the word came from
const columnHTML = (title, text, connected) => {
  const body = text ? `<p class="definitions-text">${richText(text)}</p>` : '';
  return `<h2 class="knowledge-column-title">${title}</h2>${body}${connected}`;   // the title is always there, even when the column is empty
};
const originHTML = term => columnHTML('Origin', term.origin, connectionsHTML(term, { kinds: ['media'] }));
const exampleHTML = term => columnHTML('Used in a sentence', term.example, connectionsHTML(term, { kinds: EXAMPLE_KINDS }));

// Four equal .knowledge-column sections, the same grid as the Consume board.
//   left   every term as a Consume quote card; clicking one moves the carousel
//   middle the flash card carousel
//   origin   the term's origin text, plus any media it came from (filled in by the carousel:change handler below)
//   example  the term's example text, plus the essays and experiments that use it
const definitionsPage = start => `
  <div class="definitions">
    <nav class="knowledge-column definitions-nav" aria-label="Terms">
      <h2 class="knowledge-column-title">Words</h2>
      ${DEFINITIONS().map((term, i) => `<a href="#${esc(term.id)}" data-term-index="${i}">${esc(term.word)}</a>`).join('')}
    </nav>
    <section class="knowledge-column" aria-label="Definition">
      <h2 class="knowledge-column-title">Definition</h2>
      ${carouselHTML({
        label: 'Definitions',
        start,
        slides: DEFINITIONS().map(term => flashCard({
          front: richText(term.text),
          back: esc(term.word),
        })),
      })}
    </section>
    <aside class="knowledge-column" aria-label="Origin">
      <div data-origin></div>
    </aside>
    <aside class="knowledge-column" aria-label="Example">
      <div data-example></div>
    </aside>
  </div>`;

function openDefinitions(id, trigger, back = null) {
  const start = Math.max(0, DEFINITIONS().findIndex(term => term.id === id));
  enter({ kind: 'definition', id }, trigger, back);
  present(() => {
    nav.currentQuestionId = null;
    readerContent.innerHTML = definitionsPage(start);
    initCarousels(readerContent);                              // fires carousel:change, which fills the related column
    showReader(READER_LABELS.definition, true, back?.scroll);   // wide: the three columns use the overview's width
    $('.car', readerContent).focus({ preventScroll: true });   // so ← → turn the cards
  });
}

// The origin and example columns follow the card on screen
on(readerContent, 'carousel:change', event => {
  const origin = $('[data-origin]', readerContent);
  if (!origin) return;                                    // some other carousel, not the definitions deck
  if (nav.current?.kind === 'definition') nav.current.id = DEFINITIONS()[event.detail.index].id;   // so going back lands on this card
  setUrl(hashFor(nav.current), { replace: true });
  origin.innerHTML = originHTML(DEFINITIONS()[event.detail.index]);
  $('[data-example]', readerContent).innerHTML = exampleHTML(DEFINITIONS()[event.detail.index]);
  $$('.definitions-nav a', readerContent).forEach(link => {          // the current term is highlighted, like the active sidebar link
    const isCurrent = Number(link.dataset.termIndex) === event.detail.index;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
  });
});

// A term link in the left column moves the carousel to that definition
on(readerContent, 'click', event => {
  const termLink = event.target.closest('[data-term-index]');
  const car = $('.car', readerContent);
  if (!termLink || !car) return;
  event.preventDefault();
  car.show(Number(termLink.dataset.termIndex));
  car.focus({ preventScroll: true });                      // so ← → keep turning the cards instead of switching CREATE / CONSUME
});
