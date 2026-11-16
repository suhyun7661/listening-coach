import { gradeAnswer, isMiss } from './grading';
import { answerText } from './textUtils';
import { CATEGORIES, CATEGORY_IDS, cleanTag, diagnoseSentence } from './diagnosis';

export { CATEGORIES, CATEGORY_IDS };

// Grades every blank, then adds ONE suggested category to every sentence that has a mistake
// (see diagnosis.js). The suggestion is stored as autoTag; the learner's choice is stored separately as userTag.
export function buildResults(sentences, tokensBySentence, answers) {
  return sentences.map((sentence, si) => {
    const sentenceId = sentence.id ?? `s${si + 1}`;
    let blankNumber = 0;

    const tokens = tokensBySentence[si].map((token) => {
      if (token.type !== 'blank') return token;
      const userAnswer = answerText(answers[si]?.[blankNumber] ?? '');
      blankNumber += 1;
      return { ...token, blankId: `${sentenceId}-${token.index}`, userAnswer, ...gradeAnswer(userAnswer, token.answer) };
    });

    const row = { sentenceId, number: si + 1, text: sentence.text, ko: sentence.ko, keyWords: sentence.keyWords ?? [], tokens };
    const diagnosis = diagnoseSentence(row);
    if (diagnosis?.tag) { // no recommendation when the evidence is not enough
      row.autoTag = diagnosis.tag;
      row.tokens = tokens.map((t) => (t.type === 'blank' && isMiss(t) ? { ...t, autoTag: diagnosis.tag } : t));
    }
    return row;
  });
}

export function allBlanks(results) {
  return results.flatMap((r) => r.tokens.filter((t) => t.type === 'blank'));
}

// Score is accuracy only; categories never change the score.
export function computeScore(results) {
  const blanks = allBlanks(results);
  const points = blanks.reduce((sum, b) => sum + b.points, 0);
  const total = blanks.length;
  return { points, total, correct: blanks.filter((b) => !isMiss(b)).length, percent: total ? Math.round((points / total) * 100) : 0 };
}

// Sentences with at least one wrong or empty blank.
export const wrongSentences = (results) => results.filter((r) => r.tokens.some((t) => t.type === 'blank' && isMiss(t)));

// One-letter typos (counted correct): shown separately, never as listening errors.
export function spellingSlips(results) {
  return results.flatMap((r) =>
    r.tokens.filter((t) => t.type === 'blank' && t.status === 'almost').map((t) => ({ number: r.number, answer: t.answer, userAnswer: t.userAnswer }))
  );
}

// Only the learner's confirmed choice (userTags is keyed by sentence id) is final.
// A suggestion is never treated as confirmed.
export function confirmedTag(row, userTags = {}) {
  return cleanTag(userTags[row.sentenceId]);
}

// Counts mistaken sentences per CONFIRMED category, plus how many are still waiting for a choice.
export function summarizeTags(results, userTags = {}) {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
  let pending = 0;
  wrongSentences(results).forEach((row) => {
    const tag = confirmedTag(row, userTags);
    if (tag) counts[tag] += 1;
    else pending += 1;
  });
  return { counts, pending };
}

// Category with the most mistaken sentences; null when there are none.
export function mainWeakness(counts) {
  let best = null;
  CATEGORY_IDS.forEach((id) => {
    if (counts[id] > 0 && (!best || counts[id] > counts[best])) best = id;
  });
  return best;
}
