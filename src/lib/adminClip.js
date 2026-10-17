// Helpers for the Admin clip editor (no screens here, so they are easy to test).

// "https://youtu.be/abc123XYZ_0", "youtube.com/watch?v=...", ".../embed/...", ".../shorts/..." or the bare id
export function parseYouTubeId(text = '') {
  const t = text.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

export function slugify(title = '') {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

// A free clip id: "my-clip-01", "my-clip-02" ...
export function suggestId(title, takenIds = []) {
  const base = slugify(title) || 'new-clip';
  for (let n = 1; n < 100; n += 1) {
    const id = `${base}-${String(n).padStart(2, '0')}`;
    if (!takenIds.includes(id)) return id;
  }
  return `${base}-${Date.now()}`;
}

// Pasted transcript -> sentences. One sentence per line; one long paragraph is split at . ! ?
export function splitTranscript(text = '') {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1 && lines[0].length > 100) {
    return lines[0].split(/(?<=[.!?])\s+/).map((l) => l.trim()).filter(Boolean);
  }
  return lines;
}

// "word: meaning" lines <-> { word: meaning }
export function parseGlosses(text = '') {
  const out = {};
  text.split(/\r?\n/).forEach((line) => {
    const i = line.indexOf(':');
    if (i < 1) return;
    const word = line.slice(0, i).trim();
    const meaning = line.slice(i + 1).trim();
    if (word && meaning) out[word] = meaning;
  });
  return out;
}
export const glossesToText = (g = {}) => Object.entries(g).map(([w, m]) => `${w}: ${m}`).join('\n');

const words = (t) => t.toLowerCase().replace(/[^a-z0-9'’\s-]/g, ' ').split(/\s+/).filter(Boolean);

// "Tap" while the video plays: the next sentence starts now, so the previous one ends now.
export function applyTap(sentences, index, time) {
  const t = Math.round(time * 10) / 10;
  return sentences.map((s, i) => {
    if (i === index) return { ...s, start: t };
    if (i === index - 1) return { ...s, end: t };
    return s;
  });
}

// What is still wrong with a clip draft? (An empty list means it can be saved.)
export function validateDraft(d, { takenIds = [], isNew = true } = {}) {
  const problems = [];
  if (!d.title.trim()) problems.push('Give the clip a title.');
  if (!/^[a-z0-9][a-z0-9-]{2,60}$/.test(d.id)) problems.push('The clip id must be 3+ lowercase letters, numbers or dashes.');
  if (isNew && takenIds.includes(d.id)) problems.push(`The id "${d.id}" is already used.`);
  if (!d.videoRef) problems.push('Add a video (a YouTube link or an uploaded file).');
  if (!d.sentences.length) problems.push('Add at least one sentence.');
  let prevEnd = -1;
  d.sentences.forEach((s, i) => {
    const n = `Sentence ${i + 1}`;
    if (!s.text.trim()) problems.push(`${n} has no text.`);
    if (s.start === null || s.end === null || s.start === '' || s.end === '') problems.push(`${n} needs a start and an end time.`);
    else {
      if (!(Number(s.end) > Number(s.start))) problems.push(`${n}: the end must be after the start.`);
      if (Number(s.start) < prevEnd) problems.push(`${n} starts before the previous sentence ends.`);
      prevEnd = Number(s.end);
    }
    if (!s.ko.trim()) problems.push(`${n} needs your Korean translation.`);
    (s.keyWords ?? []).forEach((k) => {
      if (!k.word.trim() || !k.ko.trim()) problems.push(`${n}: every key expression needs the phrase and its Korean meaning.`);
      else if (!` ${words(s.text).join(' ')} `.includes(` ${words(k.word).join(' ')} `)) problems.push(`${n}: the key expression "${k.word}" is not in the sentence.`);
    });
    Object.keys(parseGlosses(s.glossText)).forEach((g) => {
      if (!words(s.text).includes(g.toLowerCase())) problems.push(`${n}: the word "${g}" in the word list is not in the sentence.`);
    });
  });
  return problems;
}

// clip (app format) -> editor draft
export function draftFromClip(clip) {
  const placeholder = clip.videoId?.startsWith('PLACEHOLDER');
  return {
    id: clip.id,
    title: clip.title,
    accent: clip.accent,
    difficulty: clip.difficulty,
    source: clip.source,
    videoRef: placeholder ? '' : clip.videoId,
    contextKo: clip.contextKo ?? '',
    published: clip.published ?? true,
    sentences: clip.sentences.map((s) => ({
      id: s.id, text: s.text, start: s.start, end: s.end, ko: s.ko ?? '',
      keyWords: (s.keyWords ?? []).map((k) => ({ word: k.word, ko: k.ko, note: k.note ?? '' })),
      glossText: glossesToText(s.glosses),
    })),
  };
}

export const emptyDraft = (id = '') => ({
  id, title: '', accent: 'US', difficulty: 3, source: 'youtube', videoRef: '', contextKo: '', published: true, sentences: [],
});

// editor draft -> clip (app format), ready to save
export function clipFromDraft(d) {
  return {
    id: d.id,
    source: d.source,
    videoId: d.videoRef,
    title: d.title.trim(),
    accent: d.accent,
    difficulty: Number(d.difficulty),
    contextKo: d.contextKo.trim(),
    published: d.published,
    sentences: d.sentences.map((s) => ({
      id: s.id,
      start: Number(s.start),
      end: Number(s.end),
      text: s.text.trim(),
      ko: s.ko.trim(),
      keyWords: (s.keyWords ?? []).filter((k) => k.word.trim()).map((k) => ({ word: k.word.trim(), ko: k.ko.trim(), note: k.note.trim() })),
      glosses: parseGlosses(s.glossText),
    })),
  };
}

// Rebuild the sentence list from pasted lines. A line that is unchanged keeps its times and
// translation; an edited line keeps the data of the sentence at the same position.
export function applyTranscript(existing, lines) {
  const used = new Set();
  const taken = new Set(existing.map((s) => s.id)); // ids already in use, so new sentences never repeat one
  const picked = lines.map((text) => {
    const j = existing.findIndex((s, k) => !used.has(k) && s.text.trim() === text);
    if (j === -1) return null;
    used.add(j);
    return existing[j];
  });
  return lines.map((text, i) => {
    if (picked[i]) return picked[i];
    if (existing[i] && !used.has(i)) {
      used.add(i);
      return { ...existing[i], text };
    }
    return { id: freeSentenceId(taken, i), text, start: null, end: null, ko: '', keyWords: [], glossText: '' };
  });
}

function freeSentenceId(taken, i) {
  let n = i + 1;
  while (taken.has(`s${n}`)) n += 1;
  taken.add(`s${n}`);
  return `s${n}`;
}
