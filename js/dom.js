/** Shared, small DOM utilities used across feature modules. */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
// Opens `target` and closes every other view in `views` (CSS crossfades on .is-open)
export const showOnly = (views, target) => views.forEach(view => view.classList.toggle('is-open', view === target));
export const on = (element, event, handler, options) => element?.addEventListener(event, handler, options);
export const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
