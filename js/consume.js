import { $ } from './dom.js';
import { peekFrame } from './cards.js';
import { all } from './content/index.js';
import { cardFor, peekLinks } from './content/kinds.js';

// =====================================================
// Consume board
// The items live in js/content/data/library.js. This file only draws the board.
// Any item with a connection (a definition or essay that links to it, or that it links to)
// gets a "Peek into my mind" overlay automatically.
// =====================================================

// Fisher-Yates shuffle (every page load gets a new random board order): returns a new, randomly ordered copy of the array
function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// One board tile: the media's own card, wrapped in the "Peek into my mind" overlay when it has connections.
//   cardFor(item, false)  display-only card (clicking it follows the book/podcast's own url)
//   peekLinks(item)       one button per connected page; [] means no overlay at all
const boardCard = item => peekFrame(cardFor(item, false), peekLinks(item));

const board = $('#board');
if (board) board.innerHTML = shuffle(all('media')).map(boardCard).join('');
