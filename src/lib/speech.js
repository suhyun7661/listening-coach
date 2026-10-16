// Plays a word with a voice that is already installed on the computer (US or UK English).
// This is a stand-in until the real accent audio is made in Stage 12.
// A computer may have no UK (or US) English voice. We never pretend: if there is none,
// speak() returns false and the page tells the learner.
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

let voicesPromise;
function loadVoices() {
  if (!canSpeak) return Promise.resolve([]);
  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (synth.getVoices().length) return resolve(synth.getVoices());
      const done = () => resolve(synth.getVoices());
      synth.addEventListener('voiceschanged', done, { once: true });
      setTimeout(done, 1500); // some browsers never announce their voices
      return undefined;
    });
  }
  return voicesPromise;
}

const normal = (lang) => lang.replace('_', '-').toLowerCase();

// The best installed voice for 'US' or 'UK', or null if the computer has none.
export async function findVoice(accent) {
  const wanted = accent === 'UK' ? 'en-gb' : 'en-us';
  const matches = (await loadVoices()).filter((v) => normal(v.lang) === wanted);
  return matches.find((v) => /natural|google/i.test(v.name)) ?? matches[0] ?? null;
}

// { US: true, UK: false } : which accents can really be played here.
export async function voiceStatus() {
  const [US, UK] = await Promise.all([findVoice('US'), findVoice('UK')]);
  return { US: Boolean(US), UK: Boolean(UK) };
}

// Returns true if it played, false if this computer has no voice for that accent.
export async function speak(text, accent = 'US') {
  const voice = await findVoice(accent);
  if (!voice) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.9;
  synth.speak(utterance);
  return true;
}
