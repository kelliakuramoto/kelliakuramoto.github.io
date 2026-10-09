/* =====================================================
   script.js: Kelli Kuramoto portfolio

   1. CREATE: project grid + sidebar   (navigation, scroll animation, hover sync)
   2. CREATE / CONSUME toggle          (switches between the two views)
   3. CONSUME board                    (quotes, books, podcasts; edit COLLECTION)
   4. PHOTOGRAPHY sections             (edit PHOTO_SECTIONS)
   5. PASSWORD GATE                    (Amazon Music case study)
   6. VIDEO: pause when off-screen
   7. PHOTOBOOK                        (page-flip book)
   8. CAROUSEL                         (looping image slideshow)
   ===================================================== */

// =====================================================
// 1. CREATE: project grid + sidebar
// =====================================================
// Page elements
const scrollArea = document.getElementById('scrollArea');
const navLinks   = Array.from(document.querySelectorAll('.nav-link'));
const gridItems  = Array.from(document.querySelectorAll('.grid-item'));
const projects   = Array.from(document.querySelectorAll('.project'));
const closeBtns  = Array.from(document.querySelectorAll('.close-btn'));
const projectGrid = document.getElementById('projectGrid');

// Media queries (the first matches the stacked mobile layout breakpoint in the CSS)
const isMobile      = window.matchMedia('(max-width: 800px)');
const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---- Scroll animation ------------------------------------------
// Same 0.8s ease-out as the CSS fades.
// (Native smooth scrolling can't be given a duration or curve, so this is done by hand.)
const SCROLL_MS = 800;

// Builds an easing function from CSS-style cubic-bezier control points.
// The curve is defined by x(t) and y(t), so Newton's method solves for the t
// that matches the given progress x, then returns y at that t.
function cubicBezier(x1, y1, x2, y2) {
  const sample = (a, b, c, t) => ((a * t + b) * t + c) * t;
  const A = [1 - 3 * x2 + 3 * x1, 3 * x2 - 6 * x1, 3 * x1];
  const B = [1 - 3 * y2 + 3 * y1, 3 * y2 - 6 * y1, 3 * y1];
  return x => {
    let t = x;
    for (let i = 0; i < 8; i++) {            // Newton's method: find t where x(t) = x
      const err = sample(...A, t) - x;
      const slope = (3 * A[0] * t + 2 * A[1]) * t + A[2];
      if (Math.abs(err) < 1e-5 || slope === 0) break;
      t -= err / slope;
    }
    return sample(...B, t);
  };
}
// CSS `ease-out` is cubic-bezier(0, 0, 0.58, 1)
const easeOut = cubicBezier(0, 0, 0.58, 1);

// Id of the running animation frame, so it can be cancelled
let scrollFrame;
const stopScroll = () => cancelAnimationFrame(scrollFrame);

// Let the user take over: touching or wheeling mid-animation cancels it
['wheel', 'touchstart'].forEach(evt =>
  window.addEventListener(evt, stopScroll, { passive: true })
);
scrollArea.addEventListener('wheel', stopScroll, { passive: true });

// Animate `container` (the window, or the scrollable right panel) to `top`
function animateScrollTo(container, top) {
  const isWindow = container === window;
  const read  = () => (isWindow ? window.scrollY : container.scrollTop);
  const write = y => (isWindow ? window.scrollTo(0, y) : (container.scrollTop = y));

  const start  = read();
  const change = top - start;

  stopScroll();
  if (reduceMotion.matches || Math.abs(change) < 1) { write(top); return; }

  const t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / SCROLL_MS, 1);
    write(start + change * easeOut(p));
    if (p < 1) scrollFrame = requestAnimationFrame(step);
  };
  scrollFrame = requestAnimationFrame(step);
}

// Where the page should scroll so `el` sits at the top, honouring the CSS
// scroll-margin-top on the element and scroll-padding-top on <html>
function pageTopOf(el) {
  const px = v => parseFloat(v) || 0;
  const margin  = px(getComputedStyle(el).scrollMarginTop);
  const padding = px(getComputedStyle(document.documentElement).scrollPaddingTop);
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin - padding);
}

// Desktop: the right panel scrolls, so animate it back to the top.
// Mobile: the whole page scrolls, so animate `target` to the top of the screen.
function scrollToStart(target) {
  if (isMobile.matches) {
    animateScrollTo(window, pageTopOf(target));
  } else {
    animateScrollTo(scrollArea, 0);
  }
}

// ---- View switching --------------------------------------------
// Only one view is "visible" at a time; CSS handles the crossfade.
const views = [projectGrid, ...projects];

// Show `view` (the grid or one project) and hide the rest
function showView(view) {
  views.forEach(v => v.classList.toggle('visible', v === view));
}

// Open a project by id: highlight its sidebar link, show it, scroll to its start
function showDetail(id) {
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  const target = document.getElementById(id);
  showView(target);
  scrollToStart(target);
}

// Back to the overview grid
function showAll() {
  navLinks.forEach(l => l.classList.remove('active'));
  showView(projectGrid);
  scrollToStart(scrollArea);
}

// ---- Event wiring ----------------------------------------------
// Sidebar questions and grid tiles both open their project
navLinks.concat(gridItems).forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showDetail(link.getAttribute('href').slice(1));
  });
});

// [ CLOSE ] returns to the overview grid
closeBtns.forEach(btn => btn.addEventListener('click', showAll));

// Hover sync: hovering one element highlights its match in the other list.
// A highlighted grid tile reveals its caption; a highlighted nav link turns blue.
function syncHover(sources, targets) {
  sources.forEach(source => {
    const href = source.getAttribute('href');
    const target = targets.find(el => el.getAttribute('href') === href);
    if (!target) return;
    source.addEventListener('mouseenter', () => target.classList.add('highlighted'));
    source.addEventListener('mouseleave', () => target.classList.remove('highlighted'));
  });
}

syncHover(navLinks, gridItems);
syncHover(gridItems, navLinks);


// =====================================================
// 2. CREATE / CONSUME toggle
// =====================================================
const modeBtns = Array.from(document.querySelectorAll('.mode-btn'));

// CSS reads body[data-mode] to crossfade the views; aria-pressed marks the active button
function setMode(mode) {
  document.body.dataset.mode = mode;
  modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
}

modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));


// =====================================================
// 3. CONSUME board
// Add, remove or reorder items here. Layout and book cover colours are automatic.
//   book:    { type, title, by, color? (cover colour), url? (external link) }
//   podcast: { type, show, episode, minutes, progress? (0-100), image? (path), url? (external link) }
//   quote:   { type, text, highlight? (exact words to mark), by }
// =====================================================
const COLLECTION = [
  {
    type: 'podcast',
    show: 'What Now? With Trevor Noah',
    episode: 'Lera Boroditsky: How Language Secretly Changes Your Personality',
    minutes: 111,
    progress: 21,
    image: 'images/consume/what-now.png',
    url: 'https://youtu.be/UVhAceBQmpY?si=Xk2LRWulUE9_W7gx'
  },
  {
    type: 'quote',
    text: 'Maybe fulfillment is not about what you get out, but how much of yourself you put in.',
    highlight: 'how much of yourself you put in',
    by: 'Unknown'
  },
  {
    type: 'book',
    title: 'These Impossible Things',
    by: 'Salma El-Wardany',
    color: '#7a2a33',
    image: 'images/consume/these-impossible-things.jpg',
    url: 'https://www.goodreads.com/book/show/59228196-these-impossible-things'
  },
  {
    type: 'book',
    title: 'Everything is Tuberculosis',
    by: 'John Green',
    color: '#1d3a2b',
    image: 'images/consume/everything-is-tuberculosis.jpg',
    url: 'https://www.goodreads.com/book/show/220341389-everything-is-tuberculosis',
  },
  {
    type: 'podcast',
    show: 'Huberman Lab',
    episode: 'The Art of Learning & Living Life | Josh Waitzkin',
    minutes: 197,
    progress: 62,
    image: 'images/consume/huberman-lab.png',
    url: 'https://www.youtube.com/watch?v=wAnDWfEIwoE'
  },
  {
    type: 'quote',
    text: 'When life feels unbearable, I remind myself that I am not a person, I am a piece of software running on the brain of a random ape for a few decades. Its not the worst brain to run on.',
    highlight: 'I am not a person, I am a piece of software',
    by: 'Joscha Basch'
  },
  {
    type: 'podcast',
    show: '99% Invisible',
    episode: 'The Score',
    minutes: 26,
    progress: 52,
    image: 'images/consume/99-pi.png',
    url: 'https://youtu.be/QWG6u9yP7uQ?si=5euluw3dWN3DBamp'
  },
  {
    type: 'book',
    title: 'Beartown',
    by: 'Fredrick Backman',
    color: '#1d3a2b',
    image: 'images/consume/beartown.jpg',
    url: 'https://www.goodreads.com/book/show/33413128-beartown'
  },
  {
    type: 'podcast',
    show: 'What Now? With Trevor Noah',
    episode: 'Arthur C Brooks: Are We Happy Yet?',
    minutes: 127,
    progress: 98,
    image: 'images/consume/what-now.png',
    url: 'https://youtu.be/xHZmw3JhT48?si=9_TKbWKsrs1-dklP'
  },
  {
    type: 'quote',
    text: 'People think simplifying is removing things, and it’s not. Simplifying is understanding something so deeply that you can get to the essence of something.',
    highlight: 'understanding something so deeply that you can get to the essence',
    by: 'Brian Chesky'
  },
  {
    type: 'book',
    title: 'Think Again',
    by: 'Adam Grant',
    color: '#1d3a2b',
    image: 'images/consume/think-again.jpeg',
    url: 'https://www.goodreads.com/book/show/55539565-think-again'
  },
  {
    type: 'book',
    title: 'The Anthropologists',
    by: 'Ayşegül Savaş',
    color: '#1d3a2b',
    image: 'images/consume/the-anthropologists.jpg',
    url: 'https://www.goodreads.com/book/show/195391751-the-anthropologists'
  },
];

// Fallback cover colours for books without a `color` (cycled by position)
const BOOK_COLORS = ['#2f4858', '#1d3a2b', '#7a2a33', '#5b5266'];

// Escape text before it goes into innerHTML
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

// Wraps only the `highlight` substring in <mark>. No highlight (or no match) = no underline.
function quoteHTML(text, highlight) {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (i === -1) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(highlight) + '</mark>' + esc(text.slice(i + highlight.length));
}

// Returns the inner HTML for one board card, based on its type
function cardHTML(it, i) {
  if (it.type === 'book') {
    const color = it.color || BOOK_COLORS[i % BOOK_COLORS.length];
    // With an image: show the real cover. Without: the generated colour cover.
    const cover = it.image
      ? `<img class="c-cover-img" src="${esc(it.image)}" alt="${esc(it.title)} cover">`
      : `<div class="c-cover" style="background:${esc(color)}"><strong>${esc(it.title)}</strong><span>${esc(it.by)}</span></div>`;
    return `
      <div class="c-media c-book">${cover}</div>
      <div class="c-meta"><div><h3 class="c-title">${esc(it.title)}</h3><p class="c-sub">${esc(it.by)}</p></div></div>`;
  }

  if (it.type === 'podcast') {
    const img  = it.image ? `<img src="${esc(it.image)}" alt="">` : '';
    const prog = it.progress != null ? `<div class="c-progress"><i style="width:${Number(it.progress) || 0}%"></i></div>` : '';
    const mins = it.minutes ? `<p class="c-sub">${esc(it.minutes)} min</p>` : '';
    return `
      <div class="c-media c-podcast">${img}${prog}</div>
      <div class="c-meta"><div><h3 class="c-title">${esc(it.episode)}</h3><p class="c-sub">${esc(it.show)}</p>${mins}</div><span class="c-tag"></span></div>`;
  }

  // Quote (the default type)
  return `
    <div class="c-media c-quotetext"><blockquote>${quoteHTML(it.text, it.highlight)}</blockquote></div>
    <div class="c-meta"><p class="c-sub">${esc(it.by)}</p><span class="c-tag"></span></div>`;
}

// Render every item in COLLECTION into the board
document.getElementById('board').innerHTML = COLLECTION.map((it, i) => {
  const inner = cardHTML(it, i);
  // Books and podcasts with a url: the whole card is an external link
  if (it.url && it.type !== 'quote') {
    return `<a class="c-card" data-type="${esc(it.type)}" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  }
  return `<article class="c-card" data-type="${esc(it.type)}">${inner}</article>`;
}).join('');


// =====================================================
// 4. PHOTOGRAPHY sections (inside section-4)
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
      { src: 'images/photography/ca-1.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/ca-2.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/ca-3.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/ca-4.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/ca-5.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/ca-6.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/ca-7.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/ca-8.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/ca-9.jpg', alt: 'Describe the photo', ratio: '2/3' },
    ],
  },
  {
    title: 'Yosemite',
    meta: 'April 2026',
    photos: [
      { src: 'images/photography/yosemite-1.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/yosemite-2.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/yosemite-3.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/yosemite-4.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/yosemite-5.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/yosemite-6.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/yosemite-7.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/yosemite-8.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/yosemite-9.jpg', alt: 'Describe the photo', ratio: '2/3' },
    ],
  },
  {
    title: 'Japan',
    meta: 'May 2025',
    photos: [
      { src: 'images/photography/japan-1.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/japan-2.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-3.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-4.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-5.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-6.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/japan-7.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-8.jpg', alt: 'Describe the photo', ratio: '5/4' },
      { src: 'images/photography/japan-9.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-10.jpg', alt: 'Describe the photo', ratio: '2/3' },
      { src: 'images/photography/japan-11.jpg', alt: 'Describe the photo', ratio: '5/4' },
    ],
  },
];

// Only accept ratios like "4/5" or "1.5/1" before putting them in a style attribute
const RATIO_OK = /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/;

// Returns the HTML for one photo card (image plus optional title/sub caption)
function photoCardHTML(p) {
  const style = RATIO_OK.test(p.ratio || '') ? ` style="aspect-ratio:${esc(p.ratio)}"` : '';
  const img = p.src
    ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">`
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


// =====================================================
// 5. PASSWORD GATE (Amazon Music case study)
// The detailed designs (#restricted-content) start hidden. The right password
// reveals them and hides both the password button and the "Want to learn more?"
// note, which only visitors without access need.
// NOTE: this is a light gate only. The password is readable by anyone who views this file.
// =====================================================
const PASSWORD = 'opensesame';

const unlockBtn    = document.getElementById('password-btn');
const passwordRow  = document.getElementById('password-row');
const content      = document.getElementById('restricted-content');
const learnMoreRow = document.getElementById('learn-more-row');

unlockBtn.addEventListener('click', () => {
  const attempt = prompt('Enter password');

  if (attempt === null) return; // user hit cancel

  if (attempt === PASSWORD) {
    content.hidden = false;
    passwordRow.hidden = true;   // hides the whole row, not just the button
    learnMoreRow.hidden = true;  // "want to learn more" is only for visitors without access
  } else {
    alert('Incorrect password');
  }
});


// =====================================================
// 6. VIDEO: pause when off-screen
// Only applies to the first <video> on the page (the super fan demo):
// it plays while at least half visible and pauses otherwise.
// =====================================================
const v = document.querySelector('video');
new IntersectionObserver(([e]) => e.isIntersecting ? v.play() : v.pause(), { threshold: 0.5 }).observe(v);


// =====================================================
// 7. PHOTOBOOK
// A page-flip book built from 16 images (images/photobook/page-1.png ...).
// Each "leaf" is one sheet with a front and a back; flipping toggles the
// `f` class and CSS rotates it. Click, arrow keys, buttons and swipe all
// turn pages.
// =====================================================
(() => {
  const $ = id => document.getElementById(id);
  const fb = $('fb'), book = $('fbBook'), prev = $('fbPrev'), next = $('fbNext'), count = $('fbCount');
  if (!book) return;

  // N = total pages, START = first image number, DUR = flip time in ms
  const N = 16, START = 1, DUR = 900;               // DUR must match --dur in the CSS
  const url = i => `url(images/photobook/page-${i + START}.png)`;
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const mk = cls => Object.assign(document.createElement('div'), { className: cls });
  const leaves = [], loaded = new Set();
  let p = 0, seen = false;                           // p = current page, seen = project has been opened

  // Resting stack order: unflipped leaves stack down, flipped leaves stack up
  const settle = lf => { lf.style.zIndex = lf.classList.contains('f') ? lf.i : N - lf.i; };

  // Cast shadows on the pages under the turning leaf
  const shR = mk('fb-sh r'), shL = mk('fb-sh l');
  shR.style.zIndex = shL.style.zIndex = N + 1;
  // Fade a shadow in and back out over one flip (skipped for reduced motion)
  const pulse = (el, peak) => still || el.animate(
    [{ opacity: 0 }, { opacity: 1, offset: peak }, { opacity: 0 }],
    { duration: DUR, easing: 'ease-in-out' }
  );

  // Build the book: a background, two shadow layers, then one element per leaf
  const frag = document.createDocumentFragment();
  frag.append(mk('fb-base all'), mk('fb-base r'), shR, shL);
  for (let i = 0; i < N; i++) {
    const lf = mk('fb-leaf'), fr = mk('fb-pg r');   // fr = front of the leaf (right-hand page)
    lf.i = i; lf.fr = fr;
    lf.append(fr);
    if (i < N - 1) lf.append(lf.bk = mk('fb-pg l')); // bk = back of the leaf (left-hand page); the last leaf has none
    lf.ontransitionend = e => { if (e.target === lf && e.propertyName === 'transform') settle(lf); };
    settle(lf);
    leaves.push(lf);
    frag.append(lf);
  }
  book.append(frag);

  // Only fetch an image when it's about to be seen
  const load = s => {
    if (s < 0 || s >= N || loaded.has(s)) return;
    loaded.add(s);
    leaves[s].fr.style.backgroundImage = url(s);
    if (s) leaves[s - 1].bk.style.backgroundImage = url(s);
  };

  // Sync the book to the current page: flip leaves, update buttons and counter, preload nearby images
  const render = () => {
    leaves.forEach((lf, i) => {
      const f = i < p;                               // leaves before the current page are flipped
      if (lf.classList.contains('f') === f) return;
      lf.classList.toggle('f', f);
      if (still) settle(lf);
      else lf.style.zIndex = N + 2;                  // turning page stays on top until it lands
    });
    book.classList.toggle('cover', !p);              // closed-book look on the first page
    prev.disabled = !p;
    next.disabled = p === N - 1;
    count.textContent = `${p + 1} / ${N}`;
    if (seen) for (let s = p - 1; s <= p + 2; s++) load(s);
  };

  // Turn by `d` pages (+1 forward, -1 back), clamped to the book
  const go = d => {
    const n = Math.min(N - 1, Math.max(0, p + d));
    if (n === p) return;
    p = n;
    render();
    pulse(shR, d > 0 ? .25 : .75);
    if (d > 0 || p) pulse(shL, d > 0 ? .75 : .25);   // no left shadow when closing to the cover
  };

  // Controls: buttons, click left/right half of the book, arrow keys
  prev.onclick = e => { e.stopPropagation(); go(-1); };
  next.onclick = e => { e.stopPropagation(); go(1); };
  book.onclick = e => {
    const r = book.getBoundingClientRect();
    go(e.clientX < r.left + r.width / 2 ? -1 : 1);
  };
  fb.onkeydown = e => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  };

  // Swipe: a drag over 40px turns the page, and the click that follows is swallowed
  let x0, swiped;
  book.onpointerdown = e => { x0 = e.clientX; swiped = false; };
  book.onpointerup = e => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 40) { swiped = true; go(dx < 0 ? 1 : -1); }
  };
  book.addEventListener('click', e => { if (swiped) { e.stopImmediatePropagation(); swiped = false; } }, true);

  // Don't download anything until the project is actually opened
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { seen = true; o.disconnect(); render(); }
  }).observe(fb);

  render();
})();


// =====================================================
// 8. CAROUSEL
// Simple looping slideshow used in the Amazon Music case study.
// Each .car shows one .car-slide at a time with back / next buttons and arrow keys.
// =====================================================
document.querySelectorAll('.car').forEach(car => {
  const slides = [...car.querySelectorAll('.car-slide')];
  const count = car.querySelector('.fb-count');
  let i = 0;                                         // index of the visible slide

  const show = n => {
    i = (n + slides.length) % slides.length;         // wraps: after the last comes the first
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    count.textContent = `${i + 1} / ${slides.length}`;
  };

  car.querySelector('.car-prev').onclick = () => show(i - 1);
  car.querySelector('.car-next').onclick = () => show(i + 1);
  car.onkeydown = e => {
    if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
  };

  show(0);
});
