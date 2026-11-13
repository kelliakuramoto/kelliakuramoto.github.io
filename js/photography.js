import { on, esc } from './dom.js';
import { imageCard } from './cards.js';
import { openLightbox } from './lightbox.js';

// =====================================================
// Photography sections (inside the Photography project)
//   section: { title, meta? (e.g. "Film, 2025"), photos: [...] }
//   photo:   { src? (image path), alt?, ratio? ("4/5", "3/2", "1/1"), title?, sub? }
//   No src = grey placeholder. No ratio = the photo keeps its own proportions.
// =====================================================
const PHOTO_SECTIONS = [
  {
    title: 'San Francisco',
    meta: '2024 - Present',
    photos: [
      { src: 'images/Photography/ca-1.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/ca-2.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/ca-3.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/ca-4.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/ca-5.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/ca-6.JPG', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/ca-7.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/ca-8.JPG', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/ca-9.jpg', alt: 'Describe the photo', ratio: '2/3' },
    ],
  },
  {
    title: 'Yosemite',
    meta: 'April 2026',
    photos: [
      { src: 'images/Photography/yosemite-1.JPG', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/yosemite-2.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/yosemite-3.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/yosemite-4.JPG', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/yosemite-5.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/yosemite-6.JPG', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/yosemite-7.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/yosemite-8.JPG', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/yosemite-9.JPG', alt: 'Describe the photo', ratio: '2/3' },
    ],
  },
  {
    title: 'Japan',
    meta: 'May 2025',
    photos: [
      { src: 'images/Photography/japan-1.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/japan-2.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-3.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-4.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-5.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-6.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/japan-7.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-8.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/Photography/japan-9.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-10.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/Photography/japan-11.jpg', alt: 'Describe the photo', ratio: '5/4' },
    ],
  },
];

// // Each section: a heading with its date, then a masonry board of photo cards (js/cards.js)
// const photoRoot = document.getElementById('photoSections');
// if (photoRoot) {
//   photoRoot.innerHTML = PHOTO_SECTIONS.map(section => `
//     <div class="photo-group">
//       <h3 class="photo-heading"><span>${esc(section.title)}</span>${section.meta ? `<span class="photo-meta">${esc(section.meta)}</span>` : ''}</h3>
//       <div class="photo-board">${section.photos.map(photo => imageCard(photo)).join('')}</div>
//     </div>`).join('');
// }

// Every photo in order, so the lightbox can step through all sections
const ALL_PHOTOS = PHOTO_SECTIONS.flatMap(section => section.photos);

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