// Keeps every graded attempt (newest first) in this browser, so earlier reports can be
// opened again and added up. In Stage 10 these move to the Supabase database.
const KEY = 'lc-attempts';
const MAX = 200;

function readAll() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Storage can be full or blocked; the report still shows for this visit.
  }
}

// Adds a new report and returns its id.
export function saveAttempt(attempt) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  writeAll([{ ...attempt, id, createdAt: new Date().toISOString(), userTags: {} }, ...readAll()]);
  return id;
}

export function loadAttempts() {
  return readAll();
}

// With no id, returns the most recent report.
export function loadAttempt(id) {
  const list = readAll();
  return id ? list.find((a) => a.id === id) ?? null : list[0] ?? null;
}

export function saveUserTags(id, userTags) {
  writeAll(readAll().map((a) => (a.id === id ? { ...a, userTags } : a)));
}
