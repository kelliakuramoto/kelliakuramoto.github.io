import { $, esc, on } from '../dom.js';
import { thoughtCard } from '../blocks.js';
import { supabase } from '../supabase.js';
import { nav, readerContent } from './state.js';
import { session } from './access.js';

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

// Moderator view: every response (pending ones too) with [ APPROVE ] / [ DELETE ] under each card
const moderatorItem = r => `
  <div class="response-item${r.approved ? '' : ' is-pending'}">
    ${responseHTML(r)}
    <div class="response-actions">
      ${r.approved ? '' : `<button type="button" data-response-action="approve" data-response-id="${esc(r.id)}">[ APPROVE ]</button>`}
      <button type="button" data-response-action="delete" data-response-id="${esc(r.id)}">[ DELETE ]</button>
    </div>
  </div>`;

export async function loadResponses(questionId) {
  const target = $('#knowledgeResponses');
  const { data, error } = session.moderatorPassword
    ? await supabase.rpc('list_responses_admin', { pw: session.moderatorPassword, qid: questionId })
    : await supabase.from('responses').select('body').eq('question_id', questionId).order('created_at');
  if (!target) return;
  if (error?.code === '28000') setModerator(null);   // password no longer valid: back to the visitor view
  const toHTML = session.moderatorPassword ? moderatorItem : responseHTML;
  target.innerHTML = error ? '<p>Responses could not be loaded.</p>'
    : data.length ? `<div class="response-board">${data.map(toHTML).join('')}</div>`
    : '<p>I do not have a penny, but please feel free to leave a thought :-)</p>';
}

// ---- Moderation (moderator only) --------------------------------
// The moderator password is checked by Supabase (check_moderator, list_responses_admin,
// approve_response, delete_response; see moderation.sql). It is never stored in this file.
export function setModerator(password) {
  session.moderatorPassword = password;
  if (nav.currentQuestionId && !password) loadResponses(nav.currentQuestionId);
}

on(readerContent, 'click', async event => {
  const button = event.target.closest('[data-response-action]');
  if (!button || !session.moderatorPassword) return;
  const { responseAction: action, responseId: rid } = button.dataset;
  if (action === 'delete' && !window.confirm('Delete this response permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc(action === 'approve' ? 'approve_response' : 'delete_response',
    { pw: session.moderatorPassword, rid });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setModerator(null);
    return;
  }
  loadResponses(nav.currentQuestionId);
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
