import { $, $$, esc, on, showOnly } from './dom.js';
import { quoteCard, flashCard } from './cards.js';
import { animateScrollTo, isMobile } from './navigation.js';
import { supabase } from './supabase.js';
import { all, get, register } from './content/index.js';
import { richText } from './content/richtext.js';
import { cardFor, peekFor, connectionsHTML, formatDate, refAttrs } from './content/kinds.js';
import { articleCard } from './cards.js';
import { carouselHTML, initCarousels } from './media.js';

// =====================================================
// KNOWLEDGE VIEW  (the reader, the overview and the Supabase questions)
// The content itself lives in js/content/data/ (essays, experiments, definitions, library).
// This file only DISPLAYS it. It never needs to change when you add content.
// Questions live in Supabase (visitors can respond, the editor can add questions).
// Everything that opens a page carries data-ref="kind:id"; one click handler opens it.
// =====================================================

// Kinds that have a page of their own in the reader (media just opens its url)
const OPENABLE = new Set(['article', 'experiment', 'question', 'definition']);

// ---- Rendering --------------------------------------------------

// The single row that opens the definitions: the same articleCard as the articles below it
const definitionsRow = () => articleCard({
  title: 'Shortcuts to my shared language',
  sub: `${DEFINITIONS().length} concepts to help you understand my mind`,
  attrs: refAttrs({ kind: 'definition', id: DEFINITIONS()[0].id, title: 'Shortcuts to my shared language' }),
});

function renderInto(selector, items, toHTML) {
  const root = $(selector);
  if (root) root.innerHTML = items.map(item => toHTML(item)).join('');
}

// Questions come from Supabase. Each one is a Consume quote card that opens the reader,
// the same way articles and experiments do.
let QUESTIONS = [];
// Every definition, read from the graph each time (so a definition added to data/definitions.js just appears).
// A function rather than a constant, because the graph is the single source of truth.
const DEFINITIONS = () => all('definition');


async function loadQuestions() {
  const { data, error } = await supabase.from('questions').select('*').order('created_at');
  if (error) { console.error('Questions failed to load:', error.code, error.message); return; }
  // date and subheader feed the same reader header that articles use
  QUESTIONS = data;
  // Questions join the content graph, so essays and definitions can [[link]] to them by id
  // (an optional `links` text[] column on the table lets a question point at others too).
  register('question', QUESTIONS, { texts: q => [q.text], idOf: q => q.text });
  renderInto('#knowledgeQuestions', QUESTIONS, cardFor);
}
// Starts loading right away; routeFromHash awaits this promise so a pasted question link waits for its data.
const questionsReady = loadQuestions();

// Which password group is signed in: null until unlocked, 'all' for the editor / moderator.
// An article or experiment with `access: ['friends']` only shows for that group; no `access` = everyone.
let accessGroup = null;
const canSee = item => accessGroup === 'all' || !item.access || item.access.includes(accessGroup);

// Newest first. ISO dates (YYYY-MM-DD) sort correctly as plain strings.
const newestFirst = (a, b) => (b.date || '').localeCompare(a.date || '');

function renderCollections() {
  const articles = all('article').filter(canSee).sort(newestFirst).map(item => cardFor(item)).join('');
  const root = $('#knowledgeArticles');
  if (root) root.innerHTML = definitionsRow() + articles;   // definitions always sit on top
  renderInto('#knowledgeExperiments', all('experiment').filter(canSee), cardFor);
}

renderCollections();   // everyone-items only, until a password is entered

function blockHTML(block) {
  const text = richText(block.text || '', { canSee });
  switch (block.type) {
    case 'heading': return `<h2>${text}</h2>`;
    case 'subheading': return `<h3>${text}</h3>`;
    case 'quote': return `<blockquote class="knowledge-quote">${text}</blockquote>`;
    case 'underline': return `<p><span class="knowledge-underline">${text}</span></p>`;
    case 'image': return `<figure class="knowledge-inline-image"><img src="${esc(block.src || '')}" alt="${esc(block.alt || '')}">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}</figure>`;
    case 'divider': return '<hr class="knowledge-divider">';
    case 'list': return `<ul>${(block.items || []).map(item => `<li>${richText(item, { canSee })}</li>`).join('')}</ul>`;
    case 'numbered-list': return `<ol>${(block.items || []).map(item => `<li>${richText(item, { canSee })}</li>`).join('')}</ol>`;
    default: return `<p>${text}</p>`;
  }
}

// ---- Reader -----------------------------------------------------

const view = $('#knowledgeView');
const overview = $('#knowledgeOverview');
const reader = $('#knowledgeReader');
const readerContent = $('#knowledgeReaderContent');
const readerType = $('#knowledgeReaderType');
const closeButton = $('#knowledgeClose');
const knowledgeToggle = $('#knowledgeToggle');
const modeButtons = $$('.mode-btn');

const READER_LABELS = {
  article: 'WHAT I THINK I KNOW',
  experiment: 'WHAT I WANT TO KNOW',
  question: 'WHAT I DON’T KNOW',
  definition: 'WHAT I HAVE DEFINED',
};

// ---- Motion: every page change uses the same fades as the CSS ----
// Durations come from the same tokens as the CSS (both are 0 for reduced motion).
const cssSeconds = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) * 1000 || 0;
const VIEW_MS = cssSeconds('--motion-view');       // overview <-> reader crossfade
const LAYER_MS = cssSeconds('--motion-view');    // the whole Knowledge layer fading in / out
const EASE_OUT = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() || 'ease-out';

// Runs `change` with the CSS transitions switched off, so it takes effect at once (used while the layer is hidden)
function instant(change) {
  const els = [overview, reader];
  els.forEach(el => { el.style.transition = 'none'; });
  change();
  void reader.offsetWidth;                          // apply it before the transitions come back
  els.forEach(el => { el.style.transition = ''; });
}

// Page -> page while the reader is already open: fade out, swap, fade in, over the same time and ease-out
// as the overview <-> reader crossfade. From the overview (or a hidden layer) the CSS crossfade does the work.
function present(render) {
  if (!reader.classList.contains('is-open') || !isOpen() || !VIEW_MS) { render(); return; }
  const half = VIEW_MS / 2;
  const fade = (from, to, fill) => [readerType, readerContent].map(el =>
    el.animate([{ opacity: from }, { opacity: to }], { duration: half, easing: EASE_OUT, fill }));
  const out = fade(1, 0, 'forwards');
  out[0].finished.then(() => {
    render();
    fade(0, 1, 'none');
    out.forEach(animation => animation.cancel());
  });
}

// Swaps the overview for the reader and focuses [ CLOSE ].
// Scroll: animated to the top when coming from the overview, otherwise set at once (the old page is already hidden)
// or restored to `top` when returning to a page.
function showReader(label, wide = false, top = 0) {
  const fromOverview = isOpen() && !reader.classList.contains('is-open');
  readerType.textContent = label;
  readerContent.classList.toggle('is-wide', wide);
  const show = () => showOnly([overview, reader], reader);
  if (isOpen()) show(); else instant(show);          // the layer is hidden (opened from Consume): it only fades in
  if (fromOverview && !top) animateScrollTo(view, 0);
  else view.scrollTop = top;
  closeButton.focus({ preventScroll: true });
}

let returnFocus = null;
let currentQuestionId = null;

// ---- URLs ---------------------------------------------------------
// Whatever is open in Knowledge is mirrored in the address bar as #knowledge/<kind>/<id>,
// so any page can be linked to directly and the browser Back button works.
let hashBeforeKnowledge = '';   // the hash to restore when Knowledge closes (e.g. #bizbuysell)

const hashFor = state =>
  state ? `#mymind/${state.kind}/${encodeURIComponent(state.id)}` : '#mymind';

function setUrl(next, { replace = false } = {}) {
  if (location.hash === next) return;   // already there (e.g. we got here via Back / a pasted link)
  if (next.startsWith('#mymind') && !location.hash.startsWith('#mymind')) {
    hashBeforeKnowledge = location.hash;
  }
  history[replace ? 'replaceState' : 'pushState'](null, '', location.pathname + location.search + next);
}

// ---- Going back ---------------------------------------------------
// Opening something from a page that is already open (an article from the definitions, a definition from an
// article, a definition from Consume...) shows it as a second layer. [ CLOSE ] then returns to the page you
// came from, on the same article / definition and scroll position, instead of the Knowledge overview.
//   current  what the reader shows now: { kind, id } or null for the overview
//   trail    the pages to go back to: { kind, id, scroll }, or 'outside' when Knowledge itself was opened from
//            somewhere else (Consume), so closing the last page closes the whole layer
let current = null;
let trail = [];

// Call when a page opens. `back` is the trail entry when [ CLOSE ] is returning to it (nothing to remember then).
function enter(state, trigger, back) {
  if (!back) {
    if (!current) returnFocus = trigger;   // opened from the overview: focus returns to that card
    else if (!(current.kind === 'definition' && state.kind === 'definition')) {   // definition -> definition just swaps
      trail.push({ ...current, scroll: view.scrollTop });
    }
  }
  current = state;
  setUrl(hashFor(state))
}

function goBack() {
  const back = trail.pop();
  if (back === 'outside') { setKnowledge(false); return; }
  if (!back) { closeReader(); return; }
  openPage(back.kind, back.id, null, back);
}

// THE way to open any page in the reader, whatever its kind:
//   openPage('article', 'no-advice', triggerElement)
// It picks the right screen (the definitions deck for definitions, the reader for the rest),
// and refuses (returns false) when the item does not exist, has no page of its own (media),
// or is not visible to the current password group. `back` is only used by [ CLOSE ] to return to a page.
// Opens any page by kind + id. Returns false when there is nothing to open or the viewer may not see it.
function openPage(kind, id, trigger, back = null) {
  const item = get(kind, id);
  if (!item || !OPENABLE.has(kind) || !canSee(item)) return false;
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
        <h1>${esc(item.title || item.text)}</h1>
        <p class="knowledge-deck">${esc(item.subheader || item.byline || '')}</p>
        ${byline}
        ${kind === 'question' && editorPassword ? `<button type="button" class="question-delete" data-delete-question="${esc(item.id)}">[ DELETE QUESTION ]</button>` : ''}
      </header>`;
    const prose = `<div class="knowledge-prose">${kind === 'question' ? responsesSection(item) : (item.blocks || []).map(blockHTML).join('')}</div>`;

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
    currentQuestionId = kind === 'question' ? item.id : null;
    if (kind === 'question') loadResponses(item.id);
  });
}

function closeReader() {
  if (!reader.classList.contains('is-open')) return;
  current = null;
  trail = [];
  setUrl('#mymind');
  showOnly([overview, reader], overview);
  animateScrollTo(view, 0);
  returnFocus?.focus?.({ preventScroll: true });
}

// ---- Definitions ------------------------------------------------
// One carousel of flash cards (js/media.js). The related column beside it follows the card on screen.

// The right column: whatever connects to this term (media it came from, essays that use it, ...).
// Nothing to maintain: connections come from the graph (js/content/graph.js).
const relatedHTML = term => connectionsHTML(term, { canSee });

// Same structure as the Knowledge overview: three .knowledge-column sections (1fr 2fr 1fr).
//   left   every term as a Consume quote card; clicking one moves the carousel
//   middle the flash card carousel
//   right  where the term shows up (filled in by the carousel:change handler below)
const definitionsPage = start => `
  <div class="definitions">
    <nav class="knowledge-column definitions-nav" aria-label="Terms">
      ${DEFINITIONS().map((term, i) => `<a href="#${esc(term.id)}" data-term-index="${i}">${esc(term.word)}</a>`).join('')}
    </nav>
    <section class="knowledge-column" aria-label="Definition">
      ${carouselHTML({
        label: 'Definitions',
        start,
        slides: DEFINITIONS().map(term => flashCard({
          front: richText(term.text, { canSee }),
          back: esc(term.word),
          foot: term.word,
        })),
      })}
    </section>
    <aside class="knowledge-column definitions-related" aria-label="Connections">
      <div data-related></div>
    </aside>
  </div>`;

function openDefinitions(id, trigger, back = null) {
  const start = Math.max(0, DEFINITIONS().findIndex(term => term.id === id));
  enter({ kind: 'definition', id }, trigger, back);
  present(() => {
    currentQuestionId = null;
    readerContent.innerHTML = definitionsPage(start);
    initCarousels(readerContent);                              // fires carousel:change, which fills the related column
    showReader(READER_LABELS.definition, true, back?.scroll);   // wide: the three columns use the overview's width
    $('.car', readerContent).focus({ preventScroll: true });   // so ← → turn the cards
  });
}

// Flash cards: a click (or Enter / Space) turns the card over. Links on the back don't.
function setFlipped(card, flipped) {
  card.classList.toggle('is-flipped', flipped);
  card.setAttribute('aria-pressed', String(flipped));
  card.querySelector('.c-flash-back').inert = !flipped;
}

on(readerContent, 'click', event => {
  const card = event.target.closest('.c-flash');
  if (card && !event.target.closest('[data-ref]')) setFlipped(card, !card.classList.contains('is-flipped'));
});

// The related column follows the card on screen; cards that were turned over turn back
on(readerContent, 'carousel:change', event => {
  const related = $('[data-related]', readerContent);
  if (!related) return;                                    // some other carousel, not the definitions deck
  if (current?.kind === 'definition') current.id = DEFINITIONS()[event.detail.index].id;   // so going back lands on this card
  setUrl(hashFor(current), { replace: true });
  related.innerHTML = relatedHTML(DEFINITIONS()[event.detail.index]);
  $$('.car-slide:not(.active) .c-flash.is-flipped', readerContent).forEach(card => setFlipped(card, false));
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

// ---- Peek beside the essay (previews are drawn by peekFor in js/content/kinds.js) --------------------------------------
// Hovering (or focusing) a link in the essay shows a small preview of what it points at, level with the link.
// On mobile (no room beside the essay) CSS floats it above the toggle bar instead.
const PEEK_LINKS = '.ref-link';

// The preview for any link: what the item looks like as a small card (js/content/kinds.js decides)
// The preview HTML for a hovered link. Works for every kind: the graph finds the item from data-ref,
// and kinds.js decides how it looks (peekFor). Returns '' / undefined when there is nothing to show.
const peekCard = link => {
  const item = get(link.dataset.ref);
  return item && peekFor(item);
};

function showPeek(link) {
  const peek = $('.consume-peek', readerContent);
  const card = peek && peekCard(link);
  if (!card) return;                                       // not an essay page, or an unknown id
  peek.innerHTML = card;
  if (!isMobile.matches) {
    // Keep the card on screen: level with the link, but never above the top or below the bottom of the view
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const box = view.getBoundingClientRect();
    const y = Math.max(box.top + rem, Math.min(link.getBoundingClientRect().top, box.bottom - peek.offsetHeight - rem));
    peek.style.top = `${y - peek.parentElement.getBoundingClientRect().top}px`;
  }
  peek.classList.add('is-visible');
}

const hidePeek = () => $('.consume-peek', readerContent)?.classList.remove('is-visible');

on(readerContent, 'mouseover', event => { const link = event.target.closest(PEEK_LINKS); if (link) showPeek(link); });
on(readerContent, 'mouseout', event => { if (event.target.closest(PEEK_LINKS)) hidePeek(); });
on(readerContent, 'focusin', event => { const link = event.target.closest(PEEK_LINKS); if (link) showPeek(link); });
on(readerContent, 'focusout', hidePeek);

// ---- Open / close Knowledge -------------------------------------

const isOpen = () => view.classList.contains('is-open');

// CREATE / CONSUME look selected only while Knowledge is closed; the current mode is always body[data-mode]
const syncModeButtons = () => modeButtons.forEach(button =>
  button.setAttribute('aria-pressed', String(!isOpen() && button.dataset.mode === document.body.dataset.mode)));

// Closing the layer: it fades out showing the page you were on, and only then goes back to the overview
// (so nothing morphs mid-fade, the same as opening it).
function resetAfterClose() {
  closeModal();
  current = null;
  trail = [];
  returnFocus?.focus?.({ preventScroll: true });
  setTimeout(() => {
    if (isOpen()) return;                             // reopened in the meantime
    instant(() => showOnly([overview, reader], overview));
    view.scrollTop = 0;
  }, LAYER_MS + 50);
}

function setKnowledge(open) {
  if (open === isOpen()) return;
  if (!open) resetAfterClose();

  view.classList.toggle('is-open', open);
  view.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('knowledge-open', open);
  knowledgeToggle.setAttribute('aria-pressed', String(open));
  knowledgeToggle.setAttribute('aria-label', open ? 'Close Knowledge view' : 'Open Knowledge view');
    syncModeButtons();

  // Opening shows the current page (or the overview); closing restores the hash from before
  if (open) setUrl(hashFor(current));
  else if (location.hash.startsWith('#mymind')) setUrl(hashBeforeKnowledge);
}

// ---- Responses (visitors) ---------------------------------------
// A question opens in the reader like an article: the question is the title, the approved
// responses are pull quotes, and the form sits underneath. Only approved responses are shown.

const responseHTML = r => quoteCard({ text: r.body });

const responsesSection = q => `
  <div id="knowledgeResponses"><p class="c-sub">Loading…</p></div>
  <form class="response-form" data-question-id="${esc(q.id)}">
    <textarea maxlength="1000" placeholder="Waiting for your mind to marinate..." aria-label="Your response" required></textarea>
    <button type="submit">[ SHARE ]</button>
    <p class="c-sub" role="status"></p>
  </form>`;

// Moderator view: every response (pending ones too) with [ APPROVE ] / [ DELETE ] under each card
const moderatorItem = r => `
  <div class="response-item${r.approved ? '' : ' is-pending'}">
    ${quoteCard({ text: r.body })}
    <div class="response-actions">
      ${r.approved ? '' : `<button type="button" data-response-action="approve" data-response-id="${esc(r.id)}">[ APPROVE ]</button>`}
      <button type="button" data-response-action="delete" data-response-id="${esc(r.id)}">[ DELETE ]</button>
    </div>
  </div>`;

async function loadResponses(questionId) {
  const target = $('#knowledgeResponses');
  const { data, error } = moderatorPassword
    ? await supabase.rpc('list_responses_admin', { pw: moderatorPassword, qid: questionId })
    : await supabase.from('responses').select('body').eq('question_id', questionId).order('created_at');
  console.log('moderator mode:', !!moderatorPassword, 'rows:', data?.length, error);
  if (!target) return;
  if (error?.code === '28000') setModerator(null);   // password no longer valid: back to the visitor view
  const toHTML = moderatorPassword ? moderatorItem : responseHTML;
  target.innerHTML = error ? '<p>Responses could not be loaded.</p>'
    : data.length ? `<div class="response-board">${data.map(toHTML).join('')}</div>`
    : '<p>I do not have a penny, but please feel free to leave a thought :-)</p>';
}

// ---- Moderation (moderator only) --------------------------------
// The moderator password is checked by Supabase (check_moderator, list_responses_admin,
// approve_response, delete_response; see moderation.sql). It is never stored in this file.
let moderatorPassword = null;   // memory only, gone on reload

function setModerator(password) {
  moderatorPassword = password;
  if (currentQuestionId && !password) loadResponses(currentQuestionId);
}

on(readerContent, 'click', async event => {
  const button = event.target.closest('[data-response-action]');
  if (!button || !moderatorPassword) return;
  const { responseAction: action, responseId: rid } = button.dataset;
  if (action === 'delete' && !window.confirm('Delete this response permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc(action === 'approve' ? 'approve_response' : 'delete_response',
    { pw: moderatorPassword, rid });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setModerator(null);
    return;
  }
  loadResponses(currentQuestionId);
});

on(readerContent, 'submit', async event => {
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector('[role="status"]');
  const body = form.querySelector('textarea').value.trim();
  if (!body) return;

  const { error } = await supabase.from('responses')
    .insert({ question_id: form.dataset.questionId, body });
  status.textContent = error ? 'Something went wrong.' : 'Thanks! Your response will appear once approved.';
  if (!error) form.reset();
});

// ---- Add a question (editor only) -------------------------------
// The editor password is never stored in this file. It is checked by Supabase
// (check_editor / add_question), so the [ + ] button and modal are only a convenience.
// Their markup lives in index.html (#addQuestionBtn, #questionModal).

let editorPassword = null;   // memory only, gone on reload

const addBtn = $('#addQuestionBtn');
const modal = $('#questionModal');
const modalClose = $('#questionModalClose');
const questionForm = $('#questionForm');
const questionInput = $('#questionInput');
const questionStatus = $('#questionStatus');

const isModalOpen = () => modal.classList.contains('is-open');

function openModal() {
  questionStatus.textContent = '';
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  questionInput.focus({ preventScroll: true });
}

function closeModal() {
  if (!isModalOpen()) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  addBtn.focus({ preventScroll: true });
}

function setEditor(password) {
  editorPassword = password;
  addBtn.hidden = !password;
  if (!password) closeModal();
}

on(addBtn, 'click', openModal);
on(modalClose, 'click', closeModal);
on(modal, 'click', event => { if (event.target === modal) closeModal(); });   // click outside the panel

on(document, 'keydown', event => {
  if (!isModalOpen()) return;
  if (event.key === 'Escape') closeModal();
  if (event.key !== 'Tab') return;

  // Keep Tab inside the dialog
  const items = $$('textarea, button', modal);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

on(questionForm, 'submit', async event => {
  event.preventDefault();
  const text = questionInput.value.trim();
  if (!text) return;

  const { error } = await supabase.rpc('add_question', { pw: editorPassword, q: text });
  if (error) {
    if (error.code === '28000') setEditor(null);   // password no longer valid: hide editing again
    else questionStatus.textContent = 'Something went wrong. Please try again.';
    return;
  }

  questionForm.reset();
  closeModal();
  loadQuestions();
});

// Delete a question (editor only): removes it and its responses, then returns to the overview
on(readerContent, 'click', async event => {
  const button = event.target.closest('[data-delete-question]');
  if (!button || !editorPassword) return;
  if (!window.confirm('Delete this question and all of its responses permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc('delete_question', { pw: editorPassword, qid: button.dataset.deleteQuestion });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setEditor(null);   // password no longer valid: hide editing again
    else window.alert('Something went wrong. Please try again.');
    return;
  }
  closeReader();
  loadQuestions();
});

// ---- Password gate ----------------------------------------------
// Lightweight presentation gate only, same as js/password-gate.js: this password and the
// Knowledge content are both visible in client-side code, so this must not protect confidential data.
// Either of these opens the view (read + respond). The editor and moderator passwords live only in Supabase.
// password -> group name. Use the group names in an article's or experiment's `access: [...]`.
const KNOWLEDGE_PASSWORDS = new Map([
  ['cd mymind', 'friends'],
  ['opensesame', 'professional'],   // replace with your own password and group name
]);
let unlocked = false;   // stays unlocked until the page is reloaded, like the Amazon Music case study

// Logo click: closing never needs the password; opening asks for it once.
// A wrong password or a cancelled prompt does nothing.

// Asks for the password the first time. Resolves true once Knowledge is unlocked;
// a wrong password or a cancelled prompt resolves false and does nothing.
async function unlock() {
  if (unlocked) return true;
  const entered = window.prompt('Please enter password:');
  if (entered === null) return false;

  const group = KNOWLEDGE_PASSWORDS.get(entered);
  if (group) {
    unlocked = true;                                   // viewer: can read and respond
    accessGroup = group;                               // ...and sees only the items for this group
  } else {
    const [{ data: isEditor }, { data: isModerator }] = await Promise.all([
      supabase.rpc('check_editor', { pw: entered }),
      supabase.rpc('check_moderator', { pw: entered }),
    ]);
    if (!isEditor && !isModerator) return false;       // wrong password does nothing
    unlocked = true;
    accessGroup = 'all';                               // editor / moderator: sees everything
    if (isEditor) setEditor(entered);                  // editor: also sees the add button
    if (isModerator) setModerator(entered);            // moderator: also approves / deletes responses
  }
  return true;
}

// Unlock (once) and show only what this password allows
async function prepareKnowledge() {
  if (!(await unlock())) return false;
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
  trail = ['outside'];
  if (open() === false) { trail = []; return; }   // nothing to open (unknown id, or not for this password)
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

  current = null;                            // a linked page starts fresh: [ CLOSE ] goes to the overview
  trail = [];

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