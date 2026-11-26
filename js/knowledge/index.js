import { $, on, showOnly, setOverlay } from '../dom.js';
import { get } from '../content/index.js';
import { closeButton, hooks, isOpen, knowledgeToggle, modeButtons, nav, OPENABLE, overview, reader, readerContent, view } from './state.js';
import { canSee, unlock } from './access.js';
import { renderCollections } from './collections.js';
import { questionsReady } from './questions.js';
import { LAYER_MS, instant } from './motion.js';
import { hashFor, setUrl } from './urls.js';
import { closeReader, goBack, openPage } from './reader.js';
import './peek.js';
import { setModerator } from './responses.js';
import { closeModal, setEditor } from './editor.js';

// =====================================================
// KNOWLEDGE VIEW  (the reader, the overview and the Supabase questions)
// This file wires the parts together: opening and closing the layer, the password prompt, links and deep links.
//   state.js       the elements and the shared 'where am I' state       access.js      password groups and what each may see
//   collections.js the overview lists                                  questions.js   the questions from Supabase
//   reader.js      the pages (articles, definitions, questions)         peek.js        the hover preview beside an essay
//   responses.js   visitor responses and moderation                     editor.js      adding / deleting questions
//   motion.js      the fades between pages                              urls.js        the address bar
// The content itself lives in js/content/data/ (essays, experiments, definitions, library).
// This file only DISPLAYS it. It never needs to change when you add content.
// Questions live in Supabase (visitors can respond, the editor can add questions).
// Everything that opens a page carries data-ref="kind:id"; one click handler opens it.
// =====================================================

renderCollections();   // everyone-items only, until a password is entered

hooks.closeLayer = () => setKnowledge(false);   // reader.js asks for this when [ CLOSE ] leaves the last page

// ---- Open / close Knowledge -------------------------------------

// CREATE / CONSUME look selected only while Knowledge is closed; the current mode is always body[data-mode]
const syncModeButtons = () => modeButtons.forEach(button =>
  button.setAttribute('aria-pressed', String(!isOpen() && button.dataset.mode === document.body.dataset.mode)));

// Closing the layer: it fades out showing the page you were on, and only then goes back to the overview
// (so nothing morphs mid-fade, the same as opening it).
function resetAfterClose() {
  closeModal();
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

// Unlock (once) and show only what this password allows
async function prepareKnowledge() {
  const signedIn = await unlock();
  if (!signedIn) return false;
  if (signedIn.isEditor) setEditor(signedIn.password);       // editor: also sees the add button
  if (signedIn.isModerator) setModerator(signedIn.password); // moderator: also approves / deletes responses
  renderCollections();
  return true;
}

async function openKnowledge() {
  if (!(await prepareKnowledge())) return false;
  setKnowledge(true);
  return true;
}

// Logo click: closing never needs the password; opening asks for it once.
function requestKnowledge() {
  if (isOpen()) setKnowledge(false);
  else openKnowledge();
}

// Peek on the Consume board: Knowledge is closed, so ask for the password first (same prompt as the logo).
// Once unlocked, set the page up while the layer is hidden, then fade the layer in.
// Cancel or a wrong password does nothing. [ CLOSE ] closes the whole layer.
//   open   a function that opens the page; return false from it (openPage does) to cancel quietly
//   focus  a function that moves keyboard focus once the page is showing
async function openFromOutside(open, focus) {
  if (!(await prepareKnowledge())) return;
  nav.trail = ['outside'];
  if (open() === false) { nav.trail = []; return; }   // nothing to open (unknown id, or not for this password)
  setKnowledge(true);
  focus();
}

// ONE handler for everything that points at content: inline links, Knowledge cards, "Peek into my mind".
// Media links are ordinary external links, so they are left alone. Everything else opens its page:
// straight away inside Knowledge, or after the password prompt from the Consume board.
on(document, 'click', event => {
  const link = event.target.closest('[data-ref]');
  const item = link && get(link.dataset.ref);
  if (!item || !OPENABLE.has(item.kind)) return;
  event.preventDefault();                                // must run before the password prompt (it's async)
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
on(knowledgeToggle, 'click', requestKnowledge);

// Picking CREATE or CONSUME (click or arrow keys) closes Knowledge and shows that view
on(document, 'mode:changed', () => setKnowledge(false));

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward.
const KNOWLEDGE_HASH = /^#mymind(?:\/(article|experiment|question|definition)\/([^/]+))?$/;

async function routeFromHash() {
  const match = KNOWLEDGE_HASH.exec(location.hash);

  // Not a Knowledge URL: make sure Knowledge is closed
  if (!match) { if (isOpen()) setKnowledge(false); return; }

  const [, kind, rawId] = match;
  const id = rawId && decodeURIComponent(rawId);

  if (!(await prepareKnowledge())) return;   // same password prompt as the logo; cancel / wrong = stay put
  await questionsReady;                      // questions come from Supabase

  nav.current = null;                        // a linked page starts fresh: [ CLOSE ] goes to the overview
  nav.trail = [];

  // Overview, or a page that doesn't exist / this password group can't see
  const found = kind && get(kind, id);
  const allowed = found && OPENABLE.has(kind) && canSee(found);

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
