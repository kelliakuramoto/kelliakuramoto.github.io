// =====================================================
// LIBRARY  (kind: 'media'; the Consume board)
// Add, remove or reorder items. Layout and book colours are automatic.
//   book:    { type, title, by, image?, color? }
//   podcast: { type, show, episode, minutes, progress?, image? }
//   poem:    { type, title, by, image }
//   quote:   { type, text, highlight?, by }
// Every item may have:
//   id      every item has one: a short, stable name that links use ('<type>:<id>', e.g. 'book:letters-to-a-young-poet'). Give each new item one,
//           and don't change it once something links to it.
//   url     external link (not for quotes)
//   links   ['definition:gut-check', 'article:no-advice', ...] connect it to anything.
//           Essays that write [[book:this-id]] (the item's own `type`) are connected automatically; you don't repeat them here.
// WHAT CONNECTIONS DO ON THE CONSUME BOARD
//   An item with anything attached (quotes, definitions, thoughts, questions, essays, experiments) gets:
//     - HOVER: small sticky notes slide out from behind the cover on the top, right and left edges, one per attached item
//              (six at most), coloured by kind: quote yellow, definition blue, thought pink, question orange, essay green, a book/podcast/poem purple.
//     - CLICK: a Consume detail page (header CONSUME) with everything attached, in random order, on the 4-column board.
//              Definitions, questions and essays on that page open their Knowledge page (after the password prompt).
//              [ VIEW ] next to the title opens the item's own `url`.
//   `parent: '<type>:<id>'` on any item (a quote, book, podcast, poem) says "I belong to that item": it is NOT on the board,
//   it shows as a card on the parent's detail page, and the parent shows on its page too. One parent per item.
//   Write a parent/child relationship on the CHILD, pointing at its parent; never list children on the parent. A child can be any media (quote, book, podcast, poem), a thought or a definition.
//   To bring it back onto the board later, change the word `parent` to `links` (a plain two-way link, still on the board).
//   An item with nothing attached is a plain card that links to its `url`.
//   Attach things by adding `links: [...]` here, by linking to this item from a thought (see thoughts.js),
//   or by writing [[book:this-id]] in an essay or definition.
// =====================================================
export const LIBRARY = [
  {
    type: 'podcast',
    id: 'boroditsky-language-changes-personality',
    show: 'What Now? With Trevor Noah',
    episode: 'Lera Boroditsky: How Language Secretly Changes Your Personality',
    minutes: 111,
    progress: 21,
    image: 'images/Consume/what-now.png',
    url: 'https://youtu.be/UVhAceBQmpY?si=Xk2LRWulUE9_W7gx',
    links: ['definition:cost-of-translation']
  },
  {
    type: 'book',
    id: 'these-impossible-things',
    title: 'These Impossible Things',
    by: 'Salma El-Wardany',
    color: '#7a2a33',
    image: 'images/Consume/these-impossible-things.jpg',
    url: 'https://www.goodreads.com/book/show/59228196-these-impossible-things'
  },
  {
    type: 'book',
    id: 'everything-is-tuberculosis',
    title: 'Everything is Tuberculosis',
    by: 'John Green',
    color: '#1d3a2b',
    image: 'images/Consume/everything-is-tuberculosis.jpg',
    url: 'https://www.goodreads.com/book/show/220341389-everything-is-tuberculosis',
  },
  {
    type: 'podcast',
    id: 'art-of-learning',
    show: 'Huberman Lab',
    episode: 'The Art of Learning & Living Life | Josh Waitzkin',
    minutes: 197,
    progress: 62,
    image: 'images/Consume/huberman-lab.png',
    url: 'https://www.youtube.com/watch?v=wAnDWfEIwoE'
  },
  {
    type: 'quote',
    id: 'strong-opinions-loosely-held',
    text: 'Strong opinions, loosely held.',
    highlight: 'loosely held',
    by: 'Unknown'
  },
  {
    type: 'poem',
    id: 'the-gardener',
    title: 'The Gardener',
    by: 'Mary Oliver',
    image: 'images/Consume/the-gardener.png',
    url: 'https://www.instagram.com/p/DNnpayAODMo/',
  },
  {
    type: 'quote',
    id: 'life-feels-unbearable',
    text: 'When life feels unbearable, I remind myself that I am not a person, I am a piece of software running on the brain of a random ape for a few decades. It’s not the worst brain to run on.',
    highlight: 'I am not a person, I am a piece of software',
    by: 'Joscha Bach',
    links: ['definition:gut-check']
  },
  {
    type: 'book',
    id: 'the-score',
    title: 'The Score',
    by: 'C. Thi Nguyen',
    color: '#1d3a2b',
    image: 'images/Consume/the-score.jpeg',
    url: 'https://www.goodreads.com/en/book/show/231363343-the-score'
  },
  {
    type: 'podcast',
    id: 'radical-neighbouring',
    show: 'Mattias Olsson',
    episode: 'Radical Neighbouring',
    minutes: 19,
    progress: 96,
    image: 'images/Consume/radical-neighbouring.jpg',
    url: 'https://www.youtube.com/watch?v=dynQV-oKM0E&t=843s'
  },
  {
    type: 'podcast',
    id: 'agarwal-less-productive',
    show: 'Humans with Hank',
    episode: 'Neal Agarwal Wants to Make You Less Productive',
    minutes: 55,
    progress: 67,
    image: 'images/Consume/humans-with-hank.jpeg',
    url: 'https://www.youtube.com/watch?v=2Qvx6jpQLME'
  },
  {
    type: 'book',
    id: 'this-is-water',
    title: 'This is Water',
    by: 'David Foster Wallace',
    color: '#1d3a2b',
    image: 'images/Consume/this-is-water.jpg',
    url: 'https://www.goodreads.com/book/show/5986375-this-is-water'
  },
  {
    type: 'book',
    id: 'beartown',
    title: 'Beartown',
    by: 'Fredrik Backman',
    color: '#1d3a2b',
    image: 'images/Consume/beartown.jpg',
    url: 'https://www.goodreads.com/book/show/33413128-beartown'
  },
  {
    type: 'book',
    id: 'american-hagwon',
    title: 'American Hagwon',
    by: 'Min Jin Lee',
    color: '#1d3a2b',
    image: 'images/Consume/american-hagwon.jpg',
    url: 'https://www.goodreads.com/book/show/245886309-american-hagwon'
  },
  {
    type: 'quote',
    id: 'essence-of-something',
    text: 'People think simplifying is removing things, and it’s not. Simplifying is understanding something so deeply that you can get to the essence of something.',
    highlight: 'understanding something so deeply that you can get to the essence',
    by: 'Brian Chesky'
  },
  {
    type: 'quote',
    id: 'maybe-fulfillment',
    text: 'Maybe fulfillment is not about what you get out, but how much of yourself you put in.',
    highlight: 'how much of yourself you put in',
    by: 'Unknown'
  },
  {
    type: 'poem',
    id: 'sun-never-says',
    title: 'The Sun Never Says',
    by: 'Hafiz',
    image: 'images/Consume/the-sun-never-says.webp',
    url: 'https://www.goodreads.com/quotes/60389-even-after-all-this-time-the-sun-never-says-to/',
  },
  {
    type: 'book',
    id: 'think-again',
    title: 'Think Again',
    by: 'Adam Grant',
    color: '#1d3a2b',
    image: 'images/Consume/think-again.jpeg',
    url: 'https://www.goodreads.com/book/show/55539565-think-again'
  },
  {
    type: 'book',
    id: 'the-anthropologists',
    title: 'The Anthropologists',
    by: 'Ayşegül Savaş',
    color: '#1d3a2b',
    image: 'images/Consume/the-anthropologists.jpg',
    url: 'https://www.goodreads.com/book/show/195391751-the-anthropologists'
  },
  {
    type: 'poem',
    id: 'life-is-not-a-race',
    title: 'Life is Not a Race',
    by: 'Alan Watts',
    image: 'images/Consume/life-is-not-a-race.jpg',
    url: 'https://www.instagram.com/p/DZyN6miE1Am/?img_index=2',
  },
  {
    type: 'quote',
    id: 'encoded-to-do',
    text: 'An acorn never berates itself for not being an oak tree, and yet it continues to grow. Because that is what it was encoded to do.',
    highlight: 'what it was encoded to do',
    by: 'James Clear'
  },
  {
    type: 'book',
    id: 'letters-to-a-young-poet',
    title: 'Letters to a Young Poet',
    by: 'Rainer Maria Rilke',
    color: '#7a2a33',
    image: 'images/Consume/letters-to-a-young-poet.jpeg',
    url: 'https://www.goodreads.com/en/book/show/46199.Letters_to_a_Young_Poet',
  },
  {
    parent: 'book:letters-to-a-young-poet',
    type: 'quote',
    id: 'do-not-now-seek-the-answers',
    text: 'Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now.',
    highlight: 'Live the questions now.',
    by: 'Rainer Maria Rilke',
  },
  {
    type: 'poem',
    id: 'letters-to-a-young-creator',
    title: 'Letters to a Young Creator',
    by: 'Steve Jobs Archive',
    image: 'images/Consume/letters-to-a-young-creator.png',
    url: 'https://letters.stevejobsarchive.com/',
  },
  {
    type: 'quote',
    id: 'circular-economy',
    text: 'I often found that people are very receptive and open to this idea that we can innovate our way out of a problem through technology, and they’re much more conservative about the idea that we can do things differently.',
    highlight: 'idea that we can do things differently',
    by: 'Wen-Yu Weng, Ellen MacArthur Foundation’s Critical Minerals Lead'
  },
  {
    parent: 'quote:circular-economy',
    type: 'podcast',
    id: 'critical-minerals-crunch',
    show: 'The Circular Economy Show Podcast',
    episode: 'The critical minerals crunch: How do we secure the future of clean energy?',
    minutes: 18,
    progress: 23,
    image: 'images/Consume/critical-minerals-crunch.png',
    url: 'https://www.ellenmacarthurfoundation.org/podcasts/the-critical-minerals-crunch-how-do-we-secure-the-future-of-clean-energy'
  },
  {
    type: 'quote',
    id: 'perhaps-pursue-that',
    text: 'If you can imagine any other possible thing to do, perhaps you should pursue that.',
    highlight: 'perhaps you should pursue that',
    by: 'Mona Simpson'
  },
];
