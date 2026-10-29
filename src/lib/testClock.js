// Test-only "time travel" for the review features (spaced.js asks this file for "now").
// The offset (days) lives in localStorage on this computer only; no database date is changed here.
// It does nothing in the live build: outside `npm run dev` the offset is always 0.
const KEY = 'lc-test-day-offset';
const DAY = 24 * 60 * 60 * 1000;

export const testClockEnabled = import.meta.env.DEV;

export function getDayOffset() {
  if (!testClockEnabled) return 0;
  try {
    const n = Math.floor(Number(localStorage.getItem(KEY)));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function setDayOffset(days) {
  try {
    if (days > 0) localStorage.setItem(KEY, String(days));
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked: the pretend date just stays at today
  }
}

// The date that review code should treat as "now".
export function reviewNow() {
  return new Date(Date.now() + getDayOffset() * DAY);
}
