import { $, on, esc } from './dom.js';
import { initCarousels } from './media.js';
import { isMobile } from './navigation.js';

// =====================================================
// Lightbox: the one enlarge interaction for the whole site
//   openLightbox({ photos: [{ src, alt }], start?, heading? (HTML), trigger? (element to refocus) })
//   - Photography calls it with a whole section, so ← → / BACK / NEXT step through it.
//   - Any other standalone image opens it on its own (a gallery of one: no BACK / NEXT bar).
// It is built here, so index.html needs no lightbox markup.
//
// Images that open it automatically (including ones added later):
//   anything in the Create panel or the Knowledge view EXCEPT
//   carousels, cards (.c-card: Consume, Knowledge, Photography), modals,
//   images inside links or buttons, and anything marked class="no-zoom".
// =====================================================
const ROOTS = '#scrollArea, #knowledgeView';
const EXCLUDE = '.car, .c-card, .modal, a, button, .no-zoom';

const isZoomable = el =>
  el instanceof HTMLImageElement && el.closest(ROOTS) && !el.closest(EXCLUDE);

const modal = document.createElement('div');
modal.className = 'modal modal--photo';
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-label', 'Enlarged images');
modal.setAttribute('aria-hidden', 'true');
modal.innerHTML = `
  <div class="modal-panel">
    <header class="project-header">
      <h2 class="photo-heading"></h2>
      <button type="button" class="close-btn">[ CLOSE ]</button>
    </header>
  </div>`;
document.body.append(modal);

const panel = $('.modal-panel', modal);
const title = $('.photo-heading', modal);
let trigger = null;   // what opened it, so focus can return there

const carouselMarkup = (photos, start) => `
  <div class="car" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Images" data-start="${start}">
    <div class="car-stage">${photos
      .map(photo => `<img class="car-slide" src="${esc(photo.src)}" alt="${esc(photo.alt || '')}">`)
      .join('')}</div>
    <div class="fb-bar">
      <button type="button" class="car-prev" aria-label="Previous image">[ BACK ]</button>
      <span class="fb-count" aria-live="polite"></span>
      <button type="button" class="car-next" aria-label="Next image">[ NEXT ]</button>
    </div>
  </div>`;

export function openLightbox({ photos, start = 0, heading = '', trigger: opener = null }) {
  if (isMobile.matches || !photos?.length) return;   // no lightbox on mobile: images stay in the page
  trigger = opener;
  title.innerHTML = heading;
  modal.classList.toggle('modal--single', photos.length === 1);

  // A fresh carousel every time, already on the right image (data-start)
  $('.car', modal)?.remove();
  panel.insertAdjacentHTML('beforeend', carouselMarkup(photos, start));
  initCarousels(modal);

  void modal.offsetWidth;   // flush styles so the first image appears instantly, not as a crossfade
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  $('.car', modal).focus({ preventScroll: true });   // so ← → work straight away
}

export function closeLightbox() {
  if (!modal.classList.contains('is-open')) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  trigger?.focus({ preventScroll: true });
  trigger = null;
}

// Any standalone image, present or future
on(document, 'click', event => {
  const img = event.target;
  if (isZoomable(img)) openLightbox({ photos: [{ src: img.currentSrc || img.src, alt: img.alt }] });
});

// Zoom cursor, added the first time the pointer reaches a zoomable image
on(document, 'mouseover', event => {
  if (isZoomable(event.target)) event.target.classList.add('is-zoomable');
});

on($('.close-btn', modal), 'click', closeLightbox);
on(document, 'keydown', event => { if (event.key === 'Escape') closeLightbox(); });