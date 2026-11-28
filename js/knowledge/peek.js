import { $, on } from '../dom.js';
import { isMobile, projectTile } from '../navigation.js';
import { PROJECTS } from '../project-data.js';
import { get } from '../content/index.js';
import { peekFor } from '../content/kinds.js';
import { view } from './state.js';

// ---- Peek beside the essay (previews are drawn by peekFor in js/content/kinds.js) --------------------------------------
// Hovering (or focusing) a link in the essay, or in a thought on a Consume detail page, shows a small preview of what it points at, level with the link.
// On mobile (no room beside the essay) CSS floats it above the toggle bar instead.
const PEEK_LINKS = '.ref-link, [data-project]';
const peekColumn = link => $('.consume-peek', link.closest('.essay') || document);   // the preview column beside the page the link is on

// The preview for any link: what the item looks like as a small card (js/content/kinds.js decides)
// The preview HTML for a hovered link. Works for every kind: the graph finds the item from data-ref,
// and kinds.js decides how it looks (peekFor). Returns '' / undefined when there is nothing to show.
const peekCard = link => {
  if (link.dataset.project) {   // a [[project:id]] link: the same tile as on the home page, just the image (no hover caption)
    const project = PROJECTS.find(p => p.id === link.dataset.project);
    return project && projectTile(project);
  }
  const item = get(link.dataset.ref);
  return item && peekFor(item);
};

function showPeek(link) {
  const peek = peekColumn(link);
  const card = peek && peekCard(link);
  if (!card) return;                                       // not an essay page, or an unknown id
  peek.innerHTML = card;
  if (!isMobile.matches) {
    // Keep the card on screen: level with the link, but never above the top or below the bottom of the view
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const box = (link.closest('.consume-detail') || view).getBoundingClientRect();
    const y = Math.max(box.top + rem, Math.min(link.getBoundingClientRect().top, box.bottom - peek.offsetHeight - rem));
    peek.style.top = `${y - peek.parentElement.getBoundingClientRect().top}px`;
  }
  peek.classList.add('is-visible');
}

const hidePeek = () => document.querySelectorAll('.consume-peek').forEach(peek => peek.classList.remove('is-visible'));

// One listener each, for the Knowledge reader and for every Consume detail page (there can be several, one on top of another)
const inPeekArea = link => link && link.closest('#knowledgeReaderContent, .consume-detail');
on(document, 'mouseover', event => { const link = event.target.closest(PEEK_LINKS); if (inPeekArea(link)) showPeek(link); });
on(document, 'mouseout', event => { if (inPeekArea(event.target.closest(PEEK_LINKS))) hidePeek(); });
on(document, 'focusin', event => { const link = event.target.closest(PEEK_LINKS); if (inPeekArea(link)) showPeek(link); });
on(document, 'focusout', event => { if (inPeekArea(event.target.closest(PEEK_LINKS))) hidePeek(); });
