import { $, on, setFlipped } from './dom.js';
import { get } from './content/index.js';
import { detailHTML, hasDetail } from './content/kinds.js';

// =====================================================
// CONSUME DETAIL PAGE
// Clicking a card with data-detail="media:id" fades in this page over the board (the same fade as the
// Knowledge layer). What is on it comes from the graph: see detailParts() in js/content/kinds.js.
// Its header says CONSUME. The pieces are shuffled every time it opens.
// The open page is mirrored in the address bar as #consume/media/<id>, so it can be linked to and Back / Forward work.
// =====================================================

const page = $('#consumeDetail');
const content = $('#consumeDetailContent');
const closeButton = $('#consumeDetailClose');
const board = $('#consumeView');
let returnFocus = null;
let openRef = null;
let hashBefore = '';   // the hash to restore when the page closes

const isOpen = () => page.classList.contains('is-open');

// ---- URLs ---------------------------------------------------------
const DETAIL_HASH = /^#consume\/media\/([^/]+)$/;

function setUrl(next) {
  if (location.hash === next) return;
  history.pushState(null, '', location.pathname + location.search + next);
}

function open(ref, trigger, { updateUrl = true } = {}) {
  const item = get(ref);
  if (!item || !hasDetail(item)) return false;
  returnFocus = trigger;
  openRef = ref;
  content.innerHTML = detailHTML(item);
  page.scrollTop = 0;
  page.classList.add('is-open');
  page.setAttribute('aria-hidden', 'false');
  document.body.classList.add('consume-detail-open');
  board.inert = true;   // nothing behind the page can be tabbed to or clicked while it is open
  closeButton.focus({ preventScroll: true });
  if (updateUrl) {
    if (!DETAIL_HASH.test(location.hash)) hashBefore = location.hash;
    setUrl(`#consume/${ref.replace(':', '/')}`);
  }
  return true;
}

function close({ updateUrl = true } = {}) {
  if (!isOpen()) return;
  openRef = null;
  board.inert = false;
  page.classList.remove('is-open');
  page.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('consume-detail-open');
  returnFocus?.focus?.({ preventScroll: true });
  if (updateUrl && DETAIL_HASH.test(location.hash)) setUrl(hashBefore);
}

on(document, 'click', event => {
  const card = event.target.closest('[data-detail]');
  if (card) open(card.dataset.detail, card);
});
// Cards are article[role=button]: Enter / Space open them too
on(document, 'keydown', event => {
  const card = event.target.closest?.('[data-detail], #consumeDetailContent [data-ref]');   // cards on the board, and cards on the page that open Knowledge
  if (card === event.target && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); card.click(); }
  if (event.key === 'Escape' && isOpen() && !document.body.classList.contains('knowledge-open')) close();
});
on(closeButton, 'click', () => close());
on(document, 'mode:changed', () => close());

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward. A link to an item that does not exist, or has nothing attached, is cleared.
function routeFromHash() {
  const match = DETAIL_HASH.exec(location.hash);
  if (!match) {
    // Knowledge (#mymind/...) opens on top of this page, so the page stays while it is open
    if (isOpen() && !location.hash.startsWith('#mymind')) close({ updateUrl: false });
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
