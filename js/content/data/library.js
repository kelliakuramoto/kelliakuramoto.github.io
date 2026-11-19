// =====================================================
// LIBRARY  (kind: 'media'; the Consume board)
// Add, remove or reorder items. Layout and book colours are automatic.
//   book:    { type, title, by, image?, color? }
//   podcast: { type, show, episode, minutes, progress?, image? }
//   poem:    { type, title, by, image }
//   quote:   { type, text, highlight?, by }
// Every item may have:
//   id      stable slug. Give one to anything you link to by hand; otherwise it is generated
//           from the title/episode/text (so don't rename titles of linked items without an id).
//   url     external link (not for quotes)
//   links   ['definition:gut-check', 'article:no-advice', ...] connect it to anything.
//           Essays that write [[this-id]] are connected automatically; you don't repeat them here.
// A "Peek into my mind" button appears on the Consume board when an item has a connection.
// =====================================================
export const LIBRARY = [
  {
    type: 'podcast',
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
    title: 'These Impossible Things',
    by: 'Salma El-Wardany',
    color: '#7a2a33',
    image: 'images/Consume/these-impossible-things.jpg',
    url: 'https://www.goodreads.com/book/show/59228196-these-impossible-things'
  },
  {
    type: 'book',
    title: 'Everything is Tuberculosis',
    by: 'John Green',
    color: '#1d3a2b',
    image: 'images/Consume/everything-is-tuberculosis.jpg',
    url: 'https://www.goodreads.com/book/show/220341389-everything-is-tuberculosis',
  },
  {
    type: 'podcast',
    show: 'Huberman Lab',
    episode: 'The Art of Learning & Living Life | Josh Waitzkin',
    minutes: 197,
    progress: 62,
    image: 'images/Consume/huberman-lab.png',
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
    image: 'images/Consume/the-gardener.png',
    url: 'https://www.instagram.com/p/DNnpayAODMo/',
  },
  {
    type: 'quote',
    text: 'When life feels unbearable, I remind myself that I am not a person, I am a piece of software running on the brain of a random ape for a few decades. It’s not the worst brain to run on.',
    highlight: 'I am not a person, I am a piece of software',
    by: 'Joscha Bach',
    links: ['definition:gut-check']
  },
  {
    type: 'book',
    title: 'The Score',
    by: 'C. Thi Nguyen',
    color: '#1d3a2b',
    image: 'images/Consume/the-score.jpeg',
    url: 'https://www.goodreads.com/en/book/show/231363343-the-score'
  },
  {
    type: 'podcast',
    show: 'Mattias Olsson',
    episode: 'Radical Neighbouring',
    minutes: 19,
    progress: 96,
    image: 'images/Consume/radical-neighbouring.jpg',
    url: 'https://www.youtube.com/watch?v=dynQV-oKM0E&t=843s'
  },
  {
    type: 'podcast',
    show: 'Humans with Hank',
    episode: 'Neal Agarwal Wants to Make You Less Productive',
    minutes: 55,
    progress: 67,
    image: 'images/Consume/humans-with-hank.jpeg',
    url: 'https://www.youtube.com/watch?v=2Qvx6jpQLME'
  },
  {
    type: 'book',
    title: 'This is Water',
    by: 'David Foster Wallace',
    color: '#1d3a2b',
    image: 'images/Consume/this-is-water.jpg',
    url: 'https://www.goodreads.com/book/show/5986375-this-is-water'
  },
  {
    type: 'book',
    title: 'Beartown',
    by: 'Fredrik Backman',
    color: '#1d3a2b',
    image: 'images/Consume/beartown.jpg',
    url: 'https://www.goodreads.com/book/show/33413128-beartown'
  },
  {
    type: 'podcast',
    show: 'What Now? With Trevor Noah',
    episode: 'Arthur C Brooks: Are We Happy Yet?',
    minutes: 127,
    progress: 98,
    image: 'images/Consume/what-now.png',
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
    image: 'images/Consume/the-sun-never-says.webp',
    url: 'https://www.goodreads.com/quotes/60389-even-after-all-this-time-the-sun-never-says-to/',
  },
  {
    type: 'book',
    title: 'Think Again',
    by: 'Adam Grant',
    color: '#1d3a2b',
    image: 'images/Consume/think-again.jpeg',
    url: 'https://www.goodreads.com/book/show/55539565-think-again'
  },
  {
    type: 'book',
    title: 'The Anthropologists',
    by: 'Ayşegül Savaş',
    color: '#1d3a2b',
    image: 'images/Consume/the-anthropologists.jpg',
    url: 'https://www.goodreads.com/book/show/195391751-the-anthropologists'
  },
  {
    type: 'poem',
    title: 'Life is Not a Race',
    by: 'Alan Watts',
    image: 'images/Consume/life-is-not-a-race.jpg',
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
    image: 'images/Consume/letters-to-a-young-poet.jpeg',
    url: 'https://www.goodreads.com/en/book/show/46199.Letters_to_a_Young_Poet',
    id: 'letters-to-a-young-poet',
  },
  {
    type: 'poem',
    title: 'Letters to a Young Creator',
    by: 'Steve Jobs',
    image: 'images/Consume/letters-to-a-young-creator.png',
    url: 'https://letters.stevejobsarchive.com/',
  },
  {
    type: 'quote',
    text: 'I often found that people are very receptive and open to this idea that we can innovate our way out of a problem through technology, and they’re much more conservative about the idea that we can do things differently.',
    highlight: 'idea that we can do things differently',
    by: 'Wen-Yu Weng, Ellen MacArthur Foundation’s Critical Minerals Lead'
  },
    {
    type: 'quote',
    text: 'If you can imagine any other possible thing to do, perhaps you should pursue that.',
    highlight: 'perhaps you should pursue that',
    by: 'Mona Simpson'
  },
];
