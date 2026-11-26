import { setHash } from '../dom.js';
import { nav } from './state.js';

// ---- URLs ---------------------------------------------------------
// Whatever is open in Knowledge is mirrored in the address bar as #knowledge/<kind>/<id>,
// so any page can be linked to directly and the browser Back button works.
export const hashFor = page =>
  page ? `#mymind/${page.kind}/${encodeURIComponent(page.id)}` : '#mymind';

export function setUrl(next, { replace = false } = {}) {
  if (location.hash === next) return;   // already there (e.g. we got here via Back / a pasted link)
  if (next.startsWith('#mymind') && !location.hash.startsWith('#mymind')) {
    nav.hashBefore = location.hash;
  }
  setHash(next, { replace });
}
