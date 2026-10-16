import { levenshtein, normalize, stripApostrophes } from './textUtils';

// Accepted alternatives for a correct word.
const EQUIVALENTS = {
  "i'm": ['i am'],
  "you're": ['you are'],
  "we're": ['we are'],
  "they're": ['they are'],
  "it's": ['it is'],
  "that's": ['that is'],
  "don't": ['do not'],
  "didn't": ['did not'],
  "can't": ['cannot', 'can not'],
  "won't": ['will not'],
  "isn't": ['is not'],
  gonna: ['going to'],
  wanna: ['want to'],
  gotta: ['got to'],
  okay: ['ok'],
  ok: ['okay'],
};

// status: 'correct' (1 point) | 'almost' (0.5, one-letter typo) | 'wrong' | 'empty'
export function gradeAnswer(answer, correct) {
  const a = normalize(answer);
  const c = normalize(correct);
  if (!a) return { status: 'empty', points: 0 };
  if (a === c || stripApostrophes(a) === stripApostrophes(c) || (EQUIVALENTS[c] ?? []).includes(a)) {
    return { status: 'correct', points: 1 };
  }
  if (c.length >= 5 && levenshtein(stripApostrophes(a), stripApostrophes(c)) === 1) {
    return { status: 'almost', points: 0.5 };
  }
  return { status: 'wrong', points: 0 };
}

export function isMiss(blank) {
  return blank.status === 'wrong' || blank.status === 'empty';
}
