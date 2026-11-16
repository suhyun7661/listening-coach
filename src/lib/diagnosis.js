import { COLLOQUIAL, FUNCTION_WORDS } from './blanks';
import { isMiss } from './grading';
import { levenshtein, normalize } from './textUtils';

// Diagnosis of a sentence the learner got wrong.
// This is a rule-based analysis of the learner's ACTUAL answer compared with the correct one.
//   - A mistaken sentence gets ONE primary cause at most (never several).
//   - The app only RECOMMENDS a category when the answer gives real evidence. Otherwise it says "unclear"
//     (tag = null) and never falls back to Speed or any other category.
//   - Speed is NOT guessed from empty or missing answers: how many boxes were left empty says nothing about
//     delivery speed. Nothing in a typed answer reliably shows a speed problem, so for now the learner chooses
//     Speed by hand. To add a real speed signal later, return { tag: 'SP' } from diagnoseMiss.
//   - A recommendation is never a confirmed diagnosis: only the learner's choice (userTag) is final.
// The wording is always cautious ("may have").
//
// Three categories. (The app has one accent, an unfamiliar expression counts as Vocabulary,
// and "main idea" is not a diagnosis because the dictation works word by word.)

export const CATEGORIES = [
  { id: 'CS', label: 'Connected Speech', ko: '연음·축약', description: 'Words were linked or reduced in natural speech.' },
  { id: 'SP', label: 'Speed', ko: '속도', description: "Couldn't keep up with how fast the speaker talked." },
  { id: 'V', label: 'Vocabulary', ko: '어휘·표현', description: "Didn't know the word or expression." },
];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

// Categories saved by earlier versions are mapped safely: an unfamiliar expression is Vocabulary;
// Accent, Other and Main Idea no longer exist, so they become "not confirmed" and the learner chooses again.
const LEGACY = { UE: 'V' };
export function cleanTag(tag) {
  if (!tag) return undefined;
  const mapped = LEGACY[tag] ?? tag;
  return CATEGORY_IDS.includes(mapped) ? mapped : undefined;
}

// Reduced spellings a learner writes when they hear connected speech.
const REDUCTIONS = new Set(['gonna', 'wanna', 'gotta', 'hafta', 'kinda', 'sorta', 'outta', 'lotta', 'lemme', 'gimme', 'dunno', 'didja', 'dija', 'didya', 'whaddya', 'ya', 'cha']);

const squash = (s) => s.replace(/[ ']/g, '');
const quote = (s) => `“${s}”`;

// One missed blank (a word or a whole expression) -> { tag, kind }.
// tag is a category ONLY when the answer shows evidence; otherwise null (unclear).
// kind: empty | merged | reduced | cutshort | partial | different | similar | unclear
export function diagnoseMiss(blank) {
  const a = normalize(blank.userAnswer ?? '');
  const c = normalize(blank.answer);
  const isGroup = c.includes(' ');

  // Nothing typed: it could be speed, a missing word or anything else. Not evidence by itself.
  if (!a) return { tag: null, kind: 'empty' };

  // Connected speech needs evidence IN the answer: words stuck together or split, a reduced spelling, or a word cut short.
  if (a.split(' ').some((w) => REDUCTIONS.has(w)) && !REDUCTIONS.has(c)) return { tag: 'CS', kind: 'reduced' };
  if (squash(a) === squash(c)) return { tag: 'CS', kind: 'merged' };
  if (!isGroup && a.length >= 3 && c.length - a.length >= 2 && c.startsWith(a)) return { tag: 'CS', kind: 'cutshort' };

  if (isGroup) {
    const heard = a.split(' ').filter((w) => c.split(' ').includes(w)).length;
    return { tag: 'V', kind: heard > 0 ? 'partial' : 'different' };
  }

  const sim = 1 - levenshtein(squash(a), squash(c)) / Math.max(squash(a).length, squash(c).length);
  if (COLLOQUIAL.has(c)) return { tag: 'CS', kind: 'reduced-target' };
  if (FUNCTION_WORDS.has(c)) return sim >= 0.5 ? { tag: 'CS', kind: 'similar' } : { tag: null, kind: 'unclear' };
  return { tag: 'V', kind: sim >= 0.5 ? 'similar' : 'different' };
}

const PRIORITY = ['CS', 'V', 'SP'];

const REASONS = {
  CS: (m) => `You wrote ${quote(m.userAnswer.trim() || m.answer)} for ${quote(m.answer)}, which looks like words that were linked or reduced in fast speech.`,
  V: (m) => `${quote(m.answer)} may be a word or expression you are not familiar with yet.`,
  SP: () => 'The speed of the delivery may have kept you from processing this part.',
};

// A whole sentence -> { tag, reason, items }. tag is null when there is not enough evidence ("unclear").
// Only ONE primary category is ever returned.
export function diagnoseSentence(row) {
  const misses = row.tokens.filter((t) => t.type === 'blank' && isMiss(t));
  if (!misses.length) return null;
  const items = misses.map((m) => ({ blankId: m.blankId, ...diagnoseMiss(m) }));

  const counts = {};
  items.forEach((i) => { if (i.tag) counts[i.tag] = (counts[i.tag] ?? 0) + 1; });

  const tags = Object.keys(counts);
  if (!tags.length) return { tag: null, reason: '', items };
  const tag = tags.sort((x, y) => counts[y] - counts[x] || PRIORITY.indexOf(x) - PRIORITY.indexOf(y))[0];
  const example = misses.find((m) => items.find((i) => i.blankId === m.blankId)?.tag === tag) ?? misses[0];
  return { tag, reason: REASONS[tag](example), items };
}

// The recommended category (never confirmed), or null when the evidence is not enough.
export const suggestedTag = (row) => diagnoseSentence(row)?.tag ?? null;
export const suggestedReason = (row) => diagnoseSentence(row)?.reason ?? '';

// ---------------------------------------------------------------- Listening Guidance
// Always built for the category that is selected NOW, so it changes the moment the learner picks another one.

function pickMiss(row, tag) {
  const misses = row.tokens.filter((t) => t.type === 'blank' && isMiss(t));
  const diag = diagnoseSentence(row);
  const byTag = misses.find((m) => diag?.items.find((i) => i.blankId === m.blankId)?.tag === tag);
  return byTag ?? misses[0];
}

export function guidance(tag, row) {
  const m = pickMiss(row, tag);
  const word = m ? quote(m.answer) : 'this part';
  const typed = m?.userAnswer?.trim() ? quote(m.userAnswer.trim()) : '';
  const kind = m ? diagnoseMiss(m).kind : 'unclear';
  const expression = Boolean(m?.isKeyWord);
  const meaning = row.keyWords.find((k) => normalize(k.word) === normalize(m?.answer ?? ''))?.ko;
  const missed = row.tokens.filter((t) => t.type === 'blank' && isMiss(t)).map((t) => quote(t.answer)).join(', ');

  switch (tag) {
    case 'CS':
      return {
        why: kind === 'merged' ? `Your answer ${typed} has the words of ${word} put together differently. You may have heard linked words as one chunk.`
          : kind === 'cutshort' ? `You wrote ${typed}, which looks like the first part of ${word}. The ending may have been shortened or blurred when the speaker said it.`
          : kind === 'reduced' ? `You wrote the reduced form ${typed}. The speaker may have blended these words, so the written form can be hard to match.`
          : `In natural speech, ${word} can be linked to its neighbors or shortened, so it may not sound like the written word. This may be what happened here.`,
        listen: `Replay and listen to how ${word} connects to the word before and after it. Notice sounds that disappear, change or blend, and where one word seems to end and the next begins.`,
        focus: 'Where one word ends and the next begins.',
      };
    case 'SP':
      return {
        why: typed ? `You may have caught only part of ${word}, because the speaker moves quickly here.`
          : `You left ${word} empty. Small words can go by very fast in natural speech, so you may not have had time to catch it.`,
        listen: `First listen to the whole sentence without writing. Then replay it and look for the small, fast words (${missed || word}). Try repeating the sentence aloud at the speaker's pace.`,
        focus: 'Small, fast words at normal speed.',
      };
    default: // V
      return expression
        ? {
            why: `The expression ${word} may be new to you${meaning ? ` (it means ${quote(meaning)})` : ''}. ${typed ? `You wrote ${typed}, so you may have caught only some of it.` : 'You left it empty.'}`,
            listen: `Learn ${word} as one chunk, not word by word. Listen for its rhythm, then say it aloud and try to use it in a sentence of your own.`,
            focus: `The whole expression as one chunk: ${word}.`,
          }
        : {
            why: `${word} may be a word you do not know well yet${typed ? `: you wrote ${typed}` : ''}.`,
            listen: `Look up ${word} and say it aloud. Notice which syllable is stressed, then replay the sentence and listen for it.`,
            focus: `The sound and stress of ${word}.`,
          };
  }
}
