import YouTubePlayer from './players/YouTubePlayer';
import FilePlayer from './players/FilePlayer';

// Picks the right player for a clip. "handlers" are the callbacks listed in usePracticePlayer.
export default function VideoPlayer({ clip, handlers }) {
  if (clip.source === 'youtube') return <YouTubePlayer key={clip.id} videoId={clip.videoId} handlers={handlers} />;
  return <FilePlayer key={clip.id} src={clip.videoId} handlers={handlers} />;
}
