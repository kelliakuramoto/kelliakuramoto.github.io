import { $, $$, esc, on, showOnly } from './dom.js';
import { articleCard, bookCard, quoteCard } from './cards.js';
import { animateScrollTo } from './navigation.js';

// =====================================================
// KNOWLEDGE VIEW
// Add questions, articles and experiments in the collections below.
// Questions are Consume quote cards; experiments are Consume book cards (js/cards.js).
// Article body blocks support: paragraph, heading, subheading, quote,
// underline, image, and divider. Images use paths relative to index.html.
// =====================================================
const QUESTIONS = [
  { 
    text: 'What does the playground of your mind look like?', 
  },
  { 
    text: 'What jobs are processing in the background of your brain?', 
  },
  { 
    text: 'How do you know what to believe in, if you know that your brain lies to you?' 
  },
];

const ARTICLES = [
  {
    id: 'no-advice',
    title: 'I do not believe in giving advice',
    subheader: 'My response to the question: What should I do?',
    date: '2026-10-24',
    image: 'images/Writing/free-advice.JPG',
    imageAlt: 'Photo of man talking with another man in front of a sign that says Free Advice',
    blocks: [
      { type: 'paragraph', text: 'I keep coming back to the idea that attention is not just something we give. It is something we practice. The things we choose to notice eventually shape the things we choose to make.' },
      { type: 'heading', text: 'What we notice becomes our world' },
      { type: 'paragraph', text: 'Design often begins before a brief exists. It begins with the small friction we cannot stop thinking about, the question that follows us home, or the moment that makes us reconsider an assumption.' },
      { type: 'quote', text: 'Curiosity is a way of staying in relationship with what we do not yet understand.' },
      { type: 'paragraph', text: 'This is a place for unfinished thinking: ideas to test, connections to follow, and observations that might become something more.' },
    ],
  },
];

const EXPERIMENTS = [
  {
    id: 'sunscreeen',
    title: 'Just put on some damn sunscreen',
    byline: 'Trying to understand the obstacles from moving from awareness to action',
    image: 'images/Writing/stick-sunscreen.JPG',
    imageAlt: 'Image of CeraVe stick sunscreen',
    subheader: 'Trying to understand the obstacles from moving from awareness to action',
    blocks: [
      { type: 'paragraph', text: 'The experiment is simple: write down one question every day that I cannot answer immediately. At the end of each week, choose one to investigate through reading, conversation, or making.' },
      { type: 'heading', text: 'What I am testing' },
      { type: 'paragraph', text: 'Does a regular question practice make curiosity more active in everyday life? I will track which questions recur, which lead to action, and which change as I learn.' },
      { type: 'quote', text: 'The goal is not to collect answers. It is to get better at asking.' },
    ],
  },
];

// ---- Rendering --------------------------------------------------

const formatDate = (iso, month) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });

// Attributes that make a card open the reader (the click and key handlers below look for these)
const openAttrs = (kind, item) =>
  `data-knowledge-kind="${kind}" data-knowledge-id="${esc(item.id)}" tabindex="0" role="button" aria-label="Open ${kind}: ${esc(item.title)}"`;

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

renderInto('#knowledgeQuestions', QUESTIONS, quoteCard);
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

let returnFocus = null;

function openReader(kind, id, trigger) {
  const item = (kind === 'article' ? ARTICLES : EXPERIMENTS).find(entry => entry.id === id);
  if (!item) return;
  returnFocus = trigger;
  readerType.textContent = kind === 'article' ? 'WHAT I THINK I KNOW' : 'WHAT I WANT TO KNOW';

  // Only articles have a date; experiments get no byline
  const byline = item.date
  ? `<div class="knowledge-byline"><time datetime="${esc(item.date)}">${formatDate(item.date, 'long')}</time></div>`
  : '';
  
  const hero = item.image
  ? `<figure class="knowledge-hero-image"><img src="${esc(item.image)}" alt="${esc(item.imageAlt || '')}"></figure>`
  : '';

  readerContent.innerHTML = `
    <header class="knowledge-article-header">
      <h1>${esc(item.title)}</h1>
      <p class="knowledge-deck">${esc(item.subheader || item.byline || '')}</p>
      ${byline}
      ${hero}
    </header>
    <div class="knowledge-prose">${(item.blocks || []).map(blockHTML).join('')}</div>`;

  showOnly([overview, reader], reader);
  animateScrollTo(view, 0);
  closeButton.focus({ preventScroll: true });
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
  if (!open) closeReader();

  view.classList.toggle('is-open', open);
  view.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('knowledge-open', open);
  knowledgeToggle.setAttribute('aria-pressed', String(open));
  knowledgeToggle.setAttribute('aria-label', open ? 'Close Knowledge view' : 'Open Knowledge view');
  syncModeButtons();
}

// ---- Password gate ----------------------------------------------
// Lightweight presentation gate only, same as js/password-gate.js: the password and the
// Knowledge content are both visible in client-side code, so this must not protect confidential data.
const KNOWLEDGE_PASSWORD = 'cd mymind';
let unlocked = false;   // stays unlocked until the page is reloaded, like the Amazon Music case study

// Logo click: closing never needs the password; opening asks for it once.
// A wrong password or a cancelled prompt does nothing.
function requestKnowledge() {
  if (isOpen()) { setKnowledge(false); return; }
  if (!unlocked) {
    const entered = window.prompt('Please enter password:');
    if (entered !== KNOWLEDGE_PASSWORD) return;
    unlocked = true;
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
