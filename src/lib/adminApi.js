import { supabase } from './supabase';
import { rowsFromClip } from './clipStore';

// Saving clips and uploading videos. Only admins are allowed to do this: the database
// (Row Level Security and the storage rules) refuses everyone else, whatever this code does.

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const VIDEO_TYPES = ['video/mp4', 'video/webm'];

const fail = (error) => {
  throw new Error(error.message);
};

// Uploads a video file and returns its public web address.
export async function uploadVideo(clipId, file) {
  if (!VIDEO_TYPES.includes(file.type)) throw new Error('Please choose an .mp4 or .webm video.');
  if (file.size > MAX_VIDEO_BYTES) throw new Error('This video is bigger than 50 MB. Please make it smaller (a short clip of 30 to 60 seconds is usually fine).');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${clipId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('videos').upload(path, file, { contentType: file.type, upsert: false });
  if (error) fail(error);
  return supabase.storage.from('videos').getPublicUrl(path).data.publicUrl;
}

// Saves the clip and its sentences. previousSentenceIds = sentences that existed before (to remove deleted ones).
export async function saveClip(clip, previousSentenceIds = []) {
  const { clip: clipRow, sentences } = rowsFromClip(clip);

  const savedClip = await supabase.from('clips').upsert(clipRow);
  if (savedClip.error) fail(savedClip.error);

  // Two passes so that re-ordering sentences never clashes with the "one sentence per position" rule.
  const parked = await supabase
    .from('sentences')
    .upsert(sentences.map((s, i) => ({ ...s, position: 1000 + i })), { onConflict: 'clip_id,sentence_id' });
  if (parked.error) fail(parked.error);

  const keep = sentences.map((s) => s.sentence_id);
  const gone = previousSentenceIds.filter((id) => !keep.includes(id));
  if (gone.length) {
    const removed = await supabase.from('sentences').delete().eq('clip_id', clip.id).in('sentence_id', gone);
    if (removed.error) fail(removed.error);
  }

  const final = await supabase.from('sentences').upsert(sentences, { onConflict: 'clip_id,sentence_id' });
  if (final.error) fail(final.error);
}
