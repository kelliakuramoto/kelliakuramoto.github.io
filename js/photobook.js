// =====================================================
// 7. Photobook
// A page-flip book built from 16 images (images/Photobook/page-1.png ...).
// Each "leaf" is one sheet with a front and a back; flipping toggles the
// `f` class and CSS rotates it. Click, arrow keys, buttons and swipe all
// turn pages.
// =====================================================
(() => {
  const $ = id => document.getElementById(id);
  const fb = $('fb'), book = $('fbBook'), prev = $('fbPrev'), next = $('fbNext'), count = $('fbCount');
  if (!book) return;

  // N = total pages, START = first image number
  const N = 16, START = 1;
  // Flip time in ms, read from --motion-book in the CSS so the two can't drift apart
  const DUR = parseFloat(getComputedStyle(fb).getPropertyValue('--motion-book')) || 0;
  const url = i => `url(images/Photobook/page-${i + START}.png)`;
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
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry], observer) => {
      if (entry.isIntersecting) { seen = true; observer.disconnect(); render(); }
    }).observe(fb);
  } else {
    seen = true;
  }

  render();
})();


