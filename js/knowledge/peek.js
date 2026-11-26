import { $, on } from '../dom.js';
import { isMobile } from '../navigation.js';
import { get } from '../content/index.js';
import { peekFor } from '../content/kinds.js';
import { readerContent, view } from './state.js';

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
