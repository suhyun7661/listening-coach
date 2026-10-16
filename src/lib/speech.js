// Plays a word with the browser's built-in voice (US or UK English).
// This is a stand-in until the real accent audio is made in Stage 12.
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, accent = 'US') {
  if (!canSpeak) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = accent === 'UK' ? 'en-GB' : 'en-US';
  utterance.lang = lang;
  const voice = synth.getVoices().find((v) => v.lang.replace('_', '-') === lang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  synth.speak(utterance);
}
