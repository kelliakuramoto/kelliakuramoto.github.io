// =====================================================
// THOUGHTS  (kind: 'thought'; written on white paper on a Consume detail page)
//   text    what you wrote. "\n" makes a line break.
//   blocks  instead of `text`, when a thought mixes kinds of writing: the same blocks as an essay, in order.
//             { type: 'paragraph', text: '...' }   your handwriting
//             { type: 'quote',     text: '...', highlight: '...', url: 'https://...' }   a quote, in the quote card's type
//                                                  `highlight` (optional): the exact words to mark green, as on a quote card
//                                                  `url` (optional): clicking the quote opens this page in a new tab
//             { type: 'transcript', speaker: 'Steve', text: '...' }   a line of conversation: Geist Mono, "Steve:" in a column with the words beside it
//             { type: 'list' | 'numbered-list', items: ['...', '...'] }   the essay's bulleted / numbered list, in handwriting
//           (use `text` OR `blocks`, not both)
//           [[kind:id|words]] links work in a thought written inside an essay or experiment (they connect it like any other link).
//           They work on a Consume detail page too, where a thought's [[links]] open their pages.
//   date    ISO date (YYYY-MM-DD)
//   wide    optional, true: on a Consume detail page this thought spans both columns instead of one (for a long thought)
//   parent  the media this thought belongs to, e.g. 'book:letters-to-a-young-poet' (media is written by its `type`). A book / podcast / poem with a
//           thought attached to it opens a detail page on the Consume board. Add `id` only if you link to it by hand.
//   links   (optional) other things it is merely related to, e.g. ['definition:operating-system']
// Thoughts never appear on the main Consume board. They show only on a detail page, and as a pink sticky note on the card of what they link to.
// TO ADD ONE:  copy an entry below, change text (or blocks) / date / parent, then run:  node scripts/check-content.mjs
// The two below are placeholders: replace them with your own.
// =====================================================
// What a thought says, as essay-style blocks: `blocks` as written, or `text` as a single paragraph.
export const thoughtBlocks = thought => thought.blocks || [{ type: 'paragraph', text: thought.text }];

export const THOUGHTS = [
  {
    text: 'What if the same way you could scan a nutrition label and understand the impact on your health, you could scan physical products and understand the material impact on the environment?',
    parent: 'quote:circular-economy',
  },
  {
    blocks: [
      { 
        type: 'quote', text: 'Because your language has told you that blame has to be assigned, you then assume that blame is neccessary.\n\nIf you show a video of a ball rolling onto the screen and it knocks into a vase and the vase falls, you ask English speakers to describe it they’ll say someone rolled a ball into a vase. There’s no someone on the screen at all.', 
        highlight: 'assume that blame is neccessary',
      },
      { type: 'paragraph', text: 'I recently found myself in a situation where no one did anything wrong, there was no "bad guy" but I still lost a relationship that meant a lot to me. I was quite upset but it felt a bit misplaced because I didn’t have anyone to blame for how I was feeling.\n\n After a second I remebered this podcast and realized that it felt so fuzzy because the American grammar is wired in a way that associates an actor with an action. The idea that something could happen to me without someone else causing it, is a foregin concept to me. I’m still grappling with the lack of casuality and fighting even harder to not blame myself in this situation (that would be the automatic thing to do in my mind).\n\nI want to be the type of person who can accept actions without agents or cause because sometimes in life things just happen.',
      },
    ],
    parent: 'podcast:boroditsky-language-changes-personality',
    date: '2026-11-12',
    wide: true,
  },
    {
    text: 'I heard this poem for the first time at a [[url:https://www.yuz-sf.org/|Young Urban Zen]] talk at the [[url:https://www.sfzc.org/|San Francisco Zen Center]]. The talk was centered around genorosity',
    parent: 'quote:sun-never-says',
  },
  {
    text: 'I’ve had this quote hanging up on my desk since the summer of 2022, back when my thoughts seemed to eclipse my mind and therefor my view of the world.\n\nLife isn’t as unbearable now but I still keep it up as a reminder everyday that whatever overwhelming or horrible thing I think is happening to me right now will not last forever. I can choose which program to run, I can choose how I percieve inputs of information, and at the end of the day if things still suck, life really isn’t that long anways.\n\n "Taking my big ideas to big places to feel small" - Huarui Lai',
    parent: 'quote:life-feels-unbearable',
    wide: true,
  },
  {
    blocks: [
      { 
        type: 'quote', text: 'Among the books that mattered to Steve was Rilke’s Letters to a Young Poet. I’m struck by this line from its pages: “Live the questions for now. Perhaps then you will gradually, without noticing it, live your way into the answer, one distant day in the future.”', 
        highlight: 'Live the questions for now', 
        // url: 'https://letters.stevejobsarchive.com/laurene-powell-jobs' 
      },
      { type: 'paragraph', text: 'When I read this for the first time back in February I wasn’t quite sure what Laurene or Rilke meant. I couldn’t grasp the idea that to answer my questions all I had to do was live, but not in the way I had previously defined it. To live meant to truly become an active participant in the discussion, not to theorize or think, but to act.\n\nFor most of my life I was convinced that in order to solve a problem, I first had to understand how it worked, I had to understand the why. This led me to spend most of my days thinking, thinking about why my [[definition:operating-system|operating system]] was engineered in this way, thinking about why my emotions felt so overwhelming, thinking, thinking, thinking. And I remember thinking (what a surprise) what was the point of all this expended energy if I still didn’t have the answers.\n\nI can’t remember the exact catalyst, but I can remember how exhausted I felt. It was like my brain had been pulled and prodded, stretched and squeezed in every direction you could imagine and all I knew was that I couldn’t do it anymore, I couldn’t think.\n\nSo I started tweaking bits and pieces of my life. Not knowing what would happen but knowing that anything had to be better than the paralyzing circularity that often comes with [[quote:more-actual-troubles|living in your mind, instead of living in your life]].\n\n As I sit here 8 months later, glancing at my notebook from when I first read this quote, I can’t help but chuckle at the sentence "I’m not quite sure that its working but I have to give it my best try."\n\nI am grateful to the past version of myself who had to courage to try, and I hope the future versions never forget to.' },
    ],
    parent: 'poem:letters-to-a-young-creator',
    date: '2026-11-24',
    wide: true,
  },
];
