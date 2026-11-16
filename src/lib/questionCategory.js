import { COLLOQUIAL, CONTRACTION, FUNCTION_WORDS } from './blanks';
import { isMiss } from './grading';
import { CATEGORIES } from './diagnosis';

// Which skill does a dictation question (one blank or one expression group) test?
// The clip data has no category labels, so the category comes from the question itself
// (NEVER from the mistake label the learner picked). The rules, in order:
//   1. a key expression (idiom, phrasal verb, colloquial phrase) ........ Vocabulary
//   2. a contracted or reduced spoken form (I'm, don't, gonna, wanna) ... Connected Speech
//   3. a short function word (the, to, can, did ...) ..................... Speed
//   4. any other word (a content word) ................................... Vocabulary
// Main Idea: none. The dictation asks for words and expressions, not for the gist of a sentence, so no
// question is assigned to Main Idea. It shows "no questions" in the Diagnosis Report instead of an invented number.
export function questionCategory(blank) {
  if (blank.isKeyWord || (blank.parts && blank.parts.length > 1)) return 'V';
  const w = normalize(blank.answer);
  if (CONTRACTION.test(w) || COLLOQUIAL.has(w)) return 'CS';
  if (FUNCTION_WORDS.has(w)) return 'SP';
  return 'V';
}
const normalize = (s) => String(s).toLowerCase().replace(/[’]/g, "'");

export const MAPPING_NOTE = {
  CS: 'reduced or contracted forms (I\'m, don\'t, gonna, wanna)',
  SP: 'short, fast function words (the, to, can, did)',
  V: 'key expressions and content words',
  MI: 'no dictation question is assigned to this category',
};

// Accuracy per category from the real grading results of one attempt.
// accuracy is null for a category with no questions (never 0%).
export function categoryStats(results) {
  const stats = Object.fromEntries(CATEGORIES.map((c) => [c.id, { id: c.id, total: 0, correct: 0, accuracy: null }]));
  results.forEach((row) => {
    row.tokens.filter((t) => t.type === 'blank').forEach((t) => {
      const s = stats[questionCategory(t)];
      s.total += 1;
      if (!isMiss(t)) s.correct += 1;
    });
  });
  Object.values(stats).forEach((s) => { s.accuracy = s.total ? Math.round((s.correct / s.total) * 100) : null; });
  return CATEGORIES.map((c) => stats[c.id]);
}

// Strongest and weakest points among categories that have questions. Ties are all returned.
export function extremes(stats) {
  const used = stats.filter((s) => s.total > 0);
  if (!used.length) return { strongest: [], weakest: [] };
  // Compare the exact fractions, not the rounded percentages.
  const ratio = (s) => s.correct / s.total;
  const best = Math.max(...used.map(ratio));
  const worst = Math.min(...used.map(ratio));
  return {
    strongest: used.filter((s) => ratio(s) === best),
    weakest: used.filter((s) => ratio(s) === worst),
  };
}
