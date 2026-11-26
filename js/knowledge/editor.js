import { $, $$, on, setOverlay } from '../dom.js';
import { supabase } from '../supabase.js';
import { readerContent } from './state.js';
import { session } from './access.js';
import { loadQuestions } from './questions.js';
import { closeReader } from './reader.js';

// ---- Add a question (editor only) -------------------------------
// The editor password is never stored in this file. It is checked by Supabase
// (check_editor / add_question), so the [ + ] button and modal are only a convenience.
// Their markup lives in index.html (#addQuestionBtn, #questionModal).

const addBtn = $('#addQuestionBtn');
const modal = $('#questionModal');
const modalClose = $('#questionModalClose');
const questionForm = $('#questionForm');
const questionInput = $('#questionInput');
const questionStatus = $('#questionStatus');

const isModalOpen = () => modal.classList.contains('is-open');

function openModal() {
  questionStatus.textContent = '';
  setOverlay(modal, true);
  questionInput.focus({ preventScroll: true });
}

export function closeModal() {
  if (!isModalOpen()) return;
  setOverlay(modal, false);
  addBtn.focus({ preventScroll: true });
}

export function setEditor(password) {
  session.editorPassword = password;
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

  const { error } = await supabase.rpc('add_question', { pw: session.editorPassword, q: text });
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
  if (!button || !session.editorPassword) return;
  if (!window.confirm('Delete this question and all of its responses permanently?')) return;

  button.disabled = true;
  const { error } = await supabase.rpc('delete_question', { pw: session.editorPassword, qid: button.dataset.deleteQuestion });
  if (error) {
    button.disabled = false;
    if (error.code === '28000') setEditor(null);   // password no longer valid: hide editing again
    else window.alert('Something went wrong. Please try again.');
    return;
  }
  closeReader();
  loadQuestions();
});
