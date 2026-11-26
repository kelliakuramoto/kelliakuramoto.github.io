import { esc } from '../dom.js';
import { TOKEN, resolve, refKey } from './graph.js';

// =====================================================
// RICH TEXT: turns [[links]] written in your content into clickable HTML.
//
// WRITING LINKS (works in any `text` or list item of an essay, experiment or definition)
//   [[definition:free-bread]]                  link to that item; shows its default words
//   [[book:letters-to-a-young-poet]]           media items are written by their `type` in library.js
//   [[definition:free-bread|the free bread]]   same, but you choose the words
// The kind is always written (definition, article, experiment, or a media type: book, podcast, poem, quote), the same 'kind:id' as `parent` and `links`.
// A link without a kind, like [[free-bread]], is not turned into a link: it stays as typed and check-content.mjs reports it.
//   [[url:https://example.com|the words]]      a link to any web page, opens in a new tab (http and https only)
//   [[url:https://example.com]]                same, and the words are the address without https://
// A url link is not part of the content graph: it connects nothing, it is only a link.
// Text after the brackets stays attached: "[[sprint]]s" reads "sprints".
// A link to an id that does not exist is left as typed, so a typo is easy to spot
// (and `node scripts/check-content.mjs` lists it).
//
// WHAT COMES OUT
//   Every link carries data-ref="kind:id" and the class "ref-link". Because of that, ONE click handler
//   (knowledge.js) opens every kind of page and ONE hover handler shows every kind of preview.
//   Kinds only differ in colour (the class) and destination (see refAnchor).
// =====================================================

// Words shown for a link when you did not write any: [[kind:id]] with no |words.
// Add a line here when you add a new kind.
const DEFAULT_WORDS = {
  definition: item => item.word.toLowerCase(),
  media: item => item.title || item.episode || item.id,
  article: item => item.title,
  experiment: item => item.title,
  question: item => item.text,
};

// Which CSS class colours the link, per kind (the styles already exist in styles.css).
const LINK_CLASS = { definition: 'term-link', media: 'consume-link', article: 'essay-link', experiment: 'essay-link', question: 'essay-link' };

// The default link words for an item, e.g. wordsFor(book) -> "Letters to a Young Poet".
// Not escaped: pass it through esc() before putting it in HTML.
export const wordsFor = item => (DEFAULT_WORDS[item.kind] || (i => i.id))(item);

// The HTML for ONE link to ONE item. Use it anywhere you need a link in generated markup
// (richText below and the References list in kinds.js both use it).
//   words    the link text, ALREADY escaped (defaults to the item's own name)
//   canSee   predicate for items the viewer may not open: they come back as plain words, no link
// Destination by kind:
//   media    its external url, in a new tab (or a plain span if it has no url, like a quote)
//   others   #mymind/<kind>/<id>, which the Knowledge reader opens in place
export function refAnchor(item, words = esc(wordsFor(item)), { canSee = () => true } = {}) {
  if (!canSee(item)) return words;
  const ref = refKey(item.kind, item.id);
  const cls = `ref-link ${LINK_CLASS[item.kind] || 'essay-link'}`;
  if (item.kind === 'media') {
    return item.url
      ? `<a href="${esc(item.url)}" class="${cls}" data-ref="${ref}" target="_blank" rel="noopener noreferrer">${words}</a>`
      : `<span class="${cls}" data-ref="${ref}" tabindex="0">${words}</span>`;
  }
  return `<a href="#mymind/${item.kind}/${encodeURIComponent(item.id)}" class="${cls}" data-ref="${ref}">${words}</a>`;
}

// [[url:https://example.com|words]]. The text is escaped before this runs, so `href` and `label` are safe to use as is.
const URL_TOKEN = /\[\[url:(https?:\/\/[^\]|\s]+)(?:\|([^\]]+))?\]\]/g;
const urlAnchor = (href, label) =>
  `<a href="${href}" class="essay-link" target="_blank" rel="noopener noreferrer">${label || href.replace(/^https?:\/\/(www\.)?/, '')}</a>`;

// THE MAIN ENTRY POINT. Takes plain text containing [[links]] and returns safe HTML.
//   richText('I love [[definition:free-bread]].')   ->  'I love <a ...>free bread</a>.'
// The text is escaped FIRST, so nothing you write can inject HTML; links are added afterwards.
// Options are passed to refAnchor, e.g. richText(text, { canSee }) to hide links to locked items.
export const richText = (text, options = {}) =>
  esc(text).replace(URL_TOKEN, (match, href, label) => urlAnchor(href, label)).replace(TOKEN, (match, kind, id, label) => {
    // `label` was escaped along with the rest of the text, so it is safe to use as is
    const hit = resolve(kind, id);
    return hit ? refAnchor(hit.item, label || esc(wordsFor(hit.item)), options) : match;
  });
