/** Shared, small DOM utilities used across feature modules. */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
// Opens `target` and closes every other view in `views` (CSS crossfades on .is-open)
export const showOnly = (views, target) => views.forEach(view => view.classList.toggle('is-open', view === target));
// Shows or hides an overlay (modal, layer): CSS fades on .is-open, aria-hidden keeps hidden ones out of screen readers
export function setOverlay(element, open) {
  element.classList.toggle('is-open', open);
  element.setAttribute('aria-hidden', String(!open));
}
export const on = (element, event, handler, options) => element?.addEventListener(event, handler, options);
export const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// Formats an ISO date for display. month is 'short' ("Nov 12, 2026") or 'long' ("November 12, 2026").
export const formatDate = (iso, month) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });

// Puts `next` (like '#mymind/article/x') in the address bar as a new history entry, or replaces the current one.
// Does nothing when it is already there (e.g. we arrived via Back / a pasted link). Returns whether it changed.
export function setHash(next, { replace = false } = {}) {
  if (location.hash === next) return false;
  history[replace ? 'replaceState' : 'pushState'](null, '', location.pathname + location.search + next);
  return true;
}

// A new, randomly ordered copy of an array (Fisher-Yates). Used by the Consume board and the Consume detail page.
export function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// A random number generator that gives the same numbers for the same seed (mulberry32), so anything "random" that is
// tied to an item (where its sticky notes sit, how they tilt) stays the same every time the board is drawn.
//   const random = seededRandom('media:the-score');  random() -> a number from 0 up to 1
export function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
