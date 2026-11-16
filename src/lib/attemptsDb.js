import { supabase } from './supabase';
import { generateBlanks } from './blanks';
import { getClip } from './clipStore';

// The database stores one row per attempt plus one row per blank (with autoTag and userTag).
// The sentence text and Korean are not stored again: the blanks are rebuilt from the clip,
// and the seeded random makes sure they are exactly the same blanks as when you played.

const isMiss = (b) => b.status === 'wrong' || b.status === 'empty';

// results (from the grader) -> rows for the blank_results table
export function rowsFromResults(results) {
  return results.flatMap((r) =>
    r.tokens
      .filter((t) => t.type === 'blank')
      .map((t, i) => ({
        sentence_id: r.sentenceId,
        blank_index: i,
        answer: t.answer,
        user_answer: t.userAnswer ?? '',
        status: t.status,
        points: t.points,
        auto_tag: isMiss(t) ? t.autoTag ?? null : null,
        user_tag: null,
      }))
  );
}

// Finds which database row a blank belongs to (sentence id + position among the blanks).
export function locateBlank(results, blankId) {
  for (const r of results) {
    const blanks = r.tokens.filter((t) => t.type === 'blank');
    const i = blanks.findIndex((b) => b.blankId === blankId);
    if (i !== -1) return { sentence_id: r.sentenceId, blank_index: i };
  }
  return null;
}

// attempts row (+ its blank_results) -> the same shape the Review page uses
export function rebuildAttempt(row) {
  const clip = getClip(row.clip_id);
  if (!clip) return null;
  const saved = {};
  (row.blank_results ?? []).forEach((b) => {
    (saved[b.sentence_id] ??= {})[b.blank_index] = b;
  });
  const userTags = {};
  const results = clip.sentences.map((s, si) => {
    let n = 0;
    const tokens = generateBlanks(s, row.level).map((t) => {
      if (t.type !== 'blank') return t;
      const b = saved[s.id]?.[n];
      n += 1;
      const blankId = `${s.id}-${t.index}`;
      if (!b) return { ...t, blankId, userAnswer: '', status: 'empty', points: 0 };
      if (b.user_tag) userTags[blankId] = b.user_tag;
      return {
        ...t,
        blankId,
        userAnswer: b.user_answer,
        status: b.status,
        points: Number(b.points),
        autoTag: b.auto_tag ?? undefined,
      };
    });
    return { sentenceId: s.id, number: si + 1, text: s.text, ko: s.ko, keyWords: s.keyWords ?? [], tokens };
  });
  return {
    id: row.id,
    clipId: row.clip_id,
    title: clip.title,
    level: row.level,
    replays: row.replays ?? {},
    createdAt: row.created_at,
    results,
    userTags,
    where: 'account',
  };
}

export async function dbSaveAttempt({ clipId, level, results, replays = {} }) {
  const rows = rowsFromResults(results);
  const points = rows.reduce((sum, r) => sum + Number(r.points), 0);
  const total = rows.length;

  const { data, error } = await supabase
    .from('attempts')
    .insert({ clip_id: clipId, level, replays, points, total_blanks: total, percent: total ? Math.round((points / total) * 100) : 0 })
    .select('id')
    .single();
  if (error) throw error;

  const { error: blanksError } = await supabase.from('blank_results').insert(rows.map((r) => ({ ...r, attempt_id: data.id })));
  if (blanksError) {
    await supabase.from('attempts').delete().eq('id', data.id); // never keep half a report
    throw blanksError;
  }
  return data.id;
}

export async function dbGetAttempt(id) {
  let query = supabase.from('attempts').select('*, blank_results(*)');
  query = id ? query.eq('id', id) : query.order('created_at', { ascending: false }).limit(1);
  const { data, error } = await query;
  if (error) throw error;
  return data[0] ? rebuildAttempt(data[0]) : null;
}

export async function dbSetUserTag(attemptId, results, blankId, tag) {
  const where = locateBlank(results, blankId);
  if (!where) return;
  const { error } = await supabase
    .from('blank_results')
    .update({ user_tag: tag })
    .eq('attempt_id', attemptId)
    .eq('sentence_id', where.sentence_id)
    .eq('blank_index', where.blank_index);
  if (error) throw error;
}
