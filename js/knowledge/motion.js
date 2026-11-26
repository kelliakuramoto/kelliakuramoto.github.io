import { isOpen, overview, reader, readerContent, readerType } from './state.js';

// ---- Motion: every page change uses the same fades as the CSS ----
// Durations come from the same tokens as the CSS (both are 0 for reduced motion).
const cssSeconds = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) * 1000 || 0;
export const VIEW_MS = cssSeconds('--motion-view');       // overview <-> reader crossfade
export const LAYER_MS = cssSeconds('--motion-view');    // the whole Knowledge layer fading in / out
const EASE_OUT = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() || 'ease-out';

// Runs `change` with the CSS transitions switched off, so it takes effect at once (used while the layer is hidden)
export function instant(change) {
  const els = [overview, reader];
  els.forEach(el => { el.style.transition = 'none'; });
  change();
  void reader.offsetWidth;                          // apply it before the transitions come back
  els.forEach(el => { el.style.transition = ''; });
}

// Page -> page while the reader is already open: fade out, swap, fade in, over the same time and ease-out
// as the overview <-> reader crossfade. From the overview (or a hidden layer) the CSS crossfade does the work.
export function present(render) {
  if (!reader.classList.contains('is-open') || !isOpen() || !VIEW_MS) { render(); return; }
  const half = VIEW_MS / 2;
  const fade = (from, to, fill) => [readerType, readerContent].map(el =>
    el.animate([{ opacity: from }, { opacity: to }], { duration: half, easing: EASE_OUT, fill }));
  const out = fade(1, 0, 'forwards');
  out[0].finished.then(() => {
    render();
    fade(0, 1, 'none');
    out.forEach(animation => animation.cancel());
  });
}
