import { esc } from './dom.js';

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

// The card element: a link when `href` is set, otherwise an <article>
function wrap(inner, { href, attrs = '' } = {}) {
  return href
    ? `<a class="c-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer" ${attrs}>${inner}</a>`
    : `<article class="c-card" ${attrs}>${inner}</article>`;
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

// { title, sub?, date? (ISO, for the datetime attribute), dateLabel? (text shown), image?, alt? }
// Text on the left, thumbnail on the right. Size the thumbnail with --article-image, shape it with --ratio (see CSS).
export function articleCard({ title, sub, date, dateLabel, image, alt, ...options }) {
  const time = date ? `<time datetime="${esc(date)}">${esc(dateLabel || date)}</time>` : '';
  const copy = `<div class="c-article-copy"><h3 class="c-title">${esc(title)}</h3>${sub ? `<p class="c-sub">${esc(sub)}</p>` : ''}${time}</div>`;
  const img = image ? `<img src="${esc(image)}" alt="${esc(alt || '')}" loading="lazy" decoding="async">` : '';
  return wrap(`<div class="c-article">${copy}<div class="c-media c-article-image">${img}</div></div>`, options);
}