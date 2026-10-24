import { $, $$, on, esc, showOnly } from './dom.js';
import { PROJECTS } from './project-data.js';

// =====================================================
// 1. CREATE: project grid + sidebar
// =====================================================
const scrollArea = $('#scrollArea');
const navRoot = $('#projectNavItems');
const gridRoot = $('#projectGrid');
if (navRoot) {
  const groups = [...new Set(PROJECTS.map(project => project.group))];
  navRoot.innerHTML = groups.map(group => `<h3>${esc(group)}</h3>${PROJECTS.filter(project => project.group === group).map(project => `<a href="#${esc(project.id)}" class="nav-link">${esc(project.question)}</a>`).join('')}`).join('');
}
if (gridRoot) {
  gridRoot.innerHTML = PROJECTS.map(project => `<a href="#${esc(project.id)}" class="grid-item"><div class="media"><img src="${esc(project.thumbnail)}" alt="${esc(project.alt)}"><div class="grid-caption"><h3>${esc(project.title)}</h3><p class="grid-desc">${esc(project.description)}</p></div></div></a>`).join('');
}
const navLinks = $$('.nav-link');
const gridItems = $$('.grid-item');
const projects = $$('.project');
const closeBtns = $$('.project .close-btn');   // only the case studies: the Knowledge reader has its own [ CLOSE ]
const projectGrid = $('#projectGrid');

// Media queries (the first matches the stacked mobile layout breakpoint in the CSS)
const isMobile      = window.matchMedia('(max-width: 800px)');
const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---- Scroll animation ------------------------------------------
// Same duration and ease-out as the CSS fades (--motion-view).
// (Native smooth scrolling can't be given a duration or curve, so this is done by hand.)
const SCROLL_MS = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-view')) * 1000;

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
on(scrollArea, 'wheel', stopScroll, { passive: true });

// Animate `container` (the window, or the scrollable right panel) to `top`
export function animateScrollTo(container, top) {
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
  if (view) showOnly(views, view);
}

// Open a project by id: highlight its sidebar link, show it, scroll to its start
function showDetail(id) {
  const target = document.getElementById(id);
  if (!target || !views.includes(target)) return;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  showView(target);
  scrollToStart(target);
  setHash(id);
}

// Back to the overview grid
function showAll() {
  navLinks.forEach(l => l.classList.remove('active'));
  showView(projectGrid);
  scrollToStart(scrollArea);
  setHash('');
}

// Keeps the address bar in step with the open project.
// pushState doesn't fire hashchange, and it lets the browser Back button work.
function setHash(id) {
  const next = id ? '#' + id : '';
  if (location.hash === next) return;
  history.pushState(null, '', location.pathname + location.search + next);
}

// ---- Event wiring ----------------------------------------------
// Sidebar questions and grid tiles both open their project
[...navLinks, ...gridItems].forEach(link => {
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
  const targetsByHref = new Map(targets.map(element => [element.getAttribute('href'), element]));
  sources.forEach(source => {
    const target = targetsByHref.get(source.getAttribute('href'));
    if (!target) return;
    on(source, 'mouseenter', () => target.classList.add('highlighted'));
    on(source, 'mouseleave', () => target.classList.remove('highlighted'));
  });
}

syncHover(navLinks, gridItems);
syncHover(gridItems, navLinks);


// =====================================================
// 2. CREATE / Consume toggle
// =====================================================
const modeBtns = $$('.mode-btn');

// CSS reads body[data-mode] to crossfade the views; aria-pressed marks the active button
function setMode(mode) {
  document.body.dataset.mode = mode;
  modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  document.dispatchEvent(new CustomEvent('mode:changed'));   // js/knowledge.js closes itself on this
}

modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));


// =====================================================
// ARROW KEYS: ← CREATE   → CONSUME
// =====================================================
document.addEventListener('keydown', e => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;   // leave browser shortcuts alone (Cmd+← = Back)

  // Don't steal arrows from typing, or from the carousels and photobook,
  // which use ← → to turn their own pages
  if (e.target instanceof Element && e.target.closest('input, textarea, [contenteditable], .car, .fb')) return;

  setMode(e.key === 'ArrowLeft' ? 'create' : 'consume');
});
