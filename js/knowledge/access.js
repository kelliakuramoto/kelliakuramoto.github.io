import { supabase } from '../supabase.js';

// =====================================================
// ACCESS: who is signed in, and what they may see.
// `session` is the one place that remembers it (memory only: gone on reload).
// =====================================================

export const session = {
  unlocked: false,           // stays unlocked until the page is reloaded, like the Amazon Music case study
  group: null,               // which password group is signed in: null until unlocked, 'all' for the editor / moderator
  editorPassword: null,      // the editor / moderator passwords are checked by Supabase, never stored in this file
  moderatorPassword: null,
};

// An article or experiment with `access: ['friends']` only shows for that group; no `access` = everyone.
export const canSee = item => session.group === 'all' || !item.access || item.access.includes(session.group);

// ---- Password gate ----------------------------------------------
// Lightweight presentation gate only, same as js/password-gate.js: this password and the
// Knowledge content are both visible in client-side code, so this must not protect confidential data.
// Either of these opens the view (read + respond). The editor and moderator passwords live only in Supabase.
// password -> group name. Use the group names in an article's or experiment's `access: [...]`.
const KNOWLEDGE_PASSWORDS = new Map([
  ['cd mymind', 'friends'],
  ['opensesame', 'professional'],   // replace with your own password and group name
]);

// Logo click: closing never needs the password; opening asks for it once.
// A wrong password or a cancelled prompt does nothing.

// Asks for the password the first time. Resolves false for a wrong password or a cancelled prompt (nothing happens);
// otherwise an object: for the editor / moderator { password, isEditor, isModerator } so the caller can set those up.
export async function unlock() {
  if (session.unlocked) return {};
  const entered = window.prompt('Please enter password:');
  if (entered === null) return false;

  const group = KNOWLEDGE_PASSWORDS.get(entered);
  if (group) {
    session.unlocked = true;                           // viewer: can read and respond
    session.group = group;                             // ...and sees only the items for this group
  } else {
    const [{ data: isEditor }, { data: isModerator }] = await Promise.all([
      supabase.rpc('check_editor', { pw: entered }),
      supabase.rpc('check_moderator', { pw: entered }),
    ]);
    if (!isEditor && !isModerator) return false;       // wrong password does nothing
    session.unlocked = true;
    session.group = 'all';                             // editor / moderator: sees everything
    return { password: entered, isEditor, isModerator };   // the caller sets up the add button / moderation
  }
  return {};
}
