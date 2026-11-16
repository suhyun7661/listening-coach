import walkWithMe from './walk-with-me.js';

// The app has one clip: Walk With Me.
export const clips = [walkWithMe];

export function getClip(id) {
  return clips.find((c) => c.id === id);
}
