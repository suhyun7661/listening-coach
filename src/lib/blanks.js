import { parseToken, seededRandom, splitTokens } from './textUtils';

// Three levels. Each level up removes hints.
//   blanks:  [fewer, more, words needed for "more"] or 'half' (about half of the words)
//   meaning: 'all'      -> Korean meaning shown above every blank
//            'keyWords' -> Korean meaning only above key expressions
//            'none'     -> no Korean meaning
export const LEVEL_NAMES = { 1: 'Easy', 2: 'Intermediate', 3: 'Hard' };
export const LEVEL_RULES = {
  1: { blanks: [1, 2, 5], meaning: 'all', firstLetter: true, letterCount: true },
  2: { blanks: [3, 4, 7], meaning: 'keyWords', firstLetter: false, letterCount: true },
  3: { blanks: 'half', meaning: 'none', firstLetter: false, letterCount: false },
};

export function getLevelRule(level) {
  return LEVEL_RULES[level] ?? LEVEL_RULES[3];
}

// Short description for the page, e.g. "Korean meaning, first letter, letter count".
export function describeHints(level) {
  const rule = getLevelRule(level);
  const parts = [];
  if (rule.meaning === 'all') parts.push('Korean meaning');
  if (rule.meaning === 'keyWords') parts.push('Korean meaning for key expressions only');
  if (rule.firstLetter) parts.push('first letter');
  if (rule.letterCount) parts.push('letter count');
  return parts.length ? parts.join(', ') : 'No hints';
}

const FUNCTION_WORDS = new Set(
  'a an the on in at to of for and or but is are was were be i you he she it we they my your his her its our their me him us them this that do did does not so as by with from up out just'.split(' ')
);

// Small, fast, unstressed words (speed errors).
const SPEED_WORDS = new Set(
  'over sat sit puts put myself yourself himself herself can could would should have has had been got get then than there them him her all some just'.split(' ')
);

// Words that often blend or reduce (connected speech).
const CONNECTED_WORDS = new Set(
  "gonna wanna gotta kinda sorta lemme gimme dunno outta did going want let what don't didn't can't won't i'm you're it's that's".split(' ')
);

// Finds where each key expression sits in the sentence and maps the important words of that
// exact spot (by token index) to its Korean meaning. A word like "got" is only a key word
// where it is really part of "got a sec", not everywhere in the sentence.
const plain = (w) => w.toLowerCase().replace(/[’]/g, "'");
function keyWordMap(words, keyWords = []) {
  const map = new Map();
  keyWords.forEach((kw) => {
    const phrase = kw.word.split(/\s+/).map(plain);
    for (let i = 0; i + phrase.length <= words.length; i += 1) {
      if (phrase.every((p, j) => plain(words[i + j].word) === p)) {
        const span = words.slice(i, i + phrase.length);
        const important = span.filter((t) => !FUNCTION_WORDS.has(plain(t.word)));
        (important.length ? important : span).forEach((t) => map.set(t.index, { ko: kw.ko, phrase: kw.word }));
        break;
      }
    }
  });
  return map;
}

function priority(token, keyMap) {
  const w = token.word.toLowerCase();
  if (keyMap.has(token.index)) return 4;
  if (SPEED_WORDS.has(w)) return 3;
  if (CONNECTED_WORDS.has(w)) return 2;
  if (!FUNCTION_WORDS.has(w)) return 1;
  return 0;
}

// Returns the sentence as tokens: { type: 'text' } or { type: 'blank', hint }.
export function generateBlanks(sentence, level) {
  const rule = getLevelRule(level);
  const tokens = splitTokens(sentence.text).map((raw, index) => ({ ...parseToken(raw), raw, index }));
  const words = tokens.filter((t) => t.word);

  let target;
  if (rule.blanks === 'half') target = Math.max(1, Math.ceil(words.length / 2));
  else {
    const [fewer, more, needed] = rule.blanks;
    target = Math.min(words.length >= needed ? more : fewer, words.length);
  }

  const keyMap = keyWordMap(words, sentence.keyWords);
  const glosses = Object.fromEntries(
    Object.entries(sentence.glosses ?? {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const random = seededRandom(`${sentence.id ?? sentence.text}-${level}`);

  const chosen = new Set(
    words
      .map((t) => ({ t, p: priority(t, keyMap), r: random() }))
      .sort((a, b) => b.p - a.p || a.r - b.r)
      .slice(0, target)
      .map((x) => x.t.index)
  );

  return tokens.map((t) => {
    if (!chosen.has(t.index)) return { type: 'text', ...t };
    const lower = t.word.toLowerCase();
    const key = keyMap.get(t.index);
    let meaning = null;
    if (rule.meaning === 'all') meaning = key?.ko ?? glosses[lower] ?? null;
    if (rule.meaning === 'keyWords') meaning = key?.ko ?? null;
    return {
      type: 'blank',
      ...t,
      answer: t.word,
      isKeyWord: Boolean(key),
      hint: {
        meaning,
        firstLetter: rule.firstLetter ? t.word[0] : null,
        letterCount: rule.letterCount ? t.word.replace(/['’-]/g, '').length : null,
      },
    };
  });
}

// Placeholder text inside the blank: "w _ _ _", "_ _ _ _" or "".
export function hintPattern(hint) {
  if (!hint.letterCount) return '';
  if (hint.firstLetter) return [hint.firstLetter, ...Array(hint.letterCount - 1).fill('_')].join(' ');
  return Array(hint.letterCount).fill('_').join(' ');
}
