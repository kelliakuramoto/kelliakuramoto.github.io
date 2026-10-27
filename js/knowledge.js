import { $, $$, esc, on, showOnly } from './dom.js';
import { articleCard, bookCard, quoteCard } from './cards.js';
import { animateScrollTo } from './navigation.js';
import { supabase } from './supabase.js';

// =====================================================
// KNOWLEDGE VIEW
// Questions live in Supabase (visitors can respond, the editor can add questions).
// Add articles and experiments in the collections below.
// Experiments are Consume book cards (js/cards.js).
// Article body blocks support: paragraph, heading, subheading, quote,
// underline, image, and divider. Images use paths relative to index.html.
// =====================================================

const ARTICLES = [
  {
    id: 'no-advice',
    title: 'I don’t believe in giving advice',
    subheader: 'My response to the question: What should I do?',
    date: '2026-10-24',
    image: 'images/Writing/free-advice.JPG',
    imageAlt: 'Photo of man talking with another man in front of a sign that says Free Advice',
    blocks: [
      { type: 'heading', text: 'What should I do?' },
      { type: 'paragraph', text: 'If you ask me what you should do in any situation my answer will always be the same, you should do what you want to do.' },
      { type: 'paragraph', text: 'Before, when my friends came to me for advice, I used to think deeply about what I thought was the best course of action given all of the conditions of the situation . But after a while, I noticed that I was always left with this sour and unsatisfying taste in my mouth. I later recognized this to be the result of my friend’s utter lack of acknowledgement of my advice, and indeed doing the complete opposite of what I said to do.' },
      { type: 'paragraph', text: 'I want to pause here and recognize two things. First, I no longer believe in "telling people what to do" and that was a mismatched expectations on my part. I now intentionally frame everything as a suggestion and they can take or leave as much as they want. I do not presume to have the respect or authority over anybody to tell what to do. Second, I have 100% in the past and probably will in the future, asked for "advice" from my friends and completely ignored what they said. I know my sister can definitely attest to this. This is all to say that I am not immune to the same actions that I get annoyed with in others. But I am trying to communicate what I need in any situation, even if most of the time it’s just for someone to listen.' },
      { type: 'paragraph', text: 'Going back to the original thread, I stopped giving advice because what I realized was that my friends weren’t asking for advice, but for assurance. They wanted permission to do what they want to do, and more often than not, they wanted permission to continue persisting the behavior that got them into the predicament in the first place. And so, I give them it.' },
      { type: 'paragraph', text: 'I do so because sometimes you win and sometimes you learn. Sometimes you have to play the tape to the very end to know that this wasn’t the path for you. As Rainier Maria Rilke said in "Letters to a Young Poet"'},
      { type: 'quote', text: 'Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now.' },
      { type: 'paragraph', text: 'Hindsight will always be 20/20 and you can’t blame your past self for “not knowing better”. You quite literally could not have known. Just because you have a hypothesis, doesn’t mean that you shouldn’t run the experiment. In fact, it is probably an huge indicator that you should.'},
      { type: 'paragraph', text: 'All that we can do in life is make the best decisions we can, with the most amount of information that we have at the time. And the only way to get more information in life is by living it.' },
      { type: 'heading', text: 'What would you do?' },
      { type: 'paragraph', text: 'Now, if someone were to ask me what I would do in that situation, I still don’t believe in giving advice.' },
      { type: 'paragraph', text: 'Growing up, I always asked my dad for advice. And honestly, I would have done whatever he told me. He could have told me to drive my car off a cliff and I would have done it. But whenever I asked him what I should do, he never gave me a straight answer.' },
      { type: 'paragraph', text: 'Instead, my dad would always walk me through his framework of thinking, what factors he considered, why something was more important than another, and how that led to his ultimate decision in that situation. He taught me how to think, not what to think, and that is one of the most important lessons I’ve learned from him to this day.' },
      { type: 'paragraph', text: 'My father understood much earlier than I did that you cannot tell anyone what to do. There is a subtle but importance difference between mimicking a behavior and embodying it: you can always tell when someone’s heart isn’t in it.'},
      { type: 'paragraph', text: 'I’ve found my life to be a lot less mystifying the less advice that I gave and the more support I offered. I think at the end of the day, all most of us want in life is know that we’re not crazy, we’re not alone, and that we’re allowed to mess up sometimes.' },
      { type: 'paragraph', text: 'I really believe that any decision that you can learn from, will be the right decision for you.' },
      { type: 'quote', text: 'Sometimes you win, sometimes you learn.' },
    ],
  },
];

const EXPERIMENTS = [
  {
    id: 'sunscreeen',
    title: 'Just put on some damn sunscreen',
    byline: 'Trying to understand how to move from awareness to action',
    image: 'images/Writing/stick-sunscreen.jpg',
    imageAlt: 'Image of CeraVe stick sunscreen',
    subheader: 'Trying to understand how to move from awareness to action',
    blocks: [
      { type: 'paragraph', text: 'This experiment is a work in progress. Please check back later.' },
      // { type: 'heading', text: 'What I am testing' },
      // { type: 'paragraph', text: 'Does a regular question practice make curiosity more active in everyday life? I will track which questions recur, which lead to action, and which change as I learn.' },
      // { type: 'quote', text: 'The goal is not to collect answers. It is to get better at asking.' },
    ],
  },
];

// ---- Rendering --------------------------------------------------

const formatDate = (iso, month) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });

// Attributes that make a card open the reader (the click and key handlers below look for these)
const openAttrs = (kind, item) =>
  `data-knowledge-kind="${kind}" data-knowledge-id="${esc(item.id)}" tabindex="0" role="button" aria-label="Open ${kind}: ${esc(item.title || item.text)}"`;

const articleRow = article => articleCard({
  title: article.title,
  sub: article.subheader,
  date: article.date,
  dateLabel: formatDate(article.date, 'short'),
  image: article.image,
  alt: article.imageAlt,
  attrs: openAttrs('article', article),
});

const experimentCard = experiment => bookCard({
  title: experiment.title,
  by: experiment.byline,
  color: experiment.color || '#e8e8e8',
  image: experiment.image,
  ink: 'var(--text)',
  attrs: openAttrs('experiment', experiment),
});

function renderInto(selector, items, toHTML) {
  const root = $(selector);
  if (root) root.innerHTML = items.map(item => toHTML(item)).join('');
}

// Questions come from Supabase. Each one is a Consume quote card that opens the reader,
// the same way articles and experiments do.
let QUESTIONS = [];

const questionCard = q => quoteCard({ text: q.text, attrs: openAttrs('question', q) });

async function loadQuestions() {
  const { data, error } = await supabase.from('questions').select('*').order('created_at');
  if (error) { console.error('Questions failed to load:', error.code, error.message); return; }
  // date and subheader feed the same reader header that articles use
  QUESTIONS = data.map(q => ({
    ...q,
    // date: q.created_at.slice(0, 10),
    // subheader: 'Add your thoughts, or read what others have said.',
  }));
  renderInto('#knowledgeQuestions', QUESTIONS, questionCard);
}
loadQuestions();

renderInto('#knowledgeArticles', ARTICLES, articleRow);
renderInto('#knowledgeExperiments', EXPERIMENTS, experimentCard);

function blockHTML(block) {
  const text = esc(block.text || '');
  switch (block.type) {
    case 'heading': return `<h2>${text}</h2>`;
    case 'subheading': return `<h3>${text}</h3>`;
    case 'quote': return `<blockquote class="knowledge-quote">${text}</blockquote>`;
    case 'underline': return `<p><span class="knowledge-underline">${text}</span></p>`;
    case 'image': return `<figure class="knowledge-inline-image"><img src="${esc(block.src || '')}" alt="${esc(block.alt || '')}">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}</figure>`;
    case 'divider': return '<hr class="knowledge-divider">';
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
};

let returnFocus = null;

function openReader(kind, id, trigger) {
  const item = { article: ARTICLES, experiment: EXPERIMENTS, question: QUESTIONS }[kind]?.find(entry => entry.id === id);
  if (!item) return;
  returnFocus = trigger;
  readerType.textContent = READER_LABELS[kind];

  // Articles and questions have a date; experiments get no byline
  const byline = item.date
  ? `<div class="knowledge-byline"><time datetime="${esc(item.date)}">${formatDate(item.date, 'long')}</time></div>`
  : '';

  const hero = item.image
  ? `<figure class="knowledge-hero-image"><img src="${esc(item.image)}" alt="${esc(item.imageAlt || '')}"></figure>`
  : '';

  readerContent.innerHTML = `
    <header class="knowledge-article-header">
      <h1>${esc(item.title || item.text)}</h1>
      <p class="knowledge-deck">${esc(item.subheader || item.byline || '')}</p>
      ${byline}
      ${hero}
    </header>
    <div class="knowledge-prose">${kind === 'question' ? responsesSection(item) : (item.blocks || []).map(blockHTML).join('')}</div>`;

  showOnly([overview, reader], reader);
  animateScrollTo(view, 0);
  closeButton.focus({ preventScroll: true });
  if (kind === 'question') loadResponses(item.id);
}

function closeReader() {
  if (!reader.classList.contains('is-open')) return;
  showOnly([overview, reader], overview);
  animateScrollTo(view, 0);
  returnFocus?.focus?.({ preventScroll: true });
}

// ---- Open / close Knowledge -------------------------------------

const isOpen = () => view.classList.contains('is-open');

// CREATE / CONSUME look selected only while Knowledge is closed; the current mode is always body[data-mode]
const syncModeButtons = () => modeButtons.forEach(button =>
  button.setAttribute('aria-pressed', String(!isOpen() && button.dataset.mode === document.body.dataset.mode)));

function setKnowledge(open) {
  if (open === isOpen()) return;
  if (!open) { closeReader(); closeModal(); }

  view.classList.toggle('is-open', open);
  view.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('knowledge-open', open);
  knowledgeToggle.setAttribute('aria-pressed', String(open));
  knowledgeToggle.setAttribute('aria-label', open ? 'Close Knowledge view' : 'Open Knowledge view');
  syncModeButtons();
}

// ---- Responses (visitors) ---------------------------------------
// A question opens in the reader like an article: the question is the title, the approved
// responses are pull quotes, and the form sits underneath. Only approved responses are shown.

const responseHTML = r =>
  `<blockquote class="knowledge-quote">${esc(r.body)}</blockquote>`;

const responsesSection = q => `
  <div id="knowledgeResponses"><p class="c-sub">Loading…</p></div>
  <form class="response-form" data-question-id="${esc(q.id)}">
    <textarea maxlength="1000" placeholder="Waiting for your mind to marinate..." aria-label="Your response" required></textarea>
    <button type="submit">[ SHARE ]</button>
    <p class="c-sub" role="status"></p>
  </form>`;

async function loadResponses(questionId) {
  const target = $('#knowledgeResponses');
  const { data, error } = await supabase.from('responses')
    .select('body').eq('question_id', questionId).order('created_at');
  if (!target) return;
  target.innerHTML = error ? '<p>Responses could not be loaded.</p>'
    : data.length ? data.map(responseHTML).join('')
    : '<p>I do not have a penny, but please feel free to leave a thought :-)</p>';
}

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

// ---- Password gate ----------------------------------------------
// Lightweight presentation gate only, same as js/password-gate.js: this password and the
// Knowledge content are both visible in client-side code, so this must not protect confidential data.
// "cd mymind" opens the view (read + respond). The editor password lives only in Supabase.
const KNOWLEDGE_PASSWORD = 'cd mymind';
let unlocked = false;   // stays unlocked until the page is reloaded, like the Amazon Music case study

// Logo click: closing never needs the password; opening asks for it once.
// A wrong password or a cancelled prompt does nothing.
async function requestKnowledge() {
  if (isOpen()) { setKnowledge(false); return; }
  if (!unlocked) {
    const entered = window.prompt('Please enter password:');
    if (entered === null) return;

    if (entered === KNOWLEDGE_PASSWORD) {
      unlocked = true;                                   // viewer: can read and respond
    } else {
      const { data: isEditor } = await supabase.rpc('check_editor', { pw: entered });
      if (!isEditor) return;                             // wrong password does nothing
      unlocked = true;
      setEditor(entered);                                // editor: also sees the add button
    }
  }
  setKnowledge(true);
}

// ---- Events -----------------------------------------------------

const openFrom = trigger => trigger && openReader(trigger.dataset.knowledgeKind, trigger.dataset.knowledgeId, trigger);

on(view, 'click', event => openFrom(event.target.closest('[data-knowledge-kind]')));

// Article and experiment cards are article[role=button], so they need Enter / Space themselves
on(view, 'keydown', event => {
  const card = event.target.closest('.c-card[role="button"]');
  if (card && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    openFrom(card);
  }
});

on(closeButton, 'click', closeReader);
on(knowledgeToggle, 'click', requestKnowledge);

// Picking CREATE or CONSUME (click or arrow keys) closes Knowledge and shows that view
on(document, 'mode:changed', () => setKnowledge(false));