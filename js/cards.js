import { esc, seededRandom } from './dom.js';

// =====================================================
// Shared card components
// The Consume board, Knowledge view and Photography board all build their cards here.
// Every card also accepts:
//   href   makes the whole card an external link
//   attrs  extra HTML attributes for the card element (e.g. data-* hooks)
// =====================================================

// Wraps `phrase` in <mark> inside `text`. No phrase (or no match) leaves the text plain.
export function highlight(text, phrase) {
  const i = phrase ? text.indexOf(phrase) : -1;
  if (i === -1) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(phrase)}</mark>${esc(text.slice(i + phrase.length))}`;
}

// The card element: a link when `href` is set, otherwise an <article>.
// `className` adds a modifier next to c-card (e.g. 'c-flash').
export function wrap(inner, { href, attrs = '', className = '' } = {}) {
  const cls = className ? `c-card ${className}` : 'c-card';
  return href
    ? `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${attrs}>${inner}</a>`
    : `<article class="${cls}" ${attrs}>${inner}</article>`;
}

// Text under the media: an optional title, then any number of muted lines
function meta(title, ...lines) {
  const heading = title ? `<h3 class="c-title">${esc(title)}</h3>` : '';
  const subs = lines.filter(Boolean).map(line => `<p class="c-sub">${esc(line)}</p>`).join('');
  return `<div>${heading}${subs}</div>`;
}

// { text, highlight? (exact words to mark), by? }
export function quoteCard({ text, highlight: phrase, by, ...options }) {
  const media = `<div class="c-media c-quote"><blockquote>${highlight(text, phrase)}</blockquote></div>`;
  return wrap(media + (by ? meta(null, by) : ''), options);
}

// { text }
// Just text, no frame. Used for the questions in Knowledge.
export function textCard({ text, ...options }) {
  return wrap(`<p class="c-question">${esc(text)}</p>`, options);
}

// { title, by, color?, image?, ink?, sub? }
//   color  cover colour when there is no image
//   ink    cover text colour (default white)
//   sub    line under the title (default: `by`)
export function bookCard({ title, by, sub = by, color, image, ink, ...options }) {
  const cover = image
    ? `<img class="c-cover-img" src="${esc(image)}" alt="${esc(title)} cover">`
    : `<div class="c-cover" style="background:${esc(color)}${ink ? `;color:${esc(ink)}` : ''}"><strong>${esc(title)}</strong><span>${esc(by)}</span></div>`;
  return wrap(`<div class="c-media c-book">${cover}</div>${meta(title, sub)}`, options);
}

// { show, episode, minutes?, progress? (0-100), image? }
export function podcastCard({ show, episode, minutes, progress, image, ...options }) {
  const percent = Math.min(100, Math.max(0, Number(progress) || 0));
  const bar = progress == null ? '' : `<div class="c-progress" role="progressbar" aria-label="Listening progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></div>`;
  const img = image ? `<img src="${esc(image)}" alt="">` : '';
  return wrap(`<div class="c-media c-podcast">${img}${bar}</div>${meta(episode, show, minutes && `${minutes} min`)}`, options);
}

// { src?, alt?, ratio? ("4/5"), title?, sub? }
// Used for poems and photographs. No src = grey placeholder. No ratio = the image keeps its own shape.
const RATIO_OK = /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/;

export function imageCard({ src, alt, ratio, title, sub, ...options }) {
  const style = RATIO_OK.test(ratio || '') ? ` style="--ratio:${esc(ratio)}"` : '';
  const img = src ? `<img src="${esc(src)}" alt="${esc(alt || title || 'Photograph')}" loading="lazy" decoding="async">` : '';
  return wrap(`<div class="c-media"${style}>${img}</div>${title || sub ? meta(title, sub) : ''}`, options);
}

// { title, sub?, date? (ISO, for the datetime attribute), dateLabel? (text shown) }
export function articleCard({ title, sub, date, dateLabel, ...options }) {
  const time = date ? `<time datetime="${esc(date)}">${esc(dateLabel || date)}</time>` : '';
  const copy = `<div class="c-article-copy"><h3 class="c-title">${esc(title)}</h3>${sub ? `<p class="c-sub">${esc(sub)}</p>` : ''}${time}</div>`;
  return wrap(`<div class="c-article">${copy}</div>`, options);
}

// { front, back }
// An index card: the word (back) on top, a red line, then the definition (front) on blue ruled lines. There is nothing to turn over.
// front and back are HTML, so escape text first (or use richText from js/content/richtext.js).
export function flashCard({ front, back, ...options }) {
  const card = `<div class="c-flash-inner">
    <div class="c-flash-word">${back}</div>
    <hr class="c-flash-rule">
    <div class="c-flash-body"><div class="c-flash-def">${front}</div></div>
  </div>`;
  return wrap(card, { className: 'c-flash', ...options });
}

// Wraps ANY card so hovering or focusing it fades in "Peek into my mind" button(s).
// `links` come from peekLinks() in js/content/kinds.js: [{ ref: 'article:no-advice', label: 'PEEK INTO MY MIND' }].
// The overlay is placed inside the card's first .c-media, so it covers only the image / quote / cover
// and never the title and text underneath. No links = the card comes back untouched.
// Each button opens its item through [data-ref] (that handler calls preventDefault,
// so on a card that is a link the click doesn't also follow the link).
export const peekFrame = (card, links = []) => {
  if (!links.length) return card;
  const template = document.createElement('template');
  template.innerHTML = card;
  const media = template.content.querySelector('.c-media');
  if (!media) return card;
  const buttons = links.map(({ ref, label }) => `<button type="button" data-ref="${esc(ref)}">[ ${esc(label)} ]</button>`).join('');
  media.insertAdjacentHTML('beforeend', `<div class="c-peek">${buttons}</div>`);
  return `<div class="c-peek-frame">${template.innerHTML}</div>`;
};

const between = (random, min, max) => min + random() * (max - min);
const NOTE_EDGES = ['top', 'right', 'left'];
const MAX_NOTES = 6;

// Wraps a Consume card that has things attached with small sticky notes tucked behind its cover. On hover or focus they slide out a
// little from the top, right and left edges, as a hint that the card opens. There is one note per attached item (at most six),
// coloured by kind (see the .c-note--* colours in styles.css). Edges, positions and tilt come from `seed` (the item's id), so a card
// always looks the same.
//   kinds  one name per attached item, e.g. ['quote', 'definition', 'thought'] (see attachedKinds() in js/content/kinds.js)
export const deskFrame = (card, seed, kinds = []) => {
  const template = document.createElement('template');
  template.innerHTML = card;
  const root = template.content.firstElementChild;
  if (!root || !kinds.length) return card;
  const random = seededRandom(seed);
  // up to six notes, dealt out to the three edges in turn, starting from a seeded edge
  const first = Math.floor(random() * NOTE_EDGES.length);
  const notes = kinds.slice(0, MAX_NOTES).map((kind, i) => ({ kind, edge: NOTE_EDGES[(first + i) % NOTE_EDGES.length] }));
  const count = {};
  const html = notes.map(({ kind, edge }) => {
    const n = count[edge] = (count[edge] || 0) + 1;                       // 1st or 2nd note on this edge
    const along = edge === 'top'
      ? `left:${Math.round(10 + (n - 1) * 42 + between(random, 0, 22))}%`
      : `top:${(1.25 + (n - 1) * 3.6 + between(random, 0, 1.6)).toFixed(2)}rem`;
    const tilt = between(random, -7, 7).toFixed(1);
    return `<span class="c-note c-note--${kind} c-note--${edge}" style="${along};--tilt:${tilt}deg" aria-hidden="true"></span>`;
  }).join('');
  root.insertAdjacentHTML('afterbegin', html);
  root.classList.add('has-notes');
  return template.innerHTML;
};
