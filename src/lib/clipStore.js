import { supabase } from './supabase';
import { clips as sampleClips } from '../data/clips';
import { sentenceFile } from './slug';

// Where the app gets its clips from. The clips live in the Supabase database (so clips you add
// in the Admin page show up). The sample clips in src/data/clips are only a fallback for when the
// database cannot be reached.
let store = sampleClips;

export const getClips = () => store;
export const getClip = (id) => store.find((c) => c.id === id);

// database rows -> the clip format used everywhere in the app
export function clipFromRows(row, sentenceRows = []) {
  return {
    id: row.id,
    source: row.source,
    videoId: row.video_id,
    title: row.title,
    accent: row.accent,
    difficulty: row.difficulty,
    contextKo: row.context_ko,
    published: row.published,
    sentences: [...sentenceRows]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        id: s.sentence_id,
        start: Number(s.start_time),
        end: Number(s.end_time),
        text: s.text,
        ko: s.ko,
        keyWords: s.key_words ?? [],
        glosses: s.glosses ?? {},
        ttsAudio: { US: `audio/${sentenceFile(row.id, s.sentence_id, 'US')}`, UK: `audio/${sentenceFile(row.id, s.sentence_id, 'UK')}` },
      })),
  };
}

// The other direction: a clip -> rows to save
export function rowsFromClip(clip) {
  return {
    clip: {
      id: clip.id,
      source: clip.source,
      video_id: clip.videoId,
      title: clip.title,
      accent: clip.accent,
      difficulty: clip.difficulty,
      context_ko: clip.contextKo,
      published: clip.published ?? true,
    },
    sentences: clip.sentences.map((s, i) => ({
      clip_id: clip.id,
      sentence_id: s.id,
      position: i + 1,
      start_time: s.start,
      end_time: s.end,
      text: s.text,
      ko: s.ko,
      key_words: s.keyWords ?? [],
      glosses: s.glosses ?? {},
      tts_audio: s.ttsAudio ?? {},
    })),
  };
}

// Reloads the clips from the database. Returns true if it worked.
export async function refreshClips() {
  if (!supabase) return false;
  const { data, error } = await supabase.from('clips').select('*, sentences(*)').order('created_at', { ascending: true });
  if (error || !data) return false;
  store = data.map((row) => clipFromRows(row, row.sentences)).filter((c) => c.sentences.length > 0);
  return true;
}
