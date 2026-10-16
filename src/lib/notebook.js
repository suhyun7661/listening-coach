import { supabase } from './supabase';
import { getClip } from '../data/clips';
import { finalTag } from './errorTags';
import { isMiss } from './grading';

// Small everyday words are not worth a notebook entry (unless the miss was connected speech).
const TRIVIAL = new Set(
  'a an the to of in on at is are was were be i you he she it we they my your his her and or but do did so as by up me us no not'.split(' ')
);

// The missed words in one reviewed sentence -> notebook items.
// A missed part of a key expression saves the whole expression ("on a whim").
export function itemsFromSentence(row, clipId, userTags = {}) {
  const sentence = getClip(clipId)?.sentences.find((s) => s.id === row.sentenceId);
  const glosses = Object.fromEntries(Object.entries(sentence?.glosses ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  const seen = new Set();
  const items = [];

  row.tokens
    .filter((t) => t.type === 'blank' && isMiss(t))
    .forEach((t) => {
      const lower = t.word.toLowerCase();
      const tag = finalTag(t, userTags) ?? null;
      const key = t.isKeyWord ? (row.keyWords ?? []).find((k) => k.word.toLowerCase().split(/\s+/).includes(lower)) : null;
      const word = key ? key.word : t.answer;
      if (!key && (TRIVIAL.has(lower) || lower.length <= 2) && tag !== 'CS') return;
      if (seen.has(word.toLowerCase())) return;
      seen.add(word.toLowerCase());
      items.push({
        clip_id: clipId,
        sentence_id: row.sentenceId,
        word,
        ko: key?.ko ?? glosses[lower] ?? '',
        note: key?.note ?? '',
        tag,
      });
    });
  return items;
}

export const fromRow = (r) => ({
  id: r.id,
  word: r.word,
  ko: r.ko,
  note: r.note,
  tag: r.tag,
  clipId: r.clip_id,
  sentenceId: r.sentence_id,
  step: r.review_step,
  nextAt: r.next_review_at,
  lastAt: r.last_reviewed_at,
  createdAt: r.created_at,
});

export async function listItems() {
  const { data, error } = await supabase.from('notebook_items').select('*').order('next_review_at', { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

// Returns how many words were new (words already saved are skipped).
export async function addItems(userId, items) {
  if (!items.length) return 0;
  const { data, error } = await supabase
    .from('notebook_items')
    .upsert(items.map((i) => ({ ...i, user_id: userId })), { onConflict: 'user_id,clip_id,sentence_id,word', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  return data.length;
}

export async function saveReview(id, { step, nextAt }) {
  const { error } = await supabase
    .from('notebook_items')
    .update({ review_step: step, next_review_at: nextAt.toISOString(), last_reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function removeItem(id) {
  const { error } = await supabase.from('notebook_items').delete().eq('id', id);
  if (error) throw error;
}

// The sentence a word came from (used for fill-the-gap questions and examples).
export function sentenceFor(item) {
  return getClip(item.clipId)?.sentences.find((s) => s.id === item.sentenceId) ?? null;
}
