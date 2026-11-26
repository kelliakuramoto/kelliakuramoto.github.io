import { $, $$ } from '../dom.js';

// =====================================================
// KNOWLEDGE: what every part of the Knowledge view shares.
//   the elements of the view (found once, here)
//   `nav`   where the reader is now and how to get back (see reader.js)
//   `hooks` things one part asks another to do, so parts never import each other in a circle
// =====================================================

export const view = $('#knowledgeView');
export const overview = $('#knowledgeOverview');
export const reader = $('#knowledgeReader');
export const readerContent = $('#knowledgeReaderContent');
export const readerType = $('#knowledgeReaderType');
export const closeButton = $('#knowledgeClose');
export const knowledgeToggle = $('#knowledgeToggle');
export const modeButtons = $$('.mode-btn');

// Kinds that have a page of their own in the reader (media just opens its url)
export const OPENABLE = new Set(['article', 'experiment', 'question', 'definition']);

export const isOpen = () => view.classList.contains('is-open');

// Opening something from a page that is already open (an article from the definitions, a definition from an
// article, a definition from Consume...) shows it as a second layer. [ CLOSE ] then returns to the page you
// came from, on the same article / definition and scroll position, instead of the Knowledge overview.
//   current  what the reader shows now: { kind, id } or null for the overview
//   trail    the pages to go back to: { kind, id, scroll }, or 'outside' when Knowledge itself was opened from
//            somewhere else (Consume), so closing the last page closes the whole layer
export const nav = {
  current: null,
  trail: [],
  returnFocus: null,          // what to focus when the reader closes
  currentQuestionId: null,    // the question page that is open, so its responses can be reloaded
  hashBefore: '',             // the hash to restore when Knowledge closes (e.g. #bizbuysell)
};

export const hooks = {
  closeLayer() {},            // set by index.js: closes the whole Knowledge layer
};
