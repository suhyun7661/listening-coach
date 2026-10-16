// Turns a word or phrase into a safe file name: "on a whim" -> "on-a-whim", "didn't" -> "didnt".
// The audio script and the website both use this, so they always agree on file names.
export const wordSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// File names inside the Supabase "audio" bucket.
export const wordFile = (word, accent) => `word-${wordSlug(word)}-${accent.toLowerCase()}.mp3`;
export const sentenceFile = (clipId, sentenceId, accent) => `${clipId}-${sentenceId}-${accent.toLowerCase()}.mp3`;
