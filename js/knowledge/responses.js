import { $, esc, on } from '../dom.js';
import { thoughtCard } from '../blocks.js';
import { supabase } from '../supabase.js';
import { readerContent } from './state.js';

// ---- Responses (visitors) ---------------------------------------
// A question opens in the reader like an article: the question is the title, the form sits under it,
// and the approved responses are thought cards below the form. Only approved responses are shown.

// Responses are drawn as thought cards: the visitor's words in the Mido handwriting, with no date.
const responseHTML = r => thoughtCard({ blocks: [{ type: 'paragraph', text: r.body }] });

export const responsesSection = q => `
  <form class="response-form" data-question-id="${esc(q.id)}">
    <textarea maxlength="1000" placeholder="Waiting for your mind to marinate..." aria-label="Your response" required></textarea>
    <button type="submit">[ SHARE ]</button>
    <p class="c-sub" role="status"></p>
  </form>
  <div id="knowledgeResponses"><p class="c-sub">Loading…</p></div>`;

export async function loadResponses(questionId) {
  const target = $('#knowledgeResponses');
  const { data, error } = await supabase.from('responses').select('body').eq('question_id', questionId).order('created_at');
  if (!target) return;
  target.innerHTML = error ? '<p>Responses could not be loaded.</p>'
    : data.length ? `<div class="response-board">${data.map(responseHTML).join('')}</div>`
    : '<p>I do not have a penny, but please feel free to leave a thought :-)</p>';
}

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
