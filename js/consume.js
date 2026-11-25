import { $, shuffle } from './dom.js';
import { peekFrame, deskFrame } from './cards.js';
import { all, refKey } from './content/index.js';
import { cardFor, peekLinks, hasDetail, detailCard, attachedKinds } from './content/kinds.js';

// =====================================================
// Consume board
// The items live in js/content/data/library.js. This file only draws the board.
// A card with things attached (quotes, definitions, thoughts, questions, essays) shows small sticky notes peeking out from
// behind its cover when you hover it, and opens its own detail page when you click it (js/detail.js).
// A quote with a connection keeps the "Peek into my mind" overlay.
// =====================================================

// One board tile.
//   hasDetail(item)   something is attached: sticky notes on hover + click opens the detail page
//   cardFor(item, false) display-only card (clicking it follows the book/podcast's own url)
//   peekLinks(item)   one button per connected page; [] means no overlay at all
const boardCard = item => hasDetail(item)
  ? deskFrame(detailCard(item), refKey(item.kind, item.id), attachedKinds(item))
  : peekFrame(cardFor(item, false), peekLinks(item));

const board = $('#board');
if (board) board.innerHTML = shuffle(all('media')).map(boardCard).join('');

