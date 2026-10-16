import YouTubePlayer from './players/YouTubePlayer';
import FilePlayer from './players/FilePlayer';
import StandInPlayer from './players/StandInPlayer';

// Picks the right player for a clip. "handlers" are the callbacks listed in usePracticePlayer.
export default function VideoPlayer({ clip, handlers }) {
  const isPlaceholder = clip.videoId.startsWith('PLACEHOLDER');
  const lastEnd = clip.sentences[clip.sentences.length - 1].end;

  if (isPlaceholder) return <StandInPlayer key={clip.id} duration={lastEnd + 2} handlers={handlers} />;
  if (clip.source === 'youtube') return <YouTubePlayer key={clip.id} videoId={clip.videoId} handlers={handlers} />;
  return <FilePlayer key={clip.id} src={clip.videoId} handlers={handlers} />;
}
