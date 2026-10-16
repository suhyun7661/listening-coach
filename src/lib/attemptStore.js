// Keeps the most recent attempt in the browser tab so the Review page can show it
// (and survive a refresh). Saving attempts to the database comes in Stage 10.
const KEY = 'lc-last-attempt';

export function saveAttempt(attempt) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...attempt, userTags: attempt.userTags ?? {} }));
  } catch {
    // Storage can be blocked; the Review page then shows its "no attempt" message.
  }
}

export function loadAttempt() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function saveUserTags(userTags) {
  const attempt = loadAttempt();
  if (attempt) saveAttempt({ ...attempt, userTags });
}
