import { $, on, setHash } from './dom.js';
import { get, refKey } from './content/index.js';
import { detailHTML, detailTarget, hasDetail } from './content/kinds.js';

// =====================================================
// CONSUME DETAIL PAGE
// Clicking a card with data-detail="media:id" fades in this page over the board (the same fade as the
// Knowledge layer). What is on it comes from the graph: see detailParts() in js/content/kinds.js.
// Its header says CONSUME. The pieces are shuffled every time it opens.
// A page opened from a link on another page (a thought, a quote's parent...) fades in on top of it, and closing it fades back to that page.
// The open page is mirrored in the address bar as #consume/media/<id>, so it can be linked to and Back / Forward work.
// A link to a book, podcast or poem inside an essay does what its card on the board does: with something attached it opens this
// page on top of the essay (and the link is not followed); with nothing attached it follows the link as before.
// =====================================================

const base = $('#consumeDetail');
const board = $('#consumeView');
const knowledge = $('#knowledgeView');

// The open pages, bottom to top. The first is the markup in index.html; a page opened from another one is a copy of it on top,
// so it fades in over the page it came from, and closing it fades back to that page exactly as it was (scroll position and all).
//   over   it was opened from a link inside Knowledge, so it sits on top of the Knowledge layer too
const layers = [];   // { ref, el, over, returnFocus }
let hashBefore = '';   // the hash to restore when the last page closes

const top = () => layers[layers.length - 1];
const isOpen = () => layers.length > 0;
const contentOf = el => el.querySelector('.consume-detail-content');
const hashFor = ref => `#consume/${ref.replace(':', '/')}`;

// ---- URLs ---------------------------------------------------------
const DETAIL_HASH = /^#consume\/media\/([^/]+)$/;

// The page for the next layer: the one in index.html first, then copies of it (without the ids, which must stay unique).
function newLayerElement() {
  if (!isOpen()) return base;
  const el = base.cloneNode(true);
  el.removeAttribute('id');
  el.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
  el.classList.remove('is-open', 'is-over-knowledge');
  el.style.setProperty('--layer', layers.length);   // stacks above the page beneath it (see .consume-detail in styles.css)
  base.after(el);
  return el;
}

// `over`: opened from a link inside Knowledge, so the page goes on top of the essay (and the essay can't be clicked behind it).
function open(ref, trigger, { updateUrl = true, over = false } = {}) {
  const item = get(ref);
  if (!item || !hasDetail(item)) return false;
  if (top()?.ref === ref) {   // already the page on top: it just comes to the front
    top().el.classList.toggle('is-over-knowledge', over);
    top().over = over;
    knowledge.inert = over;
    top().el.querySelector('[data-detail-close]').focus({ preventScroll: true });
    return true;
  }
  const el = newLayerElement();
  const layer = { ref, el, over, returnFocus: trigger };
  contentOf(el).innerHTML = detailHTML(item);
  el.scrollTop = 0;
  layers.forEach(other => { other.el.inert = true; });   // only the page on top can be tabbed to or clicked
  layers.push(layer);
  el.inert = false;
  el.classList.toggle('is-over-knowledge', over);
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('consume-detail-open');
  board.inert = true;   // nothing behind the page can be tabbed to or clicked while it is open
  knowledge.inert = over;
  void el.offsetWidth;   // a page that was only just added starts hidden, so the fade runs
  el.classList.add('is-open');
  el.querySelector('[data-detail-close]').focus({ preventScroll: true });
  if (updateUrl) {
    if (!DETAIL_HASH.test(location.hash)) hashBefore = location.hash;
    setHash(hashFor(ref));
  }
  return true;
}

// Closes the page on top with the same fade it came in with; the page beneath is still there, as it was.
function closeTop({ updateUrl = true } = {}) {
  const layer = layers.pop();
  if (!layer) return;
  const { el } = layer;
  const next = top();
  if (next) {
    next.el.inert = false;
    knowledge.inert = next.over;
  } else {
    knowledge.inert = false;
    board.inert = false;
    document.body.classList.remove('consume-detail-open');
  }
  if (updateUrl && DETAIL_HASH.test(location.hash)) setHash(next && !layer.over ? hashFor(next.ref) : hashBefore);
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  el.inert = true;
  // once it has faded out: a copy is thrown away; the page in index.html is just put back as it was
  setTimeout(() => {
    if (el !== base) el.remove();
    else if (!layers.includes(layer) && !el.classList.contains('is-open')) el.classList.remove('is-over-knowledge');
  }, (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000 + 50);
  layer.returnFocus?.focus?.({ preventScroll: true });
}

// Every page, one fade each; only the last one touches the address bar.
function closeAll({ updateUrl = true } = {}) {
  while (layers.length > 1) closeTop({ updateUrl: false });
  closeTop({ updateUrl });
}

on(document, 'click', event => {
  const card = event.target.closest('[data-detail]');
  if (card && !event.target.closest('[data-ref]')) open(card.dataset.detail, card, { over: document.body.classList.contains('knowledge-open') });   // a link inside the card does its own thing
});
// A link to a book, podcast or poem in an essay (or its References list): the same as clicking its card on the board.
// Ctrl / Cmd / Shift / middle click still follow the link, as in any browser.
on(document, 'click', event => {
  const link = event.target.closest('.consume-link[data-ref]');
  const item = link && get(link.dataset.ref);
  const target = item && detailTarget(item);   // the item's own page, or its parent's when it is a child (a quote inside a book)
  if (!target || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();   // do not follow the link: the page opens instead
  open(refKey(target.kind, target.id), link, { over: document.body.classList.contains('knowledge-open') });
});
// Cards are article[role=button]: Enter / Space open them too
on(document, 'keydown', event => {
  const card = event.target.closest?.('[data-detail], .consume-detail [data-ref], span.consume-link[data-ref]');   // cards on the board, cards on the page that open Knowledge, and essay links with no web address
  if (card === event.target && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); card.click(); }
  if (event.key === 'Escape' && isOpen() && (top().over || !document.body.classList.contains('knowledge-open'))) closeTop();
});
on(document, 'click', event => { if (event.target.closest('[data-detail-close]')) closeTop(); });
// [ CONSUME ] goes straight to the board: the same as picking CONSUME in the toggle, which also closes every page and Knowledge
on(document, 'click', event => { if (event.target.closest('[data-detail-home]')) $('.mode-btn[data-mode="consume"]').click(); });
on(document, 'mode:changed', () => closeAll());

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward. A link to an item that does not exist, or has nothing attached, is cleared.
function routeFromHash() {
  const match = DETAIL_HASH.exec(location.hash);
  if (!match) {
    // Knowledge (#mymind/...) opens on top of this page, so the page stays while it is open.
    // A page that is itself on top of Knowledge closes when Back returns to the essay.
    if (!isOpen()) return;
    if (top().over) closeTop({ updateUrl: false });
    else if (!location.hash.startsWith('#mymind')) closeAll({ updateUrl: false });
    return;
  }
  const ref = `media:${decodeURIComponent(match[1])}`;
  if (top()?.ref === ref) return;
  const beneath = layers.findIndex(layer => layer.ref === ref);
  if (beneath >= 0) {   // Back to a page that is already open beneath: close what is on top of it
    while (layers.length - 1 > beneath) closeTop({ updateUrl: false });
    return;
  }
  if (document.body.dataset.mode !== 'consume') $('.mode-btn[data-mode="consume"]')?.click();
  if (!open(ref, null, { updateUrl: false })) {
    closeAll({ updateUrl: false });
    history.replaceState(null, '', location.pathname + location.search);
  }
}

window.addEventListener('popstate', routeFromHash);
routeFromHash();

// Definitions on this page open their Knowledge page: js/knowledge/index.js handles data-ref
