import holiday from './holiday-pub-01.js';
import intern from './intern-01.js';
import cafe from './cafe-01.js';
import interview from './interview-01.js';
import directions from './directions-01.js';

// Audio paths follow one naming rule. The files themselves are made in Stage 12.
function withAudio(clip) {
  return {
    ...clip,
    sentences: clip.sentences.map((s) => ({
      ...s,
      ttsAudio: {
        US: `audio/${clip.id}-${s.id}-us.mp3`,
        UK: `audio/${clip.id}-${s.id}-uk.mp3`,
      },
    })),
  };
}

export const clips = [holiday, intern, cafe, interview, directions].map(withAudio);

export function getClip(id) {
  return clips.find((c) => c.id === id);
}
