// Spaced repetition for the notebook.
//   step 0  new word, or a word you got wrong  -> comes back after 1 day
//   step 1  answered right once                 -> comes back after 3 days
//   step 2  answered right twice                -> comes back after 7 days
//   step 3  answered right three times ("learned") -> a light check after 30 days
// A wrong answer always sends the word back to step 0 (1 day).
import { reviewNow } from './testClock';

const DAY = 24 * 60 * 60 * 1000;
export const LEARNED_CHECK_DAYS = 30;

const addDays = (date, days) => new Date(date.getTime() + days * DAY);

export function scheduleAfter(step, correct, now = reviewNow()) {
  if (!correct) return { step: 0, nextAt: addDays(now, 1) };
  const next = Math.min(step + 1, 3);
  const days = { 1: 3, 2: 7, 3: LEARNED_CHECK_DAYS }[next];
  return { step: next, nextAt: addDays(now, days) };
}

export function stepLabel(step) {
  return ['New / needs practice', 'Passed once', 'Passed twice', 'Learned'][step] ?? 'New';
}

export function isDue(item, now = reviewNow()) {
  return new Date(item.nextAt) <= now;
}

// "today", "tomorrow", "in 3 days" ...
export function whenText(nextAt, now = reviewNow()) {
  const days = Math.ceil((new Date(nextAt) - now) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}
