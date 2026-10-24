import { esc } from './dom.js';
import { imageCard } from './cards.js';

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

// Each section: a heading with its date, then a masonry board of photo cards (js/cards.js)
const photoRoot = document.getElementById('photoSections');
if (photoRoot) {
  photoRoot.innerHTML = PHOTO_SECTIONS.map(section => `
    <div class="photo-group">
      <h3 class="photo-heading"><span>${esc(section.title)}</span>${section.meta ? `<span class="photo-meta">${esc(section.meta)}</span>` : ''}</h3>
      <div class="photo-board">${section.photos.map(photo => imageCard(photo)).join('')}</div>
    </div>`).join('');
}
