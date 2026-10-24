import { $, on } from './dom.js';

// Lightweight presentation gate only. The password is visible in client-side code,
// and the content is shipped in index.html, so this must not protect confidential data.
const PASSWORD = 'opensesame';
const button = $('#password-btn');
const passwordRow = $('#password-row');
const learnMoreRow = $('#learn-more-row');
const content = $('#restricted-content');

if (button && content) {
  on(button, 'click', () => {
    // Native browser prompt. Note: prompt() cannot mask the entered characters.
    const enteredPassword = window.prompt('Please enter password:');

    // Closing or cancelling the prompt simply leaves the page unchanged.
    if (enteredPassword === null) return;

    if (enteredPassword === PASSWORD) {
      content.hidden = false;
      if (passwordRow) passwordRow.hidden = true;
      if (learnMoreRow) learnMoreRow.hidden = true;
      document.dispatchEvent(new CustomEvent('restricted-content:loaded'));
      return;
    }

    // Use the browser's native message dialog rather than inline page messaging.
    window.alert('Incorrect password. Please try again.');
  });
}