// =====================================================
// Photography sections (inside the Photography project): the photos themselves.
// js/photography.js draws them; add a photo here and it appears in the board and the lightbox.
//   section: { title, meta? (e.g. "Film, 2025"), photos: [...] }
//   photo:   { src? (image path), alt?, ratio? ("4/5", "3/2", "1/1"), title?, sub? }
//   No src = grey placeholder. No ratio = the photo keeps its own proportions.
//   alt: describe what is in the photo for screen readers. Left out, it reads "San Francisco, photo 3 of 9".
// =====================================================
export const PHOTO_SECTIONS = [
  {
    title: 'San Francisco',
    meta: '2024 - Present',
    photos: [
      { src: 'images/Photography/ca-1.jpg', ratio: '2/3' },
      { src: 'images/Photography/ca-2.jpg', ratio: '5/4' },
      { src: 'images/Photography/ca-3.jpg', ratio: '2/3' },
      { src: 'images/Photography/ca-4.jpg', ratio: '2/3' },
      { src: 'images/Photography/ca-5.jpg', ratio: '2/3' },
      { src: 'images/Photography/ca-6.JPG', ratio: '5/4' },
      { src: 'images/Photography/ca-7.JPG', ratio: '2/3' },
      { src: 'images/Photography/ca-8.JPG', ratio: '5/4' },
      { src: 'images/Photography/ca-9.jpg', ratio: '2/3' },
    ],
  },
  {
    title: 'Yosemite',
    meta: 'April 2026',
    photos: [
      { src: 'images/Photography/yosemite-1.JPG', ratio: '5/4' },
      { src: 'images/Photography/yosemite-2.JPG', ratio: '2/3' },
      { src: 'images/Photography/yosemite-3.JPG', ratio: '2/3' },
      { src: 'images/Photography/yosemite-4.JPG', ratio: '5/4' },
      { src: 'images/Photography/yosemite-5.JPG', ratio: '2/3' },
      { src: 'images/Photography/yosemite-6.JPG', ratio: '5/4' },
      { src: 'images/Photography/yosemite-7.JPG', ratio: '2/3' },
      { src: 'images/Photography/yosemite-8.JPG', ratio: '2/3' },
      { src: 'images/Photography/yosemite-9.JPG', ratio: '2/3' },
    ],
  },
  {
    title: 'Japan',
    meta: 'May 2025',
    photos: [
      { src: 'images/Photography/japan-1.jpg', ratio: '5/4' },
      { src: 'images/Photography/japan-2.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-3.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-4.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-5.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-6.jpg', ratio: '5/4' },
      { src: 'images/Photography/japan-7.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-8.jpg', ratio: '5/4' },
      { src: 'images/Photography/japan-9.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-10.jpg', ratio: '2/3' },
      { src: 'images/Photography/japan-11.jpg', ratio: '5/4' },
    ],
  },
];

// A photo without its own alt text gets one from its place in the section
PHOTO_SECTIONS.forEach(section => section.photos.forEach((photo, i) => {
  photo.alt ||= `${section.title}, photo ${i + 1} of ${section.photos.length}`;
}));
