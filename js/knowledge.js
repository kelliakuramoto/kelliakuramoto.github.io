import { $, $$, esc, on, showOnly } from './dom.js';
import { articleCard, bookCard, quoteCard, flashCard, textCard } from './cards.js';
import { animateScrollTo, isMobile } from './navigation.js';
import { supabase } from './supabase.js';
import { DEFINITIONS, linkTerms, mentions } from './definitions.js';
import { COLLECTION, consumeCard } from './consume.js';
import { carouselHTML, initCarousels } from './media.js';

// =====================================================
// KNOWLEDGE VIEW
// Questions live in Supabase (visitors can respond, the editor can add questions).
// Add articles and experiments in the collections below.
// Experiments are Consume book cards (js/cards.js).
// Article body blocks support: paragraph, heading, subheading, quote,
// underline, image, and divider. Images use paths relative to index.html.
// =====================================================

const ARTICLES = [
    // Writing for the reader
    {
      id: 'writing-for-the-reader',
      title: 'Writing for the reader',
      subheader: 'Who am I writing for?',
      date: '2026-11-12',
      blocks: [
        { type: 'paragraph', text: 'When I was in New York a couple weeks ago, my friend took me to the Strangers Project. It’s a collection of letters written in response to the question: What’s it like being you? It started during the pandemic and has been popping up in various spots around the city since. After 20 minutes I had already laughed (physically out loud), cried, and related to many of the letters that I read.' },
        { type: 'paragraph', text: 'Over time I noticed a theme. People responded to this question in many different ways: as a journal entry, time stamping that exact moment in life, a confession of their biggest fears, a celebration of their biggest accomplishment, but surprisingly the most common letter was advice or pre-requisitely, learnings from their own life. One person went as far to say: “I’m wondering what to write that will have the most impact for the readers” and that felt very “breaking the 4th wall”-esque. I thought it was quite an odd response when asked about yourself and it made me a bit sad to realize that this urge to impart wisdom, to create a legacy or sense of permanence was probably born out of a feeling of disconnectedness from their own lives. I remember walking out of the exhibit and my friend asked me if I wanted to write a letter. I responded with “No, the people who matter to me know how I feel about them.”' },
        { type: 'paragraph', text: 'I think if she had asked me this question a couple months earlier my response might have been different, but I had just recently had made a photobook of thank you notes to the people in my life and shared it with them. I can honestly say there’s nothing I’m more proud of than that and I plan to make one every year for as long as I can. But we’ve somehow off-roaded quite a bit now.' },
        { type: 'paragraph', text: 'The reason I brought this project up is that I’m starting to publish my writing on the internet (not that anyone is reading it but still) and I’m not sure who I’m writing for anymore. Writing for me has always been this private act, mainly to just calm the thoughts in my brain and for future versions of myself to look back on and glimpse into a moment of who I used to be. Sometimes I write conversationally, as if I’m writing a letter to a future version of myself that’s a different person than who I am right now and sometimes I write quite factually, as a way to record-keep a memory that I’m worried I might forget. But lately I’ve been finding myself editing my mind and writing for the reader, adding in generic shared experiences to seem more relatable, or structuring my essays in a way that connect the intro paragraph to a life changing conclusion and I just keep thinking to myself: Who am I writing for? ' },
        { type: 'paragraph', text: 'I don’t edit my writing, the same way that I don’t edit my photos, or edit my appearance: because I’m lazy; but also because, as my father so aptly described it “take me as I am”. I tell my friends all the time, I don’t think I’m going to wear makeup on my wedding day, it just wouldn’t feel like me. And if I’m not willing to edit my appearance on what society deems “the happiest day of your life.” I sure as shit am not going to edit my writing for hypothetical readers that I may or may not know, who may or may not read it.' },
        { type: 'paragraph', text: 'I will not deny that there is benefit in writing for the reader and I myself have read many articles that I have found propounding moving or sparked an engaging conversation between my friends and I. But I kind of think it’s something that naturally happens, rather than the main reason to do it. I think there is a greater beauty in craft, in finding your voice, one that is truly yours, and if people just happen to speak your language then it’s free bread.' },
        { type: 'paragraph', text: 'I cannot write for everyone, I can only write for myself and hope that I have spoken in a way that is heard by those who want to listen. Maybe life is just a long process of finding people who speak your language. It’s not the worst way to live.' },
      ],
      access: ['friends', 'professional'],
    },
  // I dont believe in giving advice
  {
    id: 'no-advice',
    title: 'I don’t believe in giving advice',
    subheader: 'My response when asked: What should I do?',
    date: '2026-09-24',
    blocks: [
      { type: 'heading', text: 'What should I do?' },
      { type: 'paragraph', text: 'If you ask me what you should do in any situation my answer will always be the same, you should do what you want to do.' },
      { type: 'paragraph', text: 'Before, when my friends came to me for advice, I used to think deeply about what I thought was the best course of action given all of the conditions of the situation . But after a while, I noticed that I was always left with this sour and unsatisfying taste in my mouth. I later recognized this to be the result of my friend’s utter lack of acknowledgement of my advice, and indeed doing the complete opposite of what I said to do.' },
      { type: 'paragraph', text: 'I want to pause here and recognize two things. First, I no longer believe in "telling people what to do" and that was a mismatched expectations on my part. I now intentionally frame everything as a suggestion and they can take or leave as much as they want. I do not presume to have the respect or authority over anybody to tell what to do. Second, I have 100% in the past and probably will in the future, asked for "advice" from my friends and completely ignored what they said. I know my sister can definitely attest to this. This is all to say that I am not immune to the same actions that I get annoyed with in others. But I am trying to communicate what I need in any situation, even if most of the time it’s just for someone to listen.' },
      { type: 'paragraph', text: 'Going back to the original thread, I stopped giving advice because what I realized was that my friends weren’t asking for advice, but for assurance. They wanted permission to do what they want to do, and more often than not, they wanted permission to continue persisting the behavior that got them into the predicament in the first place. And so, I give them it.' },
      { type: 'paragraph', text: 'I do so because sometimes you win and sometimes you learn. Sometimes you have to play the tape to the very end to know that this wasn’t the path for you. As Rainier Maria Rilke said in "{{letters-to-a-young-poet|Letters to a Young Poet}}"'},
      { type: 'quote', text: 'Do not now seek the answers, which cannot be given you because you would not be able to live them. And the point is, to live everything. Live the questions now.' },
      { type: 'paragraph', text: 'Hindsight will always be 20/20 and you can’t blame your past self for “not knowing better”. You quite literally could not have known. Just because you have a hypothesis, doesn’t mean that you shouldn’t run the experiment. In fact, it is probably an huge indicator that you should.'},
      { type: 'paragraph', text: 'All that we can do in life is make the best decisions we can, with the most amount of information that we have at the time. And the only way to get more information in life is by living it.' },
      { type: 'heading', text: 'What would you do?' },
      { type: 'paragraph', text: 'Now, if someone were to ask me what I would do in that situation, I still don’t believe in giving advice.' },
      { type: 'paragraph', text: 'Growing up, I always asked my dad for advice. And honestly, I would have done whatever he told me. He could have told me to drive my car off a cliff and I would have done it. But whenever I asked him what I should do, he never gave me a straight answer.' },
      { type: 'paragraph', text: 'Instead, my dad would always walk me through his framework of thinking, what factors he considered, why something was more important than another, and how that led to his ultimate decision in that situation. He taught me how to think, not what to think, and that is one of the most important lessons I’ve learned from him to this day.' },
      { type: 'paragraph', text: 'My father understood much earlier than I did that you cannot tell anyone what to do. There is a subtle but importance difference between mimicking a behavior and embodying it: you can always tell when someone’s heart isn’t in it.'},
      { type: 'paragraph', text: 'I’ve found my life to be a lot less mystifying the less advice that I gave and the more support I offered. I think at the end of the day, all most of us want in life is know that we’re not crazy, we’re not alone, and that we’re allowed to mess up sometimes.' },
      { type: 'paragraph', text: 'I really believe that any decision that you can learn from, will be the right decision for you.' },
      { type: 'quote', text: 'Sometimes you win, sometimes you learn.' },
    ],
    access: ['friends', 'professional'],
  },
  // Life is a sprint (part 2)
  {
  id: 'life-is-a-sprint-2',
  title: 'Life is a sprint (part 2)',
  subheader: 'Running a retrospective on my decisions',
  date: '2026-10-28',
  blocks: [
    { type: 'paragraph', text: 'If there’s one thing I’m passionate about in life its walking. And naturally I get a lot of questions about what I do on my walks.' },
    { type: 'paragraph', text: 'For reference, I walk anywhere between 6-10 miles on the weekdays and 12-15 miles on the weekends; which as I’m saying this out loud sounds like a lot but trust me it’s not as hard as you think if you live in a city with poor public transport and easily get motion sick.' },
    { type: 'paragraph', text: 'Anyways, I usually respond with either listening to a podcast, calling a friend to catch up, or figuring out the logistics of my day which actually takes up a surprising amount of time. For example, let’s say I know that I have to be at this place at this time and it takes me 17 minutes to walk a mile; How far are the two places from each other? What is the route with the least amount of hills? Do I need to stop for food on the way because I know I’m going to be hungry… you get the idea.' },
    { type: 'paragraph', text: 'But my favorite thing to think about when I’m walking is when I’m coming back from hanging out with my friends and I basically run a retrospective of our hang out.' },
    { type: 'paragraph', text: 'If you don’t know what a retrospective is, that’s probably a good thing but essentially it’s a meeting where engineers come together and look back on the complete work during the sprint, evaluate what went well, what failed, and how to improve for the future. It’s like mindfulness, but for tech companies.' },
    { type: 'paragraph', text: 'But in my case, instead trying to figure out how to be more efficient, I ask myself questions like: How do I feel after hanging out with them? Do I think I showed up as a good friend that day? Did my actions align with my beliefs and values? And if any of the answers are no, I run a root cause analysis and ask myself the 5 why’s? Which is a UX research method where when someone gives you an answer, you respond with why, and then when they answer, you respond with why again and this keeps going until you’ve identity the root cause (I know crazy where the name comes from).' },
    { type: 'paragraph', text: 'If this all sounds a bit weird in theory, let me give you a good example. So one day my friends and I were doing the Crosstown Trail and every mile, we made a letter of the word with our bodies, so that at the end we could collage them together. During this walk, I was telling one of my friends that the day before I was dancing in public and my other friend told me to stop, which really annoyed me for a couple reasons 1. Just because he might have felt embarrassed doesn’t mean that I should feel embarrassed too and 2. I don’t like being told what to do and more importantly I don’t believe that you should tell someone what to do especially if it’ not harming anyone, which my dancing wasn’t.' },
    { type: 'paragraph', text: 'I promise I’m getting to the important part, so about 20 minutes go by and its now time for us to make the “W” in Crosstown and we weren’t quite sure how we were going to make the letter or how many people we would need. So my friend (the original one I was telling the story about dancing in public to) started to ask this couple nearby if they could take the photo for us. In that moment I had a very immediate reaction where I was like “No, don’t do that, we can take the photo ourselves”.' },
    { type: 'paragraph', text: 'Afterwards, I felt quite bad about the whole thing and I spent a long time trying to figure out why I reacted that way. I knew that it was extremely contradictory for me to tell my friend not to do something after just telling them that I get upset when someone tells me what to do. So I ran a retrospective.' },
    { type: 'paragraph', text: 'I asked myself why I believed that it was wrong to tell other people what to do and after confirming that is still what I believed, I asked myself why I think I responded in that way: Was it because of embarrassment? Was it because I didn’t want to burden a stranger by asking them to take our photo? Was it because I had already figured out that we had enough people to to take the photo and didn’t need to ask anyone else?' },
    { type: 'paragraph', text: 'I think in the end I concluded that I probably just felt embarrassed, but what was more important was that in the process of deconstructing this whole interaction I was able to confirm one of my beliefs, identify when I have acted contradictory, store data of how I felt when I act against them, and create a trigger in my mind for the next time I feel embarrassed to take a second and think about why instead of immediately acting so that I can guard against this happening in the future.' },
    { type: 'paragraph', text: 'After writing all of that, I know it sounds like a lot but what I can say is that I’ve found this practice to be extremely helpful in the moments when I feel like my life isn’t my own and I feel like I’m sitting in the passenger seat of a car that is my life, watching the streets go by, heading towards some pre-programmed destination that I’m not really sure is where I even want to end up at.' },
    { type: 'paragraph', text: 'Because if we both agree that your life is the sum of all the decisions you’ve ever made, I’d like to at least know why I’m making the decisions that I’m making. So that at the end of it, even if I don’t accomplish everything I wanted to or everything I think I should have done, I can at least say that it was mine to make.' },
  ],
  access: ['friends', 'professional'],
  },
  // Life is a sprint
  {
  id: 'life-is-a-sprint',
  title: 'Life is a sprint',
  subheader: 'What UX design has taught me about life',
  date: '2025-08-15',
  blocks: [
    { type: 'paragraph', text: 'Whenever someone asks me what I do for work I’m a bit reluctant to give them my actual job title because as soon as I say “designer” they immediately think that I can draw or paint or do anything remotely artistic (which would be super cool) but then I have to quickly explain that I’m not an artist in the traditional sense and instead of drawing characters, I design experiences.' },
    { type: 'heading', text: 'Copy and paste' },
    { type: 'paragraph', text: 'One of the main roles in my job description is designing the end to end experience of a digital product. Immediately, my first 2 questions are: What problem are we trying to solve? And where does the experience begin?' },
    { type: 'paragraph', text: 'There’s quite a bit of problem solving involved in my day to day that most people would be surprised to hear. The happy path is always the easiest design, but the complexity and the fun comes in the edge cases. I spend a lot of time thinking about the different ways a bad actor could leverage a feature for harm; or maybe even a good actor who got lost in their journey and ensuring the experience is architected in a way that’s intuitive for them to find their way back. The most gratifying feeling of my job is knowing that you created something that helped someone achieve their goal, no matter how small.' },
    { type: 'paragraph', text: 'And after 2 years what I didn’t realize is how much of what I do at work has been copied and pasted into my life without me even realizing,' },
    { type: 'numbered-list', items: [
      'Continually asking myself “What problem are we trying to solve” has helped me to view all obstacles in this manner. Approaching disagreements not from the perspective of whose to blame, but rather from a place of collaboration. I really believe that we can work together and reach an end state that enables both of us to achieve our goals, even if that solution might not be obvious at first.',
      'Thinking through the entire flow of an experience and begging the question of where does this begin has enabled me to question the origin of my decisions. Knowing which core value has shaped my decision and being able to identify when there is a disconnectness has been extremely important as I try to tackle this larger question of who am I?',
      'Helping my team’s QA engineer uncover all of the edge cases within a feature has led me to stress test all of the possible outcomes of a decision. I have felt more confident in the decisions I make because I know that all perspectives were taken into account.',
      'Deciding what and how much information to display on a screen during  a user’s journey has sharpened my ability to think about when and how to have tough conversations with friends. Sometimes more information isn’t always a good thing and sensing when someone might not be receptive to feedback can save a lot of energy.',
      'Presenting my work to be critiqued each week with product managers, other designers, or business stakeholders has taught me to release my ego and attachment to the work. Understanding how to digest feedback and improve is an iterative process that I continue to do both in my work and in life. I believe that there’s always room to grow, even if you’re growing sideways. ',
    ] }, 
    { type: 'paragraph', text: 'This whole process has made me think about transferability of skills and I wonder how many other parts of myself that I’ve inherited from the other identities that I hold?' },
    { type: 'heading', text: 'INVEST in your life' },
    { type: 'paragraph', text: 'Apart from skills that I’ve integrated, another thing I didn’t anticipate was how the structure of my work mirrored the way I structured my life. ' },
    { type: 'paragraph', text: 'In many tech companies teams work in sprints, which are a fixed time period during which engineers are assigned user stories that build to features, which make up epics, and eventually roll up to an entire product. User stories are defined as the smallest unit of work in Agile software development and they often follow a framework called INVEST. Independent, Negotiation, Valuable, Estimable, Small and Testable. The details don’t really matter, but the reason that this method was so widely adopted was because engineers saw the benefits of Agile: flexibility, adaptability, and continuous rapid feedback.' },
    { type: 'paragraph', text: 'I think one of the biggest realizations I had was this one moment, maybe 2 months post graduation, and I was sitting in my apartment in San Francisco with my cushy tech job and on the surface I had achieved everything I had ever wanted. But as I sat there, I was overcome with this frightening thought that this didn’t feel anything like how I thought it would. I realized I had spent so much time laser focused on sticking to my 8 year roadmap with no detours, from freshman year of high school to college graduation, that I never stopped to consider what happens after.' },
    { type: 'paragraph', text: 'I knew that if I wanted to make changes in my life, I needed to start small and keep iterating.' },
    { type: 'quote', text: 'If something feels too hard to do, it just means the first step isn’t small enough.' },
    { type: 'paragraph', text: 'I learned that if you don’t break your life into bite size chunks then, you’re making roadmaps for 5 years out and there’s room to modify your goals, adjust based on feedback, or even stop and take a step back to ask yourself: Is that what I want?' },
    { type: 'paragraph', text: 'There’s another quote that has stuck with me, I can’t remember where I heard it first but it says.' },
    { type: 'quote', text: 'I don’t know where I’m going, but I know how to get there.' },
    { type: 'paragraph', text: 'I’ve tried to reframe my mindset around goals from specific items to checking off a list to following a framework or process that enables me to experience many things and letting the feedback guide my next step. I’m not sure what my life is going to look like in 5 or 10 years, but I know that I will have learned a lot, I hope you do too.' },
  ],
  access: ['friends', 'professional'],
  },
];

const EXPERIMENTS = [
  {
    id: 'sunscreeen',
    title: 'Just put on some damn sunscreen',
    byline: 'Trying to understand how to move from awareness to action',
    image: 'images/Writing/stick-sunscreen.jpg',
    imageAlt: 'Image of CeraVe stick sunscreen',
    subheader: 'Trying to understand how to move from awareness to action',
    blocks: [
      { type: 'paragraph', text: 'This experiment is a work in progress. Please check back later.' },
      // { type: 'heading', text: 'What I am testing' },
      // { type: 'paragraph', text: 'Does a regular question practice make curiosity more active in everyday life? I will track which questions recur, which lead to action, and which change as I learn.' },
      // { type: 'quote', text: 'The goal is not to collect answers. It is to get better at asking.' },
    ],
    access: ['friends', 'professional'],
  },
];

// ---- Rendering --------------------------------------------------

const formatDate = (iso, month) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });

// Attributes that make a card open the reader (the click and key handlers below look for these)
const openAttrs = (kind, item) =>
  `data-knowledge-kind="${kind}" data-knowledge-id="${esc(item.id)}" tabindex="0" role="button" aria-label="Open ${kind}: ${esc(item.title || item.text)}"`;

const articleRow = article => articleCard({
  title: article.title,
  sub: article.subheader,
  date: article.date,
  dateLabel: formatDate(article.date, 'short'),
  attrs: openAttrs('article', article),
});

const experimentCard = experiment => bookCard({
  title: experiment.title,
  by: experiment.byline,
  color: experiment.color || '#e8e8e8',
  image: experiment.image,
  ink: 'var(--text)',
  attrs: openAttrs('experiment', experiment),
});

// The single row that opens the definitions: the same articleCard as the articles below it
const definitionsRow = () => articleCard({
  title: 'Shortcuts to my shared language',
  sub: `${DEFINITIONS.length} concepts to help you understand my mind`,
  attrs: openAttrs('definition', { id: DEFINITIONS[0].id, title: 'Shortcuts to my shared language' }),
});

function renderInto(selector, items, toHTML) {
  const root = $(selector);
  if (root) root.innerHTML = items.map(item => toHTML(item)).join('');
}

// Questions come from Supabase. Each one is a Consume quote card that opens the reader,
// the same way articles and experiments do.
let QUESTIONS = [];

const questionCard = q => textCard({ text: q.text, attrs: openAttrs('question', q) });

async function loadQuestions() {
  const { data, error } = await supabase.from('questions').select('*').order('created_at');
  if (error) { console.error('Questions failed to load:', error.code, error.message); return; }
  // date and subheader feed the same reader header that articles use
  QUESTIONS = data.map(q => ({
    ...q,
    // date: q.created_at.slice(0, 10),
    // subheader: 'Add your thoughts, or read what others have said.',
  }));
  renderInto('#knowledgeQuestions', QUESTIONS, questionCard);
}
const questionsReady = loadQuestions();

// Which password group is signed in: null until unlocked, 'all' for the editor / moderator.
// An article or experiment with `access: ['friends']` only shows for that group; no `access` = everyone.
let accessGroup = null;
const canSee = item => accessGroup === 'all' || !item.access || item.access.includes(accessGroup);

// Newest first. ISO dates (YYYY-MM-DD) sort correctly as plain strings.
const newestFirst = (a, b) => (b.date || '').localeCompare(a.date || '');

function renderCollections() {
  const articles = ARTICLES.filter(canSee).sort(newestFirst).map(articleRow).join('');
  const root = $('#knowledgeArticles');
  if (root) root.innerHTML = definitionsRow() + articles;   // definitions always sit on top
  renderInto('#knowledgeExperiments', EXPERIMENTS.filter(canSee), experimentCard);
}

renderCollections();   // everyone-items only, until a password is entered

// Escapes `text`, then turns [[id]] into definition links and {{id}} / {{id|label}} into Consume links.
// An unknown id is left as typed so a typo is easy to spot.
const richText = text => linkTerms(text).replace(/\{\{([\w-]+)(?:\|([^}]+))?\}\}/g, (match, id, label) => {
  const item = COLLECTION.find(entry => entry.id === id);
  if (!item) return match;
  const words = label || esc(item.title || item.episode || id);
  // Same link as the Consume card: opens the item's url in a new tab. Items without a url (quotes) just show the card.
  return item.url
    ? `<a href="${esc(item.url)}" class="consume-link" data-consume="${id}" target="_blank" rel="noopener noreferrer">${words}</a>`
    : `<span class="consume-link" data-consume="${id}" tabindex="0">${words}</span>`;
});

function blockHTML(block) {
  const text = richText(block.text || '');
  switch (block.type) {
    case 'heading': return `<h2>${text}</h2>`;
    case 'subheading': return `<h3>${text}</h3>`;
    case 'quote': return `<blockquote class="knowledge-quote">${text}</blockquote>`;
    case 'underline': return `<p><span class="knowledge-underline">${text}</span></p>`;
    case 'image': return `<figure class="knowledge-inline-image"><img src="${esc(block.src || '')}" alt="${esc(block.alt || '')}">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''}</figure>`;
    case 'divider': return '<hr class="knowledge-divider">';
    case 'list': return `<ul>${(block.items || []).map(item => `<li>${richText(item)}</li>`).join('')}</ul>`;
    case 'numbered-list': return `<ol>${(block.items || []).map(item => `<li>${richText(item)}</li>`).join('')}</ol>`;
    default: return `<p>${text}</p>`;
  }
}

// ---- Reader -----------------------------------------------------

const view = $('#knowledgeView');
const overview = $('#knowledgeOverview');
const reader = $('#knowledgeReader');
const readerContent = $('#knowledgeReaderContent');
const readerType = $('#knowledgeReaderType');
const closeButton = $('#knowledgeClose');
const knowledgeToggle = $('#knowledgeToggle');
const modeButtons = $$('.mode-btn');

const READER_LABELS = {
  article: 'WHAT I THINK I KNOW',
  experiment: 'WHAT I WANT TO KNOW',
  question: 'WHAT I DON’T KNOW',
  definition: 'WHAT I HAVE DEFINED',
};

// ---- Motion: every page change uses the same fades as the CSS ----
// Durations come from the same tokens as the CSS (both are 0 for reduced motion).
const cssSeconds = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) * 1000 || 0;
const VIEW_MS = cssSeconds('--motion-view');       // overview <-> reader crossfade
const LAYER_MS = cssSeconds('--motion-view');    // the whole Knowledge layer fading in / out
const EASE_OUT = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim() || 'ease-out';

// Runs `change` with the CSS transitions switched off, so it takes effect at once (used while the layer is hidden)
function instant(change) {
  const els = [overview, reader];
  els.forEach(el => { el.style.transition = 'none'; });
  change();
  void reader.offsetWidth;                          // apply it before the transitions come back
  els.forEach(el => { el.style.transition = ''; });
}

// Page -> page while the reader is already open: fade out, swap, fade in, over the same time and ease-out
// as the overview <-> reader crossfade. From the overview (or a hidden layer) the CSS crossfade does the work.
function present(render) {
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

// Swaps the overview for the reader and focuses [ CLOSE ].
// Scroll: animated to the top when coming from the overview, otherwise set at once (the old page is already hidden)
// or restored to `top` when returning to a page.
function showReader(label, wide = false, top = 0) {
  const fromOverview = isOpen() && !reader.classList.contains('is-open');
  readerType.textContent = label;
  readerContent.classList.toggle('is-wide', wide);
  const show = () => showOnly([overview, reader], reader);
  if (isOpen()) show(); else instant(show);          // the layer is hidden (opened from Consume): it only fades in
  if (fromOverview && !top) animateScrollTo(view, 0);
  else view.scrollTop = top;
  closeButton.focus({ preventScroll: true });
}

let returnFocus = null;
let currentQuestionId = null;

// ---- URLs ---------------------------------------------------------
// Whatever is open in Knowledge is mirrored in the address bar as #knowledge/<kind>/<id>,
// so any page can be linked to directly and the browser Back button works.
let hashBeforeKnowledge = '';   // the hash to restore when Knowledge closes (e.g. #bizbuysell)

const hashFor = state =>
  state ? `#mymind/${state.kind}/${encodeURIComponent(state.id)}` : '#mymind';

function setUrl(next, { replace = false } = {}) {
  if (location.hash === next) return;   // already there (e.g. we got here via Back / a pasted link)
  if (next.startsWith('#mymind') && !location.hash.startsWith('#mymind')) {
    hashBeforeKnowledge = location.hash;
  }
  history[replace ? 'replaceState' : 'pushState'](null, '', location.pathname + location.search + next);
}

// ---- Going back ---------------------------------------------------
// Opening something from a page that is already open (an article from the definitions, a definition from an
// article, a definition from Consume...) shows it as a second layer. [ CLOSE ] then returns to the page you
// came from, on the same article / definition and scroll position, instead of the Knowledge overview.
//   current  what the reader shows now: { kind, id } or null for the overview
//   trail    the pages to go back to: { kind, id, scroll }, or 'outside' when Knowledge itself was opened from
//            somewhere else (Consume), so closing the last page closes the whole layer
let current = null;
let trail = [];

// Call when a page opens. `back` is the trail entry when [ CLOSE ] is returning to it (nothing to remember then).
function enter(state, trigger, back) {
  if (!back) {
    if (!current) returnFocus = trigger;   // opened from the overview: focus returns to that card
    else if (!(current.kind === 'definition' && state.kind === 'definition')) {   // definition -> definition just swaps
      trail.push({ ...current, scroll: view.scrollTop });
    }
  }
  current = state;
  setUrl(hashFor(state))
}

function goBack() {
  const back = trail.pop();
  if (back === 'outside') { setKnowledge(false); return; }
  if (!back) { closeReader(); return; }
  if (back.kind === 'definition') openDefinitions(back.id, null, back);
  else openReader(back.kind, back.id, null, back);
}

function openReader(kind, id, trigger, back = null) {
  const item = { article: ARTICLES, experiment: EXPERIMENTS, question: QUESTIONS }[kind]?.find(entry => entry.id === id);
  if (!item) return;
  enter({ kind, id }, trigger, back);
  present(() => {

    // Articles and questions have a date; experiments get no byline
    const byline = item.date
    ? `<div class="knowledge-byline"><time datetime="${esc(item.date)}">${formatDate(item.date, 'long')}</time></div>`
    : '';

    const header = `
      <header class="knowledge-article-header">
        <h1>${esc(item.title || item.text)}</h1>
        <p class="knowledge-deck">${esc(item.subheader || item.byline || '')}</p>
        ${byline}
        ${kind === 'question' && editorPassword ? `<button type="button" class="question-delete" data-delete-question="${esc(item.id)}">[ DELETE QUESTION ]</button>` : ''}
      </header>`;
    const prose = `<div class="knowledge-prose">${kind === 'question' ? responsesSection(item) : (item.blocks || []).map(blockHTML).join('')}</div>`;

    // Articles and experiments use the Knowledge overview's three columns: the text in the middle, and the right
    // column holds the Consume card for whichever {{link}} is hovered. Questions keep the single narrow column.
    const essay = kind !== 'question';
    readerContent.innerHTML = essay
      ? `<div class="essay">
          <div class="knowledge-column">${header}${prose}</div>
          <aside class="knowledge-column essay-aside" aria-hidden="true"><div class="consume-peek"></div></aside>
        </div>`
      : header + prose;

    showReader(READER_LABELS[kind], essay, back?.scroll);
    currentQuestionId = kind === 'question' ? item.id : null;
    if (kind === 'question') loadResponses(item.id);
  });
}

function closeReader() {
  if (!reader.classList.contains('is-open')) return;
  current = null;
  trail = [];
  setUrl('#mymind');
  showOnly([overview, reader], overview);
  animateScrollTo(view, 0);
  returnFocus?.focus?.({ preventScroll: true });
}

// ---- Definitions ------------------------------------------------
// One carousel of flash cards (js/media.js). The related column beside it follows the card on screen.

// Articles that link to a definition anywhere in their text
const articlesUsing = id => ARTICLES.filter(article =>
  article.blocks.some(block => [block.text, ...(block.items || [])].some(text => mentions(text, id))));

const relatedSection = (title, cards) => cards.length ? `<section><h3>${title}</h3>${cards.join('')}</section>` : '';

// A section with nothing in it is left out
const relatedHTML = term =>
  relatedSection('Etymology', COLLECTION.filter(item => item.term === term.id).map(consumeCard)) +
  relatedSection('Used in a sentence', articlesUsing(term.id).filter(canSee).map(articleRow));

// Same structure as the Knowledge overview: three .knowledge-column sections (1fr 2fr 1fr).
//   left   every term as a Consume quote card; clicking one moves the carousel
//   middle the flash card carousel
//   right  where the term shows up (filled in by the carousel:change handler below)
const definitionsPage = start => `
  <div class="definitions">
    <nav class="knowledge-column definitions-nav" aria-label="Terms">
      ${DEFINITIONS.map((term, i) => `<a href="#${esc(term.id)}" data-term-index="${i}">${esc(term.word)}</a>`).join('')}
    </nav>
    <section class="knowledge-column" aria-label="Definition">
      ${carouselHTML({
        label: 'Definitions',
        start,
        slides: DEFINITIONS.map(term => flashCard({
          front: linkTerms(term.text),
          back: esc(term.word),
          foot: term.word,
        })),
      })}
    </section>
    <aside class="knowledge-column definitions-related" aria-label="Connections">
      <div data-related></div>
    </aside>
  </div>`;

function openDefinitions(id, trigger, back = null) {
  const start = Math.max(0, DEFINITIONS.findIndex(term => term.id === id));
  enter({ kind: 'definition', id }, trigger, back);
  present(() => {
    currentQuestionId = null;
    readerContent.innerHTML = definitionsPage(start);
    initCarousels(readerContent);                              // fires carousel:change, which fills the related column
    showReader(READER_LABELS.definition, true, back?.scroll);   // wide: the three columns use the overview's width
    $('.car', readerContent).focus({ preventScroll: true });   // so ← → turn the cards
  });
}

// Flash cards: a click (or Enter / Space) turns the card over. Links on the back don't.
function setFlipped(card, flipped) {
  card.classList.toggle('is-flipped', flipped);
  card.setAttribute('aria-pressed', String(flipped));
  card.querySelector('.c-flash-back').inert = !flipped;
}

on(readerContent, 'click', event => {
  const card = event.target.closest('.c-flash');
  if (card && !event.target.closest('[data-term]')) setFlipped(card, !card.classList.contains('is-flipped'));
});

// The related column follows the card on screen; cards that were turned over turn back
on(readerContent, 'carousel:change', event => {
  const related = $('[data-related]', readerContent);
  if (!related) return;                                    // some other carousel, not the definitions deck
  if (current?.kind === 'definition') current.id = DEFINITIONS[event.detail.index].id;   // so going back lands on this card
  setUrl(hashFor(current), { replace: true });
  related.innerHTML = relatedHTML(DEFINITIONS[event.detail.index]);
  $$('.car-slide:not(.active) .c-flash.is-flipped', readerContent).forEach(card => setFlipped(card, false));
  $$('.definitions-nav a', readerContent).forEach(link => {          // the current term is highlighted, like the active sidebar link
    const isCurrent = Number(link.dataset.termIndex) === event.detail.index;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
  });
});

// A term link in the left column moves the carousel to that definition
on(readerContent, 'click', event => {
  const termLink = event.target.closest('[data-term-index]');
  const car = $('.car', readerContent);
  if (!termLink || !car) return;
  event.preventDefault();
  car.show(Number(termLink.dataset.termIndex));
  car.focus({ preventScroll: true });                      // so ← → keep turning the cards instead of switching CREATE / CONSUME
});

// ---- Consume card beside the essay ------------------------------
// Hovering (or focusing) a .consume-link shows that Consume card in the essay's right column, level with the link.
// On mobile (no room beside the essay) CSS floats it above the toggle bar instead.
function showConsumePeek(link) {
  const item = COLLECTION.find(entry => entry.id === link.dataset.consume);
  const peek = $('.consume-peek', readerContent);
  if (!item || !peek) return;
  peek.innerHTML = consumeCard(item);
  if (!isMobile.matches) {
    // Keep the card on screen: level with the link, but never above the top or below the bottom of the view
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const box = view.getBoundingClientRect();
    const y = Math.max(box.top + rem, Math.min(link.getBoundingClientRect().top, box.bottom - peek.offsetHeight - rem));
    peek.style.top = `${y - peek.parentElement.getBoundingClientRect().top}px`;
  }
  peek.classList.add('is-visible');
}

const hideConsumePeek = () => $('.consume-peek', readerContent)?.classList.remove('is-visible');

on(readerContent, 'mouseover', event => { const link = event.target.closest('[data-consume]'); if (link) showConsumePeek(link); });
on(readerContent, 'mouseout', event => { if (event.target.closest('[data-consume]')) hideConsumePeek(); });
on(readerContent, 'focusin', event => { const link = event.target.closest('[data-consume]'); if (link) showConsumePeek(link); });
on(readerContent, 'focusout', hideConsumePeek);

// ---- Open / close Knowledge -------------------------------------

const isOpen = () => view.classList.contains('is-open');

// CREATE / CONSUME look selected only while Knowledge is closed; the current mode is always body[data-mode]
const syncModeButtons = () => modeButtons.forEach(button =>
  button.setAttribute('aria-pressed', String(!isOpen() && button.dataset.mode === document.body.dataset.mode)));

// Closing the layer: it fades out showing the page you were on, and only then goes back to the overview
// (so nothing morphs mid-fade, the same as opening it).
function resetAfterClose() {
  closeModal();
  current = null;
  trail = [];
  returnFocus?.focus?.({ preventScroll: true });
  setTimeout(() => {
    if (isOpen()) return;                             // reopened in the meantime
    instant(() => showOnly([overview, reader], overview));
    view.scrollTop = 0;
  }, LAYER_MS + 50);
}

function setKnowledge(open) {
  if (open === isOpen()) return;
  if (!open) resetAfterClose();

  view.classList.toggle('is-open', open);
  view.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('knowledge-open', open);
  knowledgeToggle.setAttribute('aria-pressed', String(open));
  knowledgeToggle.setAttribute('aria-label', open ? 'Close Knowledge view' : 'Open Knowledge view');
    syncModeButtons();

  // Opening shows the current page (or the overview); closing restores the hash from before
  if (open) setUrl(hashFor(current));
  else if (location.hash.startsWith('#mymind')) setUrl(hashBeforeKnowledge);
}

// ---- Responses (visitors) ---------------------------------------
// A question opens in the reader like an article: the question is the title, the approved
// responses are pull quotes, and the form sits underneath. Only approved responses are shown.

const responseHTML = r => quoteCard({ text: r.body });

const responsesSection = q => `
  <div id="knowledgeResponses"><p class="c-sub">Loading…</p></div>
  <form class="response-form" data-question-id="${esc(q.id)}">
    <textarea maxlength="1000" placeholder="Waiting for your mind to marinate..." aria-label="Your response" required></textarea>
    <button type="submit">[ SHARE ]</button>
    <p class="c-sub" role="status"></p>
  </form>`;

// Moderator view: every response (pending ones too) with [ APPROVE ] / [ DELETE ] under each card
const moderatorItem = r => `
  <div class="response-item${r.approved ? '' : ' is-pending'}">
    ${quoteCard({ text: r.body })}
    <div class="response-actions">
      ${r.approved ? '' : `<button type="button" data-response-action="approve" data-response-id="${esc(r.id)}">[ APPROVE ]</button>`}
      <button type="button" data-response-action="delete" data-response-id="${esc(r.id)}">[ DELETE ]</button>
    </div>
  </div>`;

async function loadResponses(questionId) {
  const target = $('#knowledgeResponses');
  const { data, error } = moderatorPassword
    ? await supabase.rpc('list_responses_admin', { pw: moderatorPassword, qid: questionId })
    : await supabase.from('responses').select('body').eq('question_id', questionId).order('created_at');
  console.log('moderator mode:', !!moderatorPassword, 'rows:', data?.length, error);
  if (!target) return;
  if (error?.code === '28000') setModerator(null);   // password no longer valid: back to the visitor view
  const toHTML = moderatorPassword ? moderatorItem : responseHTML;
  target.innerHTML = error ? '<p>Responses could not be loaded.</p>'
    : data.length ? `<div class="response-board">${data.map(toHTML).join('')}</div>`
    : '<p>I do not have a penny, but please feel free to leave a thought :-)</p>';
}

// ---- Moderation (moderator only) --------------------------------
// The moderator password is checked by Supabase (check_moderator, list_responses_admin,
// approve_response, delete_response; see moderation.sql). It is never stored in this file.
let moderatorPassword = null;   // memory only, gone on reload

function setModerator(password) {
  moderatorPassword = password;
  if (currentQuestionId && !password) loadResponses(currentQuestionId);
}

on(readerContent, 'click', async event => {
  const button = event.target.closest('[data-response-action]');
  if (!button || !moderatorPassword) return;
  const { responseAction: action, responseId: rid } = button.dataset;
  if (action === 'delete' && !window.confirm('Delete this response permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc(action === 'approve' ? 'approve_response' : 'delete_response',
    { pw: moderatorPassword, rid });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setModerator(null);
    return;
  }
  loadResponses(currentQuestionId);
});

on(readerContent, 'submit', async event => {
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector('[role="status"]');
  const body = form.querySelector('textarea').value.trim();
  if (!body) return;

  const { error } = await supabase.from('responses')
    .insert({ question_id: form.dataset.questionId, body });
  status.textContent = error ? 'Something went wrong.' : 'Thanks! Your response will appear once approved.';
  if (!error) form.reset();
});

// ---- Add a question (editor only) -------------------------------
// The editor password is never stored in this file. It is checked by Supabase
// (check_editor / add_question), so the [ + ] button and modal are only a convenience.
// Their markup lives in index.html (#addQuestionBtn, #questionModal).

let editorPassword = null;   // memory only, gone on reload

const addBtn = $('#addQuestionBtn');
const modal = $('#questionModal');
const modalClose = $('#questionModalClose');
const questionForm = $('#questionForm');
const questionInput = $('#questionInput');
const questionStatus = $('#questionStatus');

const isModalOpen = () => modal.classList.contains('is-open');

function openModal() {
  questionStatus.textContent = '';
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  questionInput.focus({ preventScroll: true });
}

function closeModal() {
  if (!isModalOpen()) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  addBtn.focus({ preventScroll: true });
}

function setEditor(password) {
  editorPassword = password;
  addBtn.hidden = !password;
  if (!password) closeModal();
}

on(addBtn, 'click', openModal);
on(modalClose, 'click', closeModal);
on(modal, 'click', event => { if (event.target === modal) closeModal(); });   // click outside the panel

on(document, 'keydown', event => {
  if (!isModalOpen()) return;
  if (event.key === 'Escape') closeModal();
  if (event.key !== 'Tab') return;

  // Keep Tab inside the dialog
  const items = $$('textarea, button', modal);
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

on(questionForm, 'submit', async event => {
  event.preventDefault();
  const text = questionInput.value.trim();
  if (!text) return;

  const { error } = await supabase.rpc('add_question', { pw: editorPassword, q: text });
  if (error) {
    if (error.code === '28000') setEditor(null);   // password no longer valid: hide editing again
    else questionStatus.textContent = 'Something went wrong. Please try again.';
    return;
  }

  questionForm.reset();
  closeModal();
  loadQuestions();
});

// Delete a question (editor only): removes it and its responses, then returns to the overview
on(readerContent, 'click', async event => {
  const button = event.target.closest('[data-delete-question]');
  if (!button || !editorPassword) return;
  if (!window.confirm('Delete this question and all of its responses permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc('delete_question', { pw: editorPassword, qid: button.dataset.deleteQuestion });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setEditor(null);   // password no longer valid: hide editing again
    else window.alert('Something went wrong. Please try again.');
    return;
  }
  closeReader();
  loadQuestions();
});

// ---- Password gate ----------------------------------------------
// Lightweight presentation gate only, same as js/password-gate.js: this password and the
// Knowledge content are both visible in client-side code, so this must not protect confidential data.
// Either of these opens the view (read + respond). The editor and moderator passwords live only in Supabase.
// password -> group name. Use the group names in an article's or experiment's `access: [...]`.
const KNOWLEDGE_PASSWORDS = new Map([
  ['cd mymind', 'friends'],
  ['opensesame', 'professional'],   // replace with your own password and group name
]);
let unlocked = false;   // stays unlocked until the page is reloaded, like the Amazon Music case study

// Logo click: closing never needs the password; opening asks for it once.
// A wrong password or a cancelled prompt does nothing.

// Asks for the password the first time. Resolves true once Knowledge is unlocked;
// a wrong password or a cancelled prompt resolves false and does nothing.
async function unlock() {
  if (unlocked) return true;
  const entered = window.prompt('Please enter password:');
  if (entered === null) return false;

  const group = KNOWLEDGE_PASSWORDS.get(entered);
  if (group) {
    unlocked = true;                                   // viewer: can read and respond
    accessGroup = group;                               // ...and sees only the items for this group
  } else {
    const [{ data: isEditor }, { data: isModerator }] = await Promise.all([
      supabase.rpc('check_editor', { pw: entered }),
      supabase.rpc('check_moderator', { pw: entered }),
    ]);
    if (!isEditor && !isModerator) return false;       // wrong password does nothing
    unlocked = true;
    accessGroup = 'all';                               // editor / moderator: sees everything
    if (isEditor) setEditor(entered);                  // editor: also sees the add button
    if (isModerator) setModerator(entered);            // moderator: also approves / deletes responses
  }
  return true;
}

// Unlock (once) and show only what this password allows
async function prepareKnowledge() {
  if (!(await unlock())) return false;
  renderCollections();
  return true;
}

async function openKnowledge() {
  if (!(await prepareKnowledge())) return false;
  setKnowledge(true);
  return true;
}

// Logo click: closing never needs the password; opening asks for it once.
function requestKnowledge() {
  if (isOpen()) setKnowledge(false);
  else openKnowledge();
}

// Anything with data-term (inline links, the "Peek into my mind" button) opens that definition.
// No password is needed. Knowledge itself (the logo) still asks for one.
on(document, 'click', event => {
  const link = event.target.closest('[data-term]');
  if (!link) return;
  event.preventDefault();
  if (isOpen()) { openDefinitions(link.dataset.term, link); return; }

  // Knowledge is closed (e.g. Peek on the Consume board): set the definition up while the layer is hidden,
  // then fade the layer in, exactly like opening Knowledge from its toggle.
  trail = ['outside'];                                 // closing it closes the whole layer
  openDefinitions(link.dataset.term, link);
  setKnowledge(true);
  $('.car', readerContent)?.focus({ preventScroll: true });
});

// The "Read the essay" peek button opens that article directly, with no password.
// Knowledge itself (the logo) still asks for one. [ CLOSE ] closes the whole layer.
on(document, 'click', event => {
  const link = event.target.closest('[data-essay]');
  if (!link) return;
  event.preventDefault();
  const id = link.dataset.essay;

  if (isOpen()) { openReader('article', id, link); return; }

  if (!ARTICLES.some(article => article.id === id)) return;   // unknown essay: do nothing
  trail = ['outside'];                                        // [ CLOSE ] closes the whole layer
  openReader('article', id, link);
  setKnowledge(true);
  closeButton.focus({ preventScroll: true });
});

// ---- Events -----------------------------------------------------

const openFrom = trigger => {
  if (!trigger) return;
  const { knowledgeKind: kind, knowledgeId: id } = trigger.dataset;
  if (kind === 'definition') openDefinitions(id, trigger);
  else openReader(kind, id, trigger);
};

on(view, 'click', event => openFrom(event.target.closest('[data-knowledge-kind]')));

// Cards are article[role=button], so they need Enter / Space themselves.
// (Only when the card itself has focus, so links on a flash card's back still work.)
on(view, 'keydown', event => {
  const card = event.target.closest('.c-card[role="button"]');
  if (card === event.target && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    card.click();
  }
});

on(closeButton, 'click', goBack);
on(knowledgeToggle, 'click', requestKnowledge);

// Picking CREATE or CONSUME (click or arrow keys) closes Knowledge and shows that view
on(document, 'mode:changed', () => setKnowledge(false));

// ---- Deep links ---------------------------------------------------
// Runs on page load (a pasted link) and on Back / Forward.
const KNOWLEDGE_HASH = /^#mymind(?:\/(article|experiment|question|definition)\/([^/]+))?$/;

async function routeFromHash() {
  const match = KNOWLEDGE_HASH.exec(location.hash);

  // Not a Knowledge URL: make sure Knowledge is closed
  if (!match) { if (isOpen()) setKnowledge(false); return; }

  const [, kind, rawId] = match;
  const id = rawId && decodeURIComponent(rawId);

  if (!(await prepareKnowledge())) return;   // same password prompt as the logo; cancel / wrong = stay put
  await questionsReady;                      // questions come from Supabase

  current = null;                            // a linked page starts fresh: [ CLOSE ] goes to the overview
  trail = [];

  // Overview, or a page that doesn't exist / this password group can't see
  const found = kind && {
    article:    () => ARTICLES.find(a => a.id === id),
    experiment: () => EXPERIMENTS.find(e => e.id === id),
    question:   () => QUESTIONS.find(q => q.id === id),
    definition: () => DEFINITIONS.find(d => d.id === id),
  }[kind]();
  const allowed = found && (kind === 'article' || kind === 'experiment' ? canSee(found) : true);

  if (!allowed) {
    if (reader.classList.contains('is-open')) closeReader();
    setUrl('#mymind', { replace: true });
    setKnowledge(true);
    return;
  }

  if (kind === 'definition') openDefinitions(id, null);
  else openReader(kind, id, null);
  setKnowledge(true);
}

window.addEventListener('popstate', routeFromHash);
routeFromHash();