import { clips } from '../data/clips';

// Where the app gets its clips from: the clip data file in src/data/clips (no database).
export const getClips = () => clips;
export const getClip = (id) => clips.find((c) => c.id === id);
