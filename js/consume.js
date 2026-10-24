import { $, esc } from './dom.js';

// =====================================================
// 3. consume board
// Add, remove or reorder items here. Layout and book cover colours are automatic.
//   book:    { type, title, by, color? (cover colour), url? (external link) }
//   podcast: { type, show, episode, minutes, progress? (0-100), image? (path), url? (external link) }
//   quote:   { type, text, highlight? (exact words to mark), by }
// =====================================================
const COLLECTION = [
  {
    type: 'podcast',
    show: 'What Now? With Trevor Noah',
    episode: 'Lera Boroditsky: How Language Secretly Changes Your Personality',
    minutes: 111,
    progress: 21,
    image: 'images/consume/what-now.png',
    url: 'https://youtu.be/UVhAceBQmpY?si=Xk2LRWulUE9_W7gx'
  },
  {
    type: 'book',
    title: 'These Impossible Things',
    by: 'Salma El-Wardany',
    color: '#7a2a33',
    image: 'images/consume/these-impossible-things.jpg',
    url: 'https://www.goodreads.com/book/show/59228196-these-impossible-things'
  },
  {
    type: 'book',
    title: 'Everything is Tuberculosis',
    by: 'John Green',
    color: '#1d3a2b',
    image: 'images/consume/everything-is-tuberculosis.jpg',
    url: 'https://www.goodreads.com/book/show/220341389-everything-is-tuberculosis',
  },
  {
    type: 'podcast',
    show: 'Huberman Lab',
    episode: 'The Art of Learning & Living Life | Josh Waitzkin',
    minutes: 197,
    progress: 62,
    image: 'images/consume/huberman-lab.png',
    url: 'https://www.youtube.com/watch?v=wAnDWfEIwoE'
  },
  {
    type: 'quote',
    text: 'Strong opinions, loosely held.',
    highlight: 'loosely held',
    by: 'Unknown'
  },
  {
    type: 'poem',
    title: 'The Gardener',
    by: 'Mary Oliver',
    image: 'images/consume/the-gardener.png',
    url: 'https://www.instagram.com/p/DNnpayAODMo/',
  },
  {
    type: 'quote',
    text: 'When life feels unbearable, I remind myself that I am not a person, I am a piece of software running on the brain of a random ape for a few decades. It’s not the worst brain to run on.',
    highlight: 'I am not a person, I am a piece of software',
    by: 'Joscha Bach'
  },
  {
    type: 'podcast',
    show: '99% Invisible',
    episode: 'The Score',
    minutes: 26,
    progress: 52,
    image: 'images/consume/99-pi.png',
    url: 'https://youtu.be/QWG6u9yP7uQ?si=5euluw3dWN3DBamp'
  },
  {
    type: 'book',
    title: 'This is Water',
    by: 'David Foster Wallace',
    color: '#1d3a2b',
    image: 'images/consume/this-is-water.jpg',
    url: 'https://www.goodreads.com/book/show/5986375-this-is-water'
  },
  {
    type: 'book',
    title: 'Beartown',
    by: 'Fredrik Backman',
    color: '#1d3a2b',
    image: 'images/consume/beartown.jpg',
    url: 'https://www.goodreads.com/book/show/33413128-beartown'
  },
  {
    type: 'podcast',
    show: 'What Now? With Trevor Noah',
    episode: 'Arthur C Brooks: Are We Happy Yet?',
    minutes: 127,
    progress: 98,
    image: 'images/consume/what-now.png',
    url: 'https://youtu.be/xHZmw3JhT48?si=9_TKbWKsrs1-dklP'
  },
  {
    type: 'quote',
    text: 'People think simplifying is removing things, and it’s not. Simplifying is understanding something so deeply that you can get to the essence of something.',
    highlight: 'understanding something so deeply that you can get to the essence',
    by: 'Brian Chesky'
  },
  {
    type: 'quote',
    text: 'Maybe fulfillment is not about what you get out, but how much of yourself you put in.',
    highlight: 'how much of yourself you put in',
    by: 'Unknown'
  },
  {
    type: 'poem',
    title: 'The Sun Never Says',
    by: 'Hafiz',
    image: 'images/consume/the-sun-never-says.webp',
    url: 'https://www.goodreads.com/quotes/60389-even-after-all-this-time-the-sun-never-says-to/',
  },
  {
    type: 'book',
    title: 'Think Again',
    by: 'Adam Grant',
    color: '#1d3a2b',
    image: 'images/consume/think-again.jpeg',
    url: 'https://www.goodreads.com/book/show/55539565-think-again'
  },
  {
    type: 'book',
    title: 'The Anthropologists',
    by: 'Ayşegül Savaş',
    color: '#1d3a2b',
    image: 'images/consume/the-anthropologists.jpg',
    url: 'https://www.goodreads.com/book/show/195391751-the-anthropologists'
  },
  {
    type: 'poem',
    title: 'Life is Not a Race',
    by: 'Alan Watts',
    image: 'images/consume/life-is-not-a-race.jpg',
    url: 'https://www.instagram.com/p/DZyN6miE1Am/?img_index=2',
  },
  {
    type: 'quote',
    text: 'An acorn never berates itself for not being an oak tree, and yet it continues to grow. Because that is what it was encoded to do.',
    highlight: 'what it was encoded to do',
    by: 'James Clear'
  },
  {
    type: 'book',
    title: 'Letters to a Young Poet',
    by: 'Rainer Maria Rilke',
    color: '#7a2a33',
    image: 'images/consume/letters-to-a-young-poet.jpeg',
    url: 'https://www.goodreads.com/en/book/show/46199.Letters_to_a_Young_Poet'
  },
  {
    type: 'poem',
    title: 'Letters to a Young Creator',
    by: 'Steve Jobs',
    image: 'images/consume/letters-to-a-young-creator.png',
    url: 'https://letters.stevejobsarchive.com/',
  },
];

// Fallback cover colours for books without a `color` (cycled by position)
const BOOK_COLORS = ['#2f4858', '#1d3a2b', '#7a2a33', '#5b5266'];

// Wraps only the `highlight` substring in <mark>. No highlight (or no match) = no underline.
function quoteHTML(text, highlight) {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (i === -1) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(highlight) + '</mark>' + esc(text.slice(i + highlight.length));
}

// Returns the inner HTML for one board card, based on its type
function cardHTML(it, i) {
  if (it.type === 'book') {
    const color = it.color || BOOK_COLORS[i % BOOK_COLORS.length];
    // With an image: show the real cover. Without: the generated colour cover.
    const cover = it.image
      ? `<img class="c-cover-img" src="${esc(it.image)}" alt="${esc(it.title)} cover">`
      : `<div class="c-cover" style="background:${esc(color)}"><strong>${esc(it.title)}</strong><span>${esc(it.by)}</span></div>`;
    return `
      <div class="c-media c-book">${cover}</div>
      <div class="c-meta"><div><h3 class="c-title">${esc(it.title)}</h3><p class="c-sub">${esc(it.by)}</p></div></div>`;
  }

  if (it.type === 'podcast') {
    const img  = it.image ? `<img src="${esc(it.image)}" alt="">` : '';
    const progress = Math.min(100, Math.max(0, Number(it.progress) || 0));
    const prog = it.progress != null ? `<div class="c-progress" role="progressbar" aria-label="Listening progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div>` : '';
    const mins = it.minutes ? `<p class="c-sub">${esc(it.minutes)} min</p>` : '';
    return `
      <div class="c-media c-podcast">${img}${prog}</div>
      <div class="c-meta"><div><h3 class="c-title">${esc(it.episode)}</h3><p class="c-sub">${esc(it.show)}</p>${mins}</div><span class="c-tag"></span></div>`;
  }

  if (it.type === 'poem') {
    // With an image: show it as-is (4:5 artwork). Without: render the text.
    const body = it.image
      ? `<img class="c-poem-img" src="${esc(it.image)}" alt="${esc(it.title)}">`
      : `<div class="c-poemtext">${esc(it.text)}</div>`;
    return `
      <div class="c-media c-poem">${body}</div>
      <div class="c-meta"><div><h3 class="c-title">${esc(it.title)}</h3><p class="c-sub">${esc(it.by)}</p></div></div>`;
  }

  // Quote (the default type)
  return `
    <div class="c-media c-quotetext"><blockquote>${quoteHTML(it.text, it.highlight)}</blockquote></div>
    <div class="c-meta"><p class="c-sub">${esc(it.by)}</p><span class="c-tag"></span></div>`;
}

// Fisher-Yates shuffle: returns a new, randomly ordered copy of the array
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Render every item in COLLECTION into the board, in a new random order each page load.
// Each item keeps its original index so generated book colours stay the same.
const board = $('#board');
if (board) board.innerHTML = shuffle(
  COLLECTION.map((it, i) => ({ it, i }))
).map(({ it, i }) => {
  const inner = cardHTML(it, i);
  // Books and podcasts with a url: the whole card is an external link
  if (it.url && it.type !== 'quote') {
    return `<a class="c-card" data-type="${esc(it.type)}" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  }
  return `<article class="c-card" data-type="${esc(it.type)}">${inner}</article>`;
}).join('');