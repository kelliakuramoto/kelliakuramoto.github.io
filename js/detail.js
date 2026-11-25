import { $, on, setFlipped } from './dom.js';
import { get } from './content/index.js';
import { detailHTML, hasDetail } from './content/kinds.js';

// =====================================================
// CONSUME DETAIL PAGE
// Clicking a card with data-detail="media:id" fades in this page over the board (the same fade as the
// Knowledge layer). What is on it comes from the graph: see detailParts() in js/content/kinds.js.
// Its header says CONSUME. The pieces are shuffled every time it opens.
// The open page is mirrored in the address bar as #consume/media/<id>, so it can be linked to and Back / Forward work.
// A link to a book, podcast or poem inside an essay does what its card on the board does: with something attached it opens this
// page on top of the essay (and the link is not followed); with nothing attached it follows the link as before.
// =====================================================

const page = $('#consumeDetail');
const content = $('#consumeDetailContent');
const closeButton = $('#consumeDetailClose');
const board = $('#consumeView');
const knowledge = $('#knowledgeView');
let returnFocus = null;
let openRef = null;
let underRef = null;   // a page that was open beneath Knowledge when this one opened over it: brought back when this one closes
let hashBefore = '';   // the hash to restore when the page closes

const isOpen = () => page.classList.contains('is-open');

// ---- URLs ---------------------------------------------------------
const DETAIL_HASH = /^#consume\/media\/([^/]+)$/;

function setUrl(next) {
  if (location.hash === next) return;
  history.pushState(null, '', location.pathname + location.search + next);
}

// `over`: opened from a link inside Knowledge, so the page goes on top of the essay (and the essay can't be clicked behind it).
function open(ref, trigger, { updateUrl = true, over = false } = {}) {
  const item = get(ref);
  if (!item || !hasDetail(item)) return false;
  const showing = isOpen() && openRef === ref;
  if (over && isOpen()) underRef = openRef;   // remember the page beneath the essay
  returnFocus = trigger;
  openRef = ref;
  if (!showing) {   // the same page, already open beneath the essay, just comes to the front
    content.innerHTML = detailHTML(item);
    page.scrollTop = 0;
  }
  page.classList.add('is-open');
  page.classList.toggle('is-over-knowledge', over);
  page.setAttribute('aria-hidden', 'false');
  document.body.classList.add('consume-detail-open');
  board.inert = true;   // nothing behind the page can be tabbed to or clicked while it is open
  knowledge.inert = over;
  closeButton.focus({ preventScroll: true });
  if (updateUrl) {
    if (!DETAIL_HASH.test(location.hash)) hashBefore = location.hash;
    setUrl(`#consume/${ref.replace(':', '/')}`);
  }
  return true;
}

function close({ updateUrl = true } = {}) {
  if (!isOpen()) return;
  const wasOver = page.classList.contains('is-over-knowledge');
  page.classList.remove('is-over-knowledge');
  knowledge.inert = false;
  if (updateUrl && DETAIL_HASH.test(location.hash)) setUrl(hashBefore);
  if (wasOver && underRef) {   // back to the essay, with the page that was beneath it showing again
    if (underRef !== openRef) {   // a different page was opened on top: put the one beneath back
      content.innerHTML = detailHTML(get(underRef));
      page.scrollTop = 0;
    }
    openRef = underRef;
    underRef = null;
    returnFocus?.focus?.({ preventScroll: true });
    return;
  }
  underRef = null;
  openRef = null;
  board.inert = false;
  page.classList.remove('is-open');
  page.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('consume-detail-open');
  returnFocus?.focus?.({ preventScroll: true });
}

on(document, 'click', event => {
  const card = event.target.closest('[data-detail]');
  if (card) open(card.dataset.detail, card);
});
// A link to a book, podcast or poem in an essay (or its References list): the same as clicking its card on the board.
// Ctrl / Cmd / Shift / middle click still follow the link, as in any browser.
on(document, 'click', event => {
  const link = event.target.closest('.consume-link[data-ref]');
  const item = link && get(link.dataset.ref);
  if (!item || !hasDetail(item) || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();   // do not follow the link: the page opens instead
  open(link.dataset.ref, link, { over: document.body.classList.contains('knowledge-open') });
});
// Cards are article[role=button]: Enter / Space open them too
on(document, 'keydown', event => {
  const card = event.target.closest?.('[data-detail], #consumeDetailContent [data-ref], span.consume-link[data-ref]');   // cards on the board, cards on the page that open Knowledge, and essay links with no web address
  if (card === event.target && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); card.click(); }
  if (event.key === 'Escape' && isOpen() && (page.classList.contains('is-over-knowledge') || !document.body.classList.contains('knowledge-open'))) close();
});
on(closeButton, 'click', () => close());
on(document, 'mode:changed', () => close());

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward. A link to an item that does not exist, or has nothing attached, is cleared.
function routeFromHash() {
  const match = DETAIL_HASH.exec(location.hash);
  if (!match) {
    // Knowledge (#mymind/...) opens on top of this page, so the page stays while it is open.
    // A page that is itself on top of Knowledge closes when Back returns to the essay.
    if (isOpen() && (page.classList.contains('is-over-knowledge') || !location.hash.startsWith('#mymind'))) close({ updateUrl: false });
    return;
  }
  const ref = `media:${decodeURIComponent(match[1])}`;
  if (openRef === ref) return;
  if (document.body.dataset.mode !== 'consume') $('.mode-btn[data-mode="consume"]')?.click();
  if (!open(ref, null, { updateUrl: false })) {
    close({ updateUrl: false });
    history.replaceState(null, '', location.pathname + location.search);
  }
}

window.addEventListener('popstate', routeFromHash);
routeFromHash();

// Definitions on this page open their Knowledge page (js/knowledge.js handles data-ref); any flash card without data-ref still turns over
on(content, 'click', event => {
  const card = event.target.closest('.c-flash');
  if (card && !event.target.closest('[data-ref]')) setFlipped(card, !card.classList.contains('is-flipped'));
});
