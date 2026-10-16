import { sentenceFile, wordFile } from './slug';
import { speak } from './speech';

// Recordings live in the public "audio" bucket of Supabase Storage.
const base = import.meta.env.VITE_SUPABASE_URL;
export const audioUrl = (file) => (base ? `${base}/storage/v1/object/public/audio/${file}` : null);

let current = null;

// Resolves true if the file started playing, false if it is missing or cannot play.
function playUrl(url) {
  return new Promise((resolve) => {
    current?.pause();
    const audio = new Audio(url);
    current = audio;
    audio.addEventListener('error', () => resolve(false), { once: true });
    audio.play().then(() => resolve(true), () => resolve(false));
  });
}

// Plays the real US/UK recording. If the file is not there yet, it falls back to a voice
// already on the computer (if there is one) and reports which one was used.
async function play(file, text, accent) {
  const url = audioUrl(file);
  if (url && (await playUrl(url))) return { ok: true, source: 'recording' };
  const ok = await speak(text, accent);
  return { ok, source: ok ? 'voice' : null };
}

export const playWord = (word, accent) => play(wordFile(word, accent), word, accent);
export const playSentence = (clipId, sentence, accent) => play(sentenceFile(clipId, sentence.id, accent), sentence.text, accent);

// A short message for the page after a play attempt (empty when everything is fine).
export function playMessage(result, accent) {
  if (!result.ok) return `The ${accent} audio is not available yet. Check that the audio files were uploaded to Supabase Storage.`;
  if (result.source === 'voice') return `Playing with this computer's own voice because the ${accent} recording was not found. It may not sound like ${accent} English.`;
  return '';
}
