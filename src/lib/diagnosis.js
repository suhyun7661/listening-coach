import { isMiss } from './grading';
import { levenshtein, normalize } from './textUtils';

// Diagnosis of a sentence the learner got wrong.
// This is a rule-based analysis of the learner's ACTUAL answer compared with the correct one.
// It only SUGGESTS a category: the learner confirms or changes it, and the learner's choice is the final one.
// It never claims to know what the learner heard; the wording is always cautious ("may have").

export const CATEGORIES = [
  { id: 'CS', label: 'Connected Speech', ko: '연음·축약', description: 'Words were linked or reduced in natural speech.' },
  { id: 'SP', label: 'Speed', ko: '속도', description: "Couldn't keep up with how fast the speaker talked." },
  { id: 'UE', label: 'Unfamiliar Expression', ko: '낯선 표현', description: "Didn't know the expression as a whole." },
  { id: 'V', label: 'Vocabulary', ko: '어휘', description: "Didn't know or recognize the word." },
  { id: 'AC', label: 'Accent', ko: '억양·발음', description: "The speaker's accent made the word hard to hear." },
  { id: 'MI', label: 'Main Idea', ko: '전체 의미 놓침', description: 'Lost the overall meaning of what was said.' },
  { id: 'OT', label: 'Other', ko: '기타', description: 'Another reason, or not clear from the answer.' },
];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

const FUNCTION_WORDS = new Set(
  'a an the on in at to of for and or but is are was were be am i you he she it we they my your his her its our their me him us them this that these those do did does not so as by with from up out just then now good if what who how why when there here too very will would can could should have has had been get got let go going say says'.split(' ')
);
// Reduced spellings a learner writes when they hear connected speech.
const REDUCTIONS = new Set(['gonna', 'wanna', 'gotta', 'hafta', 'kinda', 'sorta', 'outta', 'lotta', 'lemme', 'gimme', 'dunno', 'didja', 'dija', 'didya', 'whaddya', 'ya', 'cha']);
const COLLOQUIAL = new Set(['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'lemme', 'gimme', 'dunno', 'outta']);

const squash = (s) => s.replace(/[ ']/g, '');
const quote = (s) => `“${s}”`;

// One missed blank (a word or a whole expression) -> { tag, kind } from the evidence in the answer.
// kind: empty | merged | reduced | cutshort | partial | different | similar | unclear
export function diagnoseMiss(blank) {
  const a = normalize(blank.userAnswer ?? '');
  const c = normalize(blank.answer);
  const isExpression = Boolean(blank.isKeyWord);
  const isGroup = c.includes(' ');

  if (!a) return { tag: isExpression ? 'UE' : 'SP', kind: 'empty' };

  // Connected speech needs evidence IN the answer: words stuck together or split, a reduced spelling, or a word cut short.
  if (a.split(' ').some((w) => REDUCTIONS.has(w)) && !REDUCTIONS.has(c)) return { tag: 'CS', kind: 'reduced' };
  if (squash(a) === squash(c)) return { tag: 'CS', kind: 'merged' };
  if (!isGroup && a.length >= 3 && c.length - a.length >= 2 && c.startsWith(a)) return { tag: 'CS', kind: 'cutshort' };

  if (isGroup) {
    const heard = a.split(' ').filter((w) => c.split(' ').includes(w)).length;
    return { tag: 'UE', kind: heard > 0 ? 'partial' : 'different' };
  }

  const sim = 1 - levenshtein(squash(a), squash(c)) / Math.max(squash(a).length, squash(c).length);
  const weak = FUNCTION_WORDS.has(c) || COLLOQUIAL.has(c);
  if (COLLOQUIAL.has(c)) return { tag: 'CS', kind: 'reduced-target' };
  if (weak) return { tag: sim >= 0.5 ? 'CS' : 'OT', kind: sim >= 0.5 ? 'similar' : 'unclear' };
  return { tag: 'V', kind: sim >= 0.5 ? 'similar' : 'different' };
}

const PRIORITY = ['UE', 'CS', 'V', 'SP', 'OT', 'AC', 'MI'];

// A whole sentence -> one suggested category.
export function diagnoseSentence(row) {
  const blanks = row.tokens.filter((t) => t.type === 'blank');
  const misses = blanks.filter(isMiss);
  if (!misses.length) return null;
  const items = misses.map((m) => ({ blankId: m.blankId, ...diagnoseMiss(m) }));

  // Most of a longer sentence missed: probably lost the thread.
  if (blanks.length >= 3 && misses.length / blanks.length >= 0.6) return { tag: 'MI', items };

  const counts = {};
  items.forEach((i) => { counts[i.tag] = (counts[i.tag] ?? 0) + 1; });
  const tag = Object.keys(counts).sort((x, y) => counts[y] - counts[x] || PRIORITY.indexOf(x) - PRIORITY.indexOf(y))[0];
  return { tag, items };
}

export const suggestedTag = (row) => row.autoTag ?? diagnoseSentence(row)?.tag ?? 'OT';

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
    case 'UE':
      return {
        why: `The expression ${word} may be unfamiliar${meaning ? ` (it means ${quote(meaning)})` : ''}. ${typed ? `You wrote ${typed}, so you may have caught only some of it.` : 'You left it empty.'}`,
        listen: `Learn ${word} as one chunk, not word by word. Listen for its rhythm, then say it aloud and try to use it in a sentence of your own.`,
        focus: `The whole expression as one chunk: ${word}.`,
      };
    case 'V':
      return {
        why: `${word} may be a word you do not know well yet${typed ? `: you wrote ${typed}` : ''}.`,
        listen: `Look up ${word} and say it aloud. Notice which syllable is stressed, then replay the sentence and listen for it.`,
        focus: `The sound and stress of ${word}.`,
      };
    case 'AC':
      return {
        why: `The speaker's accent or way of saying ${word} may have sounded different from what you expected. We cannot tell this for sure from your answer.`,
        listen: `Compare the way you say ${word} with the way the speaker says it. Listen for differences in vowels, stress and rhythm.`,
        focus: `Vowel sounds and rhythm in ${word}.`,
      };
    case 'MI':
      return {
        why: 'You missed most of the blanks in this sentence, so you may have lost the thread of what was being said.',
        listen: `Before writing anything, listen for the main point: who is talking about what? Check yourself with the Korean meaning: ${row.ko ? quote(row.ko) : 'see above'}.`,
        focus: 'The main point first, the details second.',
      };
    default:
      return {
        why: `It is not clear from your answer why ${word} was missed. It could be a mix of reasons.`,
        listen: 'Replay the sentence and compare what you heard with the correct sentence, one word at a time.',
        focus: 'One word at a time.',
      };
  }
}
