import { $, shuffle } from './dom.js';
import { peekFrame, deskFrame } from './cards.js';
import { all, refKey } from './content/index.js';
import { cardFor, peekLinks, hasDetail, detailCard, attachedKinds, onBoard } from './content/kinds.js';

// =====================================================
// Consume board
// The items live in js/content/data/library.js. This file only draws the board.
// A card with things attached (quotes, definitions, thoughts, questions, essays) shows small sticky notes peeking out from
// behind its cover when you hover it, and opens its own detail page when you click it (js/detail.js).
// A quote with a connection keeps the "Peek into my mind" overlay.
// A quote attached to a book, podcast or poem is not on the board: it shows on that item's detail page (see onBoard in kinds.js).
// =====================================================

// One board tile.
//   hasDetail(item)   something is attached: sticky notes on hover + click opens the detail page
//   cardFor(item, false) display-only card (clicking it follows the book/podcast's own url)
//   peekLinks(item)   one button per connected page; [] means no overlay at all
const boardCard = item => hasDetail(item)
  ? deskFrame(detailCard(item), refKey(item.kind, item.id), attachedKinds(item))
  : peekFrame(cardFor(item, false), peekLinks(item));

const board = $('#board');
if (board) board.innerHTML = shuffle(all('media').filter(onBoard)).map(boardCard).join('');

