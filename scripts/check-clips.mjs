// Run with: npm run check:clips
// Checks that every clip follows the data format from CLAUDE.md.
import { clips } from '../src/data/clips/index.js';

const errors = [];
const fail = (clip, msg) => errors.push(`${clip.id}: ${msg}`);
const words = (t) => t.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);

for (const clip of clips) {
  for (const f of ['id', 'source', 'videoId', 'title', 'accent', 'difficulty', 'contextKo']) {
    if (!clip[f]) fail(clip, `missing ${f}`);
  }
  if (!['youtube', 'file'].includes(clip.source)) fail(clip, 'source must be youtube or file');
  if (!['US', 'UK'].includes(clip.accent)) fail(clip, 'accent must be US or UK');
  if (!(clip.difficulty >= 1 && clip.difficulty <= 6)) fail(clip, 'difficulty must be 1-6');

  let prevEnd = 0;
  const ids = new Set();
  for (const s of clip.sentences) {
    const where = `sentence ${s.id}`;
    if (ids.has(s.id)) fail(clip, `${where} duplicated`);
    ids.add(s.id);
    if (!s.text || !s.ko) fail(clip, `${where} needs text and ko`);
    if (!(s.start < s.end)) fail(clip, `${where} start must be before end`);
    if (s.start < prevEnd) fail(clip, `${where} overlaps the previous sentence`);
    prevEnd = s.end;

    const sentenceWords = words(s.text);
    const joined = ` ${sentenceWords.join(' ')} `;
    for (const kw of s.keyWords ?? []) {
      if (!kw.ko || !kw.note) fail(clip, `${where} key word "${kw.word}" needs ko and note`);
      if (!joined.includes(` ${words(kw.word).join(' ')} `)) fail(clip, `${where} key word "${kw.word}" not found in the text`);
    }
    for (const g of Object.keys(s.glosses ?? {})) {
      if (!sentenceWords.includes(g.toLowerCase())) fail(clip, `${where} gloss "${g}" not found in the text`);
    }
  }
}

if (errors.length) {
  console.error(`Found ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const total = clips.reduce((n, c) => n + c.sentences.length, 0);
console.log(`OK: ${clips.length} clips, ${total} sentences.`);
