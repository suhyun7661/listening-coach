import { gradeAnswer, isMiss } from './grading';
import { answerText, normalize } from './textUtils';

export const CATEGORIES = [
  { id: 'SP', label: 'Speed', ko: '속도', description: "Couldn't keep up with how fast the speaker talked." },
  { id: 'V', label: 'New Word', ko: '모르는 표현', description: "Didn't know the word or expression." },
  { id: 'CS', label: 'Connected Speech', ko: '연음·축약', description: 'Words were linked or reduced in natural speech.' },
  { id: 'AC', label: 'Accent', ko: '억양·발음', description: "The speaker's accent made the word hard to hear." },
  { id: 'MI', label: 'Main Idea', ko: '전체 의미 놓침', description: 'Lost the overall meaning of what was said.' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// Reduced spellings learners write when they hear connected speech.
const REDUCTIONS = new Set([
  'gonna', 'wanna', 'gotta', 'hafta', 'kinda', 'sorta', 'outta', 'lotta', 'lemme', 'gimme',
  'dunno', 'didja', 'dija', 'didya', 'whaddya', 'wassup', 'ya', 'cha', "y'all",
]);

// Rules are checked in order; the first match wins.
// 1. CS: reduced spelling, two words merged/split, or the word was cut short (mount -> mountain)
// 2. V:  key expression
// 3. MI: most of the sentence was missed (3+ blanks, 60%+ missed)
// 4. SP: everything else, including empty blanks
// (There is no automatic guess for AC any more: the app has one accent, so the learner can still pick Accent by hand.)
export function guessTag({
  answer,
  correct,
  prevWord = '',
  nextWord = '',
  isKeyWord = false,
  sentenceMissRate = 0,
  blanksInSentence = 1,
}) {
  const a = normalize(answer);
  const c = normalize(correct);
  const p = normalize(prevWord);
  const n = normalize(nextWord);
  const squash = (s) => s.replace(/[ ']/g, '');

  if (a) {
    // Two words typed where the answer is one word = a split word. (Expressions are many words by design.)
    if (REDUCTIONS.has(a) || (a.includes(' ') && !c.includes(' '))) return 'CS';
    if (n && squash(a) === squash(c + n)) return 'CS';
    if (p && squash(a) === squash(p + c)) return 'CS';
    if (a.length >= 3 && c.length - a.length >= 2 && c.startsWith(a)) return 'CS';
  }
  // Only key expressions count as "new": the learners know plenty of academic words, so a long word is not a guess for V.
  if (isKeyWord) return 'V';
  if (blanksInSentence >= 3 && sentenceMissRate >= 0.6) return 'MI';
  return 'SP';
}

// Grades every blank and adds an automatic tag to each miss.
export function buildResults(sentences, tokensBySentence, answers) {
  return sentences.map((sentence, si) => {
    const sentenceId = sentence.id ?? `s${si + 1}`;
    let blankNumber = 0;

    const graded = tokensBySentence[si].map((token) => {
      if (token.type !== 'blank') return token;
      const userAnswer = answerText(answers[si]?.[blankNumber] ?? '');
      blankNumber += 1;
      return { ...token, blankId: `${sentenceId}-${token.index}`, userAnswer, ...gradeAnswer(userAnswer, token.answer) };
    });

    const blanks = graded.filter((t) => t.type === 'blank');
    const missRate = blanks.length ? blanks.filter(isMiss).length / blanks.length : 0;

    const tokens = graded.map((token, ti) => {
      if (token.type !== 'blank' || !isMiss(token)) return token;
      return {
        ...token,
        autoTag: guessTag({
          answer: token.userAnswer,
          correct: token.answer,
          prevWord: graded[ti - 1]?.word ?? '',
          nextWord: graded[ti + 1]?.word ?? '',
          isKeyWord: token.isKeyWord,
          sentenceMissRate: missRate,
          blanksInSentence: blanks.length,
        }),
      };
    });

    return { sentenceId, number: si + 1, text: sentence.text, ko: sentence.ko, keyWords: sentence.keyWords ?? [], tokens };
  });
}

export function allBlanks(results) {
  return results.flatMap((r) => r.tokens.filter((t) => t.type === 'blank'));
}

// Score is accuracy only; tags never change the score.
export function computeScore(results) {
  const blanks = allBlanks(results);
  const points = blanks.reduce((sum, b) => sum + b.points, 0);
  const total = blanks.length;
  return { points, total, correct: blanks.filter((b) => !isMiss(b)).length, percent: total ? Math.round((points / total) * 100) : 0 };
}

// The user's choice overrides the automatic guess.
export function finalTag(blank, userTags = {}) {
  return userTags[blank.blankId] ?? blank.autoTag;
}

export function summarizeTags(results, userTags = {}) {
  const counts = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
  allBlanks(results)
    .filter(isMiss)
    .forEach((b) => {
      const tag = finalTag(b, userTags);
      if (tag) counts[tag] += 1;
    });
  return counts;
}

// Category with the most misses; null when there are none.
export function mainWeakness(counts) {
  let best = null;
  CATEGORY_IDS.forEach((id) => {
    if (counts[id] > 0 && (!best || counts[id] > counts[best])) best = id;
  });
  return best;
}
