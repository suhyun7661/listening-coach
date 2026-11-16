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

// "you're kidding me" and "you are kidding me" are the same expression.
const EXPANSIONS = {
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "it's": 'it is',
  "that's": 'that is', "he's": 'he is', "she's": 'she is', "who's": 'who is', "what's": 'what is',
  "i've": 'i have', "you've": 'you have', "we've": 'we have', "i'd": 'i would', "you'd": 'you would',
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "won't": 'will not', "can't": 'cannot',
  "let's": 'let us', gonna: 'going to', wanna: 'want to', gotta: 'got to',
};
const expand = (s) => s.split(' ').map((w) => EXPANSIONS[w] ?? w).join(' ');

// status: 'correct' | 'almost' (one-letter typo: counts as correct, but we say "check spelling") | 'wrong' | 'empty'
export function gradeAnswer(answer, correct) {
  const a = normalize(answer);
  const c = normalize(correct);
  if (!a) return { status: 'empty', points: 0 };
  if (a === c || stripApostrophes(a) === stripApostrophes(c) || (EQUIVALENTS[c] ?? []).includes(a) || expand(a) === expand(c)) {
    return { status: 'correct', points: 1 };
  }
  if (c.length >= 5 && levenshtein(stripApostrophes(a), stripApostrophes(c)) === 1) {
    return { status: 'almost', points: 1 };
  }
  return { status: 'wrong', points: 0 };
}

export function isMiss(blank) {
  return blank.status === 'wrong' || blank.status === 'empty';
}
