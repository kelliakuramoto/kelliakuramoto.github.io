import { $, on, showOnly, setOverlay } from '../dom.js';
import { get } from '../content/index.js';
import { closeButton, hooks, isOpen, knowledgeToggle, modeButtons, nav, OPENABLE, overview, reader, readerContent, readerType, view } from './state.js';
import { renderCollections } from './collections.js';
import { questionsReady } from './questions.js';
import { LAYER_MS, instant } from './motion.js';
import { hashFor, setUrl } from './urls.js';
import { closeReader, goBack, openPage } from './reader.js';
import './peek.js';

// =====================================================
// KNOWLEDGE VIEW  (the reader, the overview and the Supabase questions)
// This file wires the parts together: opening and closing the layer, links and deep links.
//   state.js       the elements and the shared 'where am I' state
//   collections.js the overview lists                                  questions.js   the questions from Supabase
//   reader.js      the pages (articles, definitions, questions)         peek.js        the hover preview beside an essay
//   responses.js   visitors' responses to a question
//   motion.js      the fades between pages                              urls.js        the address bar
// The content itself lives in js/content/data/ (essays, experiments, definitions, library).
// This file only DISPLAYS it. It never needs to change when you add content.
// Questions live in Supabase (visitors can respond).
// Everything that opens a page carries data-ref="kind:id"; one click handler opens it.
// =====================================================

renderCollections();

hooks.closeLayer = () => setKnowledge(false);   // reader.js asks for this when [ CLOSE ] leaves the last page

// ---- Open / close Knowledge -------------------------------------

// CREATE / CONSUME look selected only while Knowledge is closed; the current mode is always body[data-mode]
const syncModeButtons = () => modeButtons.forEach(button =>
  button.setAttribute('aria-pressed', String(!isOpen() && button.dataset.mode === document.body.dataset.mode)));

// Closing the layer: it fades out showing the page you were on, and only then goes back to the overview
// (so nothing morphs mid-fade, the same as opening it).
function resetAfterClose() {
  nav.current = null;
  nav.trail = [];
  nav.returnFocus?.focus?.({ preventScroll: true });
  setTimeout(() => {
    if (isOpen()) return;                             // reopened in the meantime
    instant(() => showOnly([overview, reader], overview));
    view.scrollTop = 0;
  }, LAYER_MS + 50);
}

function setKnowledge(open) {
  if (open === isOpen()) return;
  if (!open) resetAfterClose();

  setOverlay(view, open);
  document.body.classList.toggle('knowledge-open', open);
  knowledgeToggle.setAttribute('aria-pressed', String(open));
  knowledgeToggle.setAttribute('aria-label', open ? 'Close Knowledge view' : 'Open Knowledge view');
    syncModeButtons();

  // Opening shows the current page (or the overview); closing restores the hash from before
  if (open) setUrl(hashFor(nav.current));
  else if (location.hash.startsWith('#mymind')) setUrl(nav.hashBefore);
}

// Logo click: opens or closes the layer
function requestKnowledge() {
  setKnowledge(!isOpen());
}

// A link on the Consume board: Knowledge is closed, so set the page up while the layer is hidden, then fade the layer in.
// [ CLOSE ] closes the whole layer.
//   open   a function that opens the page; return false from it (openPage does) to cancel quietly
//   focus  a function that moves keyboard focus once the page is showing
function openFromOutside(open, focus) {
  nav.trail = ['outside'];
  if (open() === false) { nav.trail = []; return; }   // nothing to open (unknown id)
  setKnowledge(true);
  focus();
}

// ONE handler for everything that points at content: inline links, Knowledge cards, "Peek into my mind".
// Media links are ordinary external links, so they are left alone. Everything else opens its page:
// straight away inside Knowledge, or from the Consume board.
on(document, 'click', event => {
  const link = event.target.closest('[data-ref]');
  const item = link && get(link.dataset.ref);
  if (!item || !OPENABLE.has(item.kind)) return;
  event.preventDefault();
  if (isOpen()) { openPage(item.kind, item.id, link); return; }

  openFromOutside(
    () => openPage(item.kind, item.id, link),
    () => (item.kind === 'definition' ? $('.car', readerContent) : closeButton)?.focus({ preventScroll: true })
  );
});

// ---- Events -----------------------------------------------------

// Cards are article[role=button], so they need Enter / Space themselves.
// (Only when the card itself has focus, so links on a flash card's back still work.)
on(view, 'keydown', event => {
  const card = event.target.closest('.c-card[role="button"]');
  if (card === event.target && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    card.click();
  }
});

on(closeButton, 'click', goBack);
on(readerType, 'click', closeReader);   // the section name at the top left goes straight back to the Knowledge overview
on(knowledgeToggle, 'click', requestKnowledge);

// Picking CREATE or CONSUME (click or arrow keys) closes Knowledge and shows that view
on(document, 'mode:changed', () => setKnowledge(false));

// Back from a case study opened by a [[project:id]] link (js/navigation.js): reopen the Knowledge page it was opened from, at the same scroll position
on(document, 'knowledge:return', async ({ detail: { hash, scroll } }) => {
  const match = KNOWLEDGE_HASH.exec(hash);
  if (!match) return;
  const [, kind, rawId] = match;
  const id = rawId && decodeURIComponent(rawId);
  await questionsReady;
  nav.current = null;
  nav.trail = [];
  if (!(kind && openPage(kind, id, null, { kind, id, scroll }))) setUrl('#mymind', { replace: true });
  setKnowledge(true);
});

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward.
const KNOWLEDGE_HASH = /^#mymind(?:\/(article|experiment|question|definition)\/([^/]+))?$/;

async function routeFromHash() {
  const match = KNOWLEDGE_HASH.exec(location.hash);

  // Not a Knowledge URL: make sure Knowledge is closed
  if (!match) { if (isOpen()) setKnowledge(false); return; }

  const [, kind, rawId] = match;
  const id = rawId && decodeURIComponent(rawId);

  await questionsReady;                      // questions come from Supabase

  nav.current = null;                        // a linked page starts fresh: [ CLOSE ] goes to the overview
  nav.trail = [];

  // Overview, or a page that doesn't exist
  const found = kind && get(kind, id);
  const allowed = found && OPENABLE.has(kind);

  if (!allowed) {
    if (reader.classList.contains('is-open')) closeReader();
    setUrl('#mymind', { replace: true });
    setKnowledge(true);
    return;
  }

  openPage(kind, id, null);
  setKnowledge(true);
}

window.addEventListener('popstate', routeFromHash);
routeFromHash();
