import { supabase } from '../supabase.js';
import { register } from '../content/index.js';
import { cardFor } from '../content/kinds.js';
import { renderInto } from './collections.js';
import { drawBoard } from '../consume.js';

// Questions come from Supabase. Each one is a Consume quote card that opens the reader,
// the same way articles and experiments do.
let QUESTIONS = [];
export async function loadQuestions() {
  const { data, error } = await supabase.from('questions').select('*').order('created_at');
  if (error) { console.error('Questions failed to load:', error.code, error.message); return; }
  // date and subheader feed the same reader header that articles use
  QUESTIONS = data;
  // Questions join the content graph, so essays and definitions can [[link]] to them by id
  // (an optional `links` text[] column on the table lets a question point at others too).
  register('question', QUESTIONS, { texts: q => [q.text], idOf: q => q.text });
  renderInto('#knowledgeQuestions', QUESTIONS, cardFor);
  drawBoard();   // cards a question links to now have something attached
}
// Starts loading right away; routeFromHash awaits this promise so a pasted question link waits for its data.
export const questionsReady = loadQuestions();
