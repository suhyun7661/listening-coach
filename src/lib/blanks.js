import { parseToken, seededRandom, splitTokens } from './textUtils';

// Three levels.
//   Easy:         one blank per word (1-2 blanks), Korean meaning + first letter + letter count.
//   Intermediate: every key expression is ONE group of blanks (one box per word, each as long as its word),
//                 plus a few "listening" words (gonna, wanna, hand-picked hard-to-catch words).
//                 Korean meaning above the group, "3 words · 15 letters" below. No first letters.
//   Hard:         the same groups and more single words (up to 6 blanks), the boxes keep their real length,
//                 but there are no hints at all.
// A group is graded and scored as ONE item, however many words it has.
export const LEVEL_NAMES = { 1: 'Easy', 2: 'Intermediate', 3: 'Hard' };
export const LEVEL_RULES = {
  1: { mode: 'words', blanks: [1, 2, 5], meaning: 'all', firstLetter: true, letterCount: true },
  2: { mode: 'groups', meaning: true, counts: true },
  3: { mode: 'groups', meaning: false, counts: false, maxBlanks: 6 },
};

export function getLevelRule(level) {
  return LEVEL_RULES[level] ?? LEVEL_RULES[3];
}

// Short description for the page.
export function describeHints(level) {
  const rule = getLevelRule(level);
  if (rule.mode === 'words') return 'Korean meaning, first letter, letter count';
  if (rule.counts) return 'Korean meaning for expressions, word and letter count';
  return 'No hints';
}

export const FUNCTION_WORDS = new Set(
  'a an the on in at to of for and or but is are was were be am i you he she it we they my your his her its our their me him us them this that these those do did does not so as by with from up out just then now good if what who how why when there here too very will would can could should have has had been get got let go going say says'.split(' ')
);
const SPEED_WORDS = new Set(
  'over sat sit puts put myself yourself himself herself can could would should have has had been got get then than there them him her all some just'.split(' ')
);
const CONNECTED_WORDS = new Set(
  "gonna wanna gotta kinda sorta lemme gimme dunno outta did going want let what don't didn't can't won't i'm you're it's that's".split(' ')
);
// Colloquial reductions: always worth a blank in Intermediate and Hard.
export const COLLOQUIAL = new Set(['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'lemme', 'gimme', 'dunno', 'outta']);
const PROPER_NOUNS = new Set(['ryan', "henderson's", 'friday']);
export const CONTRACTION = /['’](s|m|re|ve|d|ll)$|n['’]t$/i;

const plain = (w) => w.toLowerCase().replace(/[’]/g, "'");
const letterCount = (w) => w.replace(/['’-]/g, '').length;

// Where each key expression sits in the sentence (token indexes of its words).
function expressionSpans(words, keyWords = []) {
  const spans = [];
  keyWords.forEach((kw) => {
    const phrase = kw.word.split(/\s+/).map(plain);
    for (let i = 0; i + phrase.length <= words.length; i += 1) {
      if (phrase.every((p, j) => plain(words[i + j].word) === p)) {
        spans.push({ from: i, to: i + phrase.length - 1, ko: kw.ko });
        break;
      }
    }
  });
  return spans;
}

// ---------------------------------------------------------------- Easy (one blank per word)

function keyWordMap(words, keyWords) {
  const map = new Map();
  expressionSpans(words, keyWords).forEach((sp) => {
    const span = words.slice(sp.from, sp.to + 1);
    const important = span.filter((t) => !FUNCTION_WORDS.has(plain(t.word)));
    const phrase = span.map((t) => t.word).join(' ');
    (important.length ? important : span).forEach((t) => map.set(t.index, { ko: sp.ko, phrase }));
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

function easyBlanks(sentence, tokens, words, rule, level) {
  const [fewer, more, needed] = rule.blanks;
  const target = Math.min(words.length >= needed ? more : fewer, words.length);
  const keyMap = keyWordMap(words, sentence.keyWords);
  const glosses = Object.fromEntries(Object.entries(sentence.glosses ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
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
    const key = keyMap.get(t.index);
    return {
      type: 'blank',
      ...t,
      answer: t.word,
      isKeyWord: Boolean(key),
      hint: {
        meaning: key?.ko ?? glosses[t.word.toLowerCase()] ?? null,
        firstLetter: t.word[0],
        letterCount: letterCount(t.word),
      },
    };
  });
}

// ---------------------------------------------------------------- Intermediate and Hard (groups)

function groupBlanks(sentence, tokens, words, rule) {
  const spans = expressionSpans(words, sentence.keyWords);
  const inGroup = new Set();
  spans.forEach((sp) => { for (let k = sp.from; k <= sp.to; k += 1) inGroup.add(k); });

  const listen = new Set((sentence.listenWords ?? []).map(plain));
  const isPriority = (w) => COLLOQUIAL.has(plain(w.word)) || listen.has(plain(w.word));

  // Single words that get their own blank (positions in `words`).
  const extras = [];
  words.forEach((w, k) => { if (!inGroup.has(k) && isPriority(w)) extras.push(k); });

  if (rule.maxBlanks) {
    // Hard: top up with the longest content words, never right next to another blank, up to the limit.
    const target = Math.min(rule.maxBlanks, Math.max(Math.ceil(words.length / 2), spans.length + 2));
    const taken = new Set([...inGroup, ...extras]);
    const candidates = words
      .map((w, k) => ({ w, k }))
      .filter(({ w, k }) => !taken.has(k) && !FUNCTION_WORDS.has(plain(w.word)) && !PROPER_NOUNS.has(plain(w.word)) && !CONTRACTION.test(w.word))
      .sort((a, b) => b.w.word.length - a.w.word.length || a.k - b.k);
    candidates.forEach(({ k }) => {
      if (spans.length + extras.length >= Math.max(1, target)) return;
      if (taken.has(k - 1) || taken.has(k + 1)) return;
      extras.push(k);
      taken.add(k);
    });
  }

  const units = [
    ...spans.map((sp) => ({ from: sp.from, to: sp.to, ko: sp.ko, expression: true })),
    ...extras.map((k) => ({ from: k, to: k, ko: null, expression: false })),
  ].sort((a, b) => a.from - b.from);

  const unitAt = new Map(units.map((u) => [words[u.from].index, u]));
  const skip = new Set();
  units.forEach((u) => { for (let k = u.from + 1; k <= u.to; k += 1) skip.add(words[k].index); });

  const out = [];
  tokens.forEach((t) => {
    if (skip.has(t.index)) return;
    const u = unitAt.get(t.index);
    if (!u) { out.push({ type: 'text', ...t }); return; }
    const parts = words.slice(u.from, u.to + 1).map((w) => ({ word: w.word, letters: letterCount(w.word) }));
    const total = parts.reduce((sum, p) => sum + p.letters, 0);
    const last = words[u.to];
    const phrase = parts.map((p) => p.word).join(' ');
    out.push({
      type: 'blank',
      ...t,
      word: phrase,
      after: last.after,
      answer: phrase,
      parts,
      isKeyWord: u.expression,
      hint: {
        meaning: rule.meaning ? u.ko : null,
        firstLetter: null,
        letterCount: rule.counts ? total : null,
        wordCount: rule.counts ? parts.length : null,
      },
    });
  });
  return out;
}

// Returns the sentence as tokens: { type: 'text' } or { type: 'blank', hint, parts? }.
export function generateBlanks(sentence, level) {
  const rule = getLevelRule(level);
  const tokens = splitTokens(sentence.text).map((raw, index) => ({ ...parseToken(raw), raw, index }));
  const words = tokens.filter((t) => t.word);
  return rule.mode === 'words' ? easyBlanks(sentence, tokens, words, rule, level) : groupBlanks(sentence, tokens, words, rule);
}

// Placeholder text inside an Easy blank: "w _ _ _".
export function hintPattern(hint) {
  if (!hint.letterCount || !hint.firstLetter) return '';
  return [hint.firstLetter, ...Array(hint.letterCount - 1).fill('_')].join(' ');
}

// Caption under an Intermediate blank: "3 words · 15 letters" or "5 letters".
export function hintCaption(hint) {
  if (!hint.letterCount) return '';
  const letters = `${hint.letterCount} letters`;
  return hint.wordCount > 1 ? `${hint.wordCount} words · ${letters}` : letters;
}
