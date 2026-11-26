import { on, esc } from './dom.js';
import { imageCard } from './cards.js';
import { openLightbox } from './lightbox.js';
import { PHOTO_SECTIONS } from './photography-data.js';

// Attributes that make a photo card open the lightbox: which section it is in, and its position there
const photoAttrs = (s, p) =>
  `data-section="${s}" data-photo="${p}" tabindex="0" role="button" aria-label="View photo full screen"`;

  // The heading contents shared by the section list and the lightbox: title, then date
const headingHTML = section =>
`<span>${esc(section.title)}</span>${section.meta ? `<span class="photo-meta">${esc(section.meta)}</span>` : ''}`;

// Each section: a heading with its date, then a masonry board of photo cards (js/cards.js)
const photoRoot = document.getElementById('photoSections');
if (photoRoot) {
  photoRoot.innerHTML = PHOTO_SECTIONS.map((section, s) => `
    <div class="photo-group">
      <h3 class="photo-heading">${headingHTML(section)}</h3>
      <div class="photo-board">${section.photos.map((photo, p) => imageCard({ ...photo, attrs: photoAttrs(s, p) })).join('')}</div>
    </div>`).join('');

    // Clicking (or Enter / Space on) a card opens the shared lightbox on that section's photos
  const open = card => {
    const section = PHOTO_SECTIONS[Number(card.dataset.section)];
    openLightbox({
      photos: section.photos,
      start: Number(card.dataset.photo),
      heading: headingHTML(section),   // title + date, same as the section heading
      trigger: card,
    });
  };

  on(photoRoot, 'click', event => {
    const card = event.target.closest('[data-photo]');
    if (card) open(card);
  });
  on(photoRoot, 'keydown', event => {
    const card = event.target.closest('[data-photo]');
    if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(card); }
  });
}