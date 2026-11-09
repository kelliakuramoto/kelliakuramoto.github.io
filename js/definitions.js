import { esc } from './dom.js';

// =====================================================
// Definitions (Knowledge: "What I have defined")
// One entry per concept. Add, remove or reorder them here; the deck, the row's count and every link update by themselves.
//   id    short slug used in links
//   word  the concept, shown on the front of the card
//   text  the definition. [[other-id]] links to another definition,
//         [[other-id|your words]] chooses the link text.
//
// Connecting things to a concept (nothing is declared twice):
//   Articles     write [[id]] in the article text, in js/knowledge.js  -> listed under "How I use it"
//   Consume      add  term: 'id'  to the item, in js/consume.js        -> listed under "Where it comes from"
//                                                                         and gets a "Peek into my mind" button
// =====================================================
export const DEFINITIONS = [
  { id: 'gut-check', word: 'Gut check', text: 'Your body’s response to external information in the form of visceral reaction. Suggestion: Trust and verify your gut when you intimately understand why and how you operate (i.e. how you make decisions).'},
  { id: 'currency-exchange', word: 'Cost of translation', text: 'The effort required to present information in a way that makes sense to the listener, but might not be intuitive to the speaker. Suggestion: Sometimes cost of translation is too high and that is okay. Maybe life is just about finding people who speak your language.' },
]

export const getDefinition = id => DEFINITIONS.find(term => term.id === id);

// Escapes `text`, then turns [[id]] / [[id|label]] into a link to that definition.
// Text after the brackets stays attached ("[[sprint]]s" reads "sprints").
// An unknown id is left as typed so a typo is easy to spot.
export const linkTerms = text => esc(text).replace(/\[\[([\w-]+)(?:\|([^\]]+))?\]\]/g, (match, id, label) => {
  const term = getDefinition(id);
  return term
    ? `<a href="#${id}" class="term-link" data-term="${id}">${label || esc(term.word.toLowerCase())}</a>`
    : match;
});

// True when `text` contains a link to the definition `id`
export const mentions = (text, id) => new RegExp(`\\[\\[${id}(\\||\\]\\])`).test(text || '');