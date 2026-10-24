import './navigation.js';
import './consume.js';
import './photography.js';
import './password-gate.js';
import './photobook.js';
import { initVideos, initCarousels } from './media.js';

initVideos();
initCarousels();
document.addEventListener('restricted-content:loaded', () => {
  const content = document.getElementById('restricted-content');
  if (content) { initVideos(content); initCarousels(content); }
});