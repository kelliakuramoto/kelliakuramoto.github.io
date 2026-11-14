// =====================================================
// Cursor dot
// Over anything clickable the pointer becomes a dot (styled in styles.css, .cursor-dot).
// Mouse and trackpad only: touch screens have no hover, so nothing happens there.
// Anything new that is a link, a button or an enlargeable image gets the dot without changes here.
// =====================================================
const CLICKABLE = [
  'a[href]',
  'button:not(:disabled)',
  '[role="button"]',
  '[data-term]',               // definition links and "Peek into my mind"
  '[data-essay]',
  '[data-knowledge-kind]',     // Knowledge cards
  '.is-zoomable',              // images that enlarge (js/lightbox.js)
  '.fb-book',                  // the photobook: click the left or right half to turn the page
  'label',
  'summary',
].join(',');

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(dot);

  const show = visible => {
    dot.classList.toggle('is-visible', visible);
    document.documentElement.classList.toggle('dot-active', visible);   // hides the real pointer
  };

  document.addEventListener('pointermove', event => {
    dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    show(event.target instanceof Element && !!event.target.closest(CLICKABLE));
  }, { passive: true });

  // Leaving the window (or the page scrolling away under a still pointer) must not strand the dot
  document.addEventListener('pointerleave', () => show(false));
  window.addEventListener('blur', () => show(false));
}