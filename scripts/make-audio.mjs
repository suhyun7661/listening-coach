// Makes US and UK audio for every sentence, key expression and word in src/data/clips.
//
//   npm run make:audio -- --dry-run   shows what would be made (costs nothing, needs no key)
//   npm run make:audio                asks Google Cloud Text-to-Speech and saves MP3 files
//
// Files go to the generated-audio folder. Files that already exist are skipped, so it is
// safe to run again. The Google key is read from .env (GOOGLE_TTS_API_KEY) and never printed.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { clips } from '../src/data/clips/index.js';
import { parseToken, splitTokens } from '../src/lib/textUtils.js';
import { sentenceFile, wordFile } from '../src/lib/slug.js';

const OUT = 'generated-audio';
const VOICES = {
  US: { languageCode: 'en-US', name: process.env.TTS_VOICE_US || 'en-US-Neural2-F' },
  UK: { languageCode: 'en-GB', name: process.env.TTS_VOICE_UK || 'en-GB-Neural2-A' },
};
const dryRun = process.argv.includes('--dry-run');

// What to say, and what to call the file (per accent).
const jobs = [];
const seenWords = new Set();
const addWord = (text) => {
  const key = text.toLowerCase();
  if (!key || seenWords.has(key)) return;
  seenWords.add(key);
  for (const accent of ['US', 'UK']) jobs.push({ accent, text: key, file: wordFile(key, accent) });
};

for (const clip of clips) {
  for (const s of clip.sentences) {
    for (const accent of ['US', 'UK']) jobs.push({ accent, text: s.text, file: sentenceFile(clip.id, s.id, accent) });
    (s.keyWords ?? []).forEach((k) => addWord(k.word));
    splitTokens(s.text).forEach((raw) => addWord(parseToken(raw).word));
  }
}

const chars = jobs.reduce((n, j) => n + j.text.length, 0);
const todo = jobs.filter((j) => !existsSync(`${OUT}/${j.file}`));
console.log(`${jobs.length} audio files in total (${chars} characters). ${jobs.length - todo.length} already made, ${todo.length} to make.`);
console.log(`Voices: US = ${VOICES.US.name}, UK = ${VOICES.UK.name}`);

if (dryRun || todo.length === 0) process.exit(0);

try {
  process.loadEnvFile('.env');
} catch {
  console.error('Could not read the .env file.');
  process.exit(1);
}
const key = process.env.GOOGLE_TTS_API_KEY;
if (!key) {
  console.error('GOOGLE_TTS_API_KEY is missing in .env. Add a line: GOOGLE_TTS_API_KEY=your-key');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

async function synthesize(job) {
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: job.text },
      voice: VOICES[job.accent],
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${body.error?.message ?? 'unknown error'}`);
  writeFileSync(`${OUT}/${job.file}`, Buffer.from(body.audioContent, 'base64'));
}

let made = 0;
let failed = 0;
const queue = [...todo];
async function worker() {
  while (queue.length && failed < 3) {
    const job = queue.shift();
    try {
      await synthesize(job);
      made += 1;
      if (made % 25 === 0) console.log(`  ${made} / ${todo.length}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed: ${job.file} -> ${error.message.replace(key, '***')}`);
    }
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);

console.log(failed >= 3 ? `Stopped after repeated errors. Made ${made} files.` : `Done. Made ${made} files in the ${OUT} folder.`);
process.exit(failed >= 3 ? 1 : 0);
