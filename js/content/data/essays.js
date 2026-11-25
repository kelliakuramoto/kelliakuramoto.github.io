// =====================================================
// ESSAYS  (kind: 'article'; the URL kind stays "article" so old #mymind/article/... links keep working)
// Add an essay: copy an entry, give it a unique `id`, write blocks. That is all.
//   id, title, subheader, date (YYYY-MM-DD), access?: ['friends', ...] (none = everyone)
//   links?: ['definition:x', 'book:y', ...]  explicit connections (optional)
//   blocks: paragraph | heading | subheading | quote | underline | image | divider | list | numbered-list | thought
//   A `thought` block is a thought card written right here (the same card as on the Consume page, see thoughts.js):
//     { type: 'thought', text: 'what you wrote', date: '2026-11-25' }
//     { type: 'thought', date: '2026-11-25', blocks: [ { type: 'quote', text: '...', highlight: '...', url: 'https://...' },
//                                                      { type: 'paragraph', text: '...' } ] }
//   (use `text` OR `blocks`; `date` is optional. It belongs to this essay only and does not appear anywhere else.)
//
// Linking from inside text (works in every `text` and list item):
//   [[definition:free-bread]]      -> the item with that kind and id (always write the kind, like `parent` and `links`)
//   [[book:letters-to-a-young-poet|Letters to a Young Poet]]   -> custom link words (media is written by its `type`)
// Every [[link]] is two-way: the target automatically lists this essay too.
// =====================================================
export const ESSAYS = [
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
        { type: 'paragraph', text: 'I will not deny that there is benefit in writing for the reader and I myself have read many articles that I have found propounding moving or sparked an engaging conversation between my friends and I. But I kind of think it’s something that naturally happens, rather than the main reason to do it. I think there is a greater beauty in craft, in finding your voice, one that is truly yours, and if people just happen to speak your language then it’s [[definition:free-bread]].' },
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
      { type: 'paragraph', text: 'I do so because sometimes you win and sometimes you learn. Sometimes you have to play the tape to the very end to know that this wasn’t the path for you. As Rainier Maria Rilke said in "[[book:letters-to-a-young-poet|Letters to a Young Poet]]"'},
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
    { type: 'paragraph', text: 'For reference, I walk anywhere between 6-10 miles on the weekdays and 12-15 miles on the weekends; which as I’m saying this out loud sounds like a lot but trust me it’s not as hard as you think if you live in a city with poor public transport and get motion sick easily.' },
    { type: 'paragraph', text: 'Anyways, I usually respond with either listening to a podcast, calling a friend to catch up, or figuring out the logistics of my day which actually takes up a surprising amount of time. For example, let’s say I know that I have to be at this place at this time and it takes me 17 minutes to walk a mile; How far are the two places from each other? What is the route with the least amount of hills? Do I need to stop for food on the way because I know I’m going to be hungry… you get the idea.' },
    { type: 'paragraph', text: 'But my favorite thing to think about is when I’m walking back from hanging out with my friends and I run a retrospective of our hang out.' },
    { type: 'paragraph', text: 'If you don’t know what a retrospective is, that’s probably a good thing but essentially it’s a meeting where engineers come together and look back on the complete work during the sprint, evaluate what went well, what failed, and how to improve for the future. It’s like mindfulness, but for tech companies.' },
    { type: 'paragraph', text: 'But in my case, instead trying to figure out how to be more efficient, I ask myself questions like: How do I feel after hanging out with them? Do I think I showed up as a good friend that day? Did my actions align with my beliefs and values? And if any of the answers are no, I run a root cause analysis and ask myself the 5 why’s? Which is a UX research method where when someone gives you an answer, you respond with why, and then when they answer, you respond with why again and this keeps going until you’ve identity the root cause (I know crazy where the name comes from).' },
    { type: 'paragraph', text: 'If this all sounds a bit weird in theory, let me give you a good example. So one day my friends and I were doing the Crosstown Trail and every mile, we made a letter of the word with our bodies, so that at the end we could collage them together. During this walk, I was telling one of my friends that the day before I was dancing in public and my other friend told me to stop, which really annoyed me for a couple reasons 1. Just because he might have felt embarrassed doesn’t mean that I should feel embarrassed too and 2. I don’t like being told what to do and more importantly [[article:no-advice|I don’t believe that you should tell someone what to do]] especially if it’ not harming anyone, which my dancing wasn’t.' },
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
