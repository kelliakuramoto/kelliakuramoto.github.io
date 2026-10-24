import { esc } from './dom.js';

// =====================================================
// 4. Photography sections (inside section-4)
//   section: { title, meta? (e.g. "Film, 2025"), photos: [...] }
//   photo:   { src? (image path), alt?, ratio? ("4/5", "3/2", "1/1"), title?, sub? }
//   No src = grey placeholder. No ratio = the photo keeps its own proportions.
// =====================================================
// Helper for making grey placeholder photos from a list of ratios (currently unused)
const placeholders = ratios => ratios.map(ratio => ({ ratio }));

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

// Only accept ratios like "4/5" or "1.5/1" before putting them in a style attribute
const RATIO_OK = /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/;

// Returns the HTML for one photo card (image plus optional title/sub caption)
function photoCardHTML(p) {
  const style = RATIO_OK.test(p.ratio || '') ? ` style="aspect-ratio:${esc(p.ratio)}"` : '';
  const img = p.src
    ? `<img src="${esc(p.src)}" alt="${esc(p.alt || p.title || 'Photograph')}" loading="lazy" decoding="async">`
    : '';
  const meta = (p.title || p.sub)
    ? `<div class="c-meta"><div>${p.title ? `<h3 class="c-title">${esc(p.title)}</h3>` : ''}${p.sub ? `<p class="c-sub">${esc(p.sub)}</p>` : ''}</div></div>`
    : '';
  return `<article class="c-card"><div class="c-media"${style}>${img}</div>${meta}</article>`;
}

// Render each photo section (heading + masonry board) into the Photography project
const photoRoot = document.getElementById('photoSections');
if (photoRoot) {
  photoRoot.innerHTML = PHOTO_SECTIONS.map(s => `
    <div class="photo-group">
      <h3 class="photo-heading"><span>${esc(s.title)}</span>${s.meta ? `<span class="photo-meta">${esc(s.meta)}</span>` : ''}</h3>
      <div class="photo-board">${s.photos.map(photoCardHTML).join('')}</div>
    </div>`).join('');
}