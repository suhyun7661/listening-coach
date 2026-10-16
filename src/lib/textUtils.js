// Shared text helpers used by blanks, grading and error tags.

// Lowercase, unify apostrophes, drop punctuation, collapse spaces.
export function normalize(text = '') {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripApostrophes(text = '') {
  return text.replace(/'/g, '');
}

export function splitTokens(text = '') {
  return text.trim().split(/\s+/).filter(Boolean);
}

// "didn't." -> { before: '', word: "didn't", after: '.' }
export function parseToken(token) {
  const match = token.match(/^([^A-Za-z0-9'’]*)([A-Za-z0-9'’-]+)([^A-Za-z0-9'’]*)$/);
  if (!match) return { before: '', word: '', after: token };
  return { before: match[1], word: match[2], after: match[3] };
}

export function levenshtein(a = '', b = '') {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[rows - 1][cols - 1];
}

// Same seed -> same sequence, so every user (and every competitor)
// gets the same blanks for the same sentence and level.
export function seededRandom(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let t = h >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
