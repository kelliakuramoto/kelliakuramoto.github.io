import { esc, formatDate } from './dom.js';
import { highlight, wrap } from './cards.js';
import { thoughtBlocks } from './content/data/thoughts.js';

// =====================================================
// BLOCKS: how every block type of an essay, experiment or thought is drawn, in ONE place.
// A block is { type, text?, items?, ... } (the format written in essays.js, experiments.js and thoughts.js).
//
// A block is drawn in one of two places, so each type has up to two drawings:
//   page   the reading page: an essay or experiment's prose in the Knowledge reader
//   card   inside a thought card (the grey sheet, see thoughtCard below)
// A type with no `card` drawing is written as a handwriting paragraph in a thought card; a type with no
// `page` drawing is a plain paragraph on the page. [[links]] work wherever `text` is passed through.
//
// ADDING A BLOCK TYPE (say "callout"): add one entry to BLOCKS below, with a `page` and/or a `card` drawing,
// plus its CSS. Nothing else changes: essays, experiments and thoughts all pick it up.
//
//   page(block, text)   `text(string)` turns text into HTML (links, escaping): the reader passes richText with its access rules
//   card(block, text)   `text(string)` the same; blank blocks return '' so they are skipped
// =====================================================

// ---- the drawings that several types share ----
const pageParagraph = (block, text) => `<p>${text(block.text || '')}</p>`;

const cardParagraph = ({ text: raw = '' }, text) => {
  const words = raw.trim();
  return words ? `<p>${text(words)}</p>` : '';
};

const pageList = tag => (block, text) => `<${tag}>${(block.items || []).map(item => `<li>${text(item)}</li>`).join('')}</${tag}>`;

const cardList = tag => ({ items = [] }, text) => {
  const lines = items.map(item => String(item).trim()).filter(Boolean);
  return lines.length ? `<${tag} class="c-thought-list">${lines.map(line => `<li>${text(line)}</li>`).join('')}</${tag}>` : '';
};

const BLOCKS = {
  paragraph: { page: pageParagraph, card: cardParagraph },
  heading: { page: (block, text) => `<h2>${text(block.text || '')}</h2>` },
  subheading: { page: (block, text) => `<h3>${text(block.text || '')}</h3>` },
  underline: { page: (block, text) => `<p><span class="knowledge-underline">${text(block.text || '')}</span></p>` },
  divider: { page: () => '<hr class="knowledge-divider">' },
  image: {
    page: block => `<figure class="knowledge-inline-image"><img src="${esc(block.src || '')}" alt="${esc(block.alt || '')}">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}</figure>`,
  },
  list: { page: pageList('ul'), card: cardList('ul') },
  'numbered-list': { page: pageList('ol'), card: cardList('ol') },

  // On the page: a quote block. On a thought card: the quote card's type, with its `highlight` words marked.
  // A quote with a `url` (http or https) opens that page in a new tab when clicked.
  quote: {
    page: (block, text) => `<blockquote class="knowledge-quote">${text(block.text || '')}</blockquote>`,
    card: ({ text: raw = '', highlight: phrase, url = '' }) => {
      const words = raw.trim();
      if (!words) return '';
      const quote = `<blockquote>${highlight(words, phrase)}</blockquote>`;
      return /^https?:\/\//i.test(url)
        ? `<a class="c-thought-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${quote}</a>`
        : quote;
    },
  },

  // One line of a conversation: "Speaker:" in a column with the words beside it (no `speaker`: the words alone,
  // lined up under the others). On the page, consecutive transcript blocks share one card (see pageBlocks).
  transcript: {
    card: ({ text: raw = '', speaker = '' }, text) => {
      const words = raw.trim();
      return words ? `<p class="c-thought-transcript"><span>${speaker.trim() ? `${esc(speaker.trim())}:` : ''}</span><span>${text(words)}</span></p>` : '';
    },
  },

  // A thought written inside an essay: the same card as a thought on the Consume page.
  thought: {
    page: (block, text) => thoughtCard({
      blocks: thoughtBlocks(block), format: text, date: block.date, dateLabel: block.date && formatDate(block.date, 'short'),
    }),
  },
};

const drawing = (type, where, fallback) => (Object.hasOwn(BLOCKS, type) && BLOCKS[type][where]) || fallback;

// ---- THE thought card ----
// What is written on a sheet of paper: the thought's blocks, then its date at the bottom (also handwriting).
const thoughtWriting = ({ blocks, date, dateLabel, format = esc }) =>
  `${blocks.map(block => drawing(block.type, 'card', cardParagraph)(block, format)).join('')}${date ? `<time class="c-thought-date" datetime="${esc(date)}">${esc(dateLabel || date)}</time>` : ''}`;

// { blocks: [{ type: 'paragraph' | 'quote' | 'transcript' | 'list' | 'numbered-list', text, highlight?, url?, speaker?, items? }], date?, dateLabel?, format? }
// A thought: writing on a quote-card-shaped sheet. `format` turns text into HTML (default: escaped plain text);
// the Knowledge reader passes richText so [[links]] work. Also takes the options every card does (className, attrs, href).
export function thoughtCard({ blocks, date, dateLabel, format, ...options }) {
  // Every "Name:" in a card shares one column, as wide as the longest name (Geist Mono, so `ch` is exact).
  const names = blocks.filter(b => b.type === 'transcript' && b.speaker?.trim()).map(b => b.speaker.trim().length + 1);
  const style = names.length ? ` style="--speaker-w: ${Math.max(...names)}ch"` : '';
  return wrap(`<div class="c-media c-thought"${style}>${thoughtWriting({ blocks, date, dateLabel, format })}</div>`, options);
}

// ---- THE page of blocks ----
// An essay or experiment's blocks as HTML for the reading page. `text` turns text into HTML (see above).
// Consecutive transcript blocks are one conversation: they share a single thought card instead of one card each.
export function pageBlocks(blocks, { text }) {
  const parts = [];
  for (const block of blocks) {
    const last = parts[parts.length - 1];
    if (block.type === 'transcript' && last?.transcript) last.transcript.push(block);
    else parts.push(block.type === 'transcript' ? { transcript: [block] } : { block });
  }
  return parts
    .map(part => part.transcript
      ? thoughtCard({ blocks: part.transcript, format: text })
      : drawing(part.block.type, 'page', pageParagraph)(part.block, text))
    .join('');
}
