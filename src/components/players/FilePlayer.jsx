import { useEffect, useRef } from 'react';

// Plays an uploaded video file with a normal HTML5 <video> element.
export default function FilePlayer({ src, handlers }) {
  const video = useRef(null);
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const el = video.current;
    const onMeta = () => latest.current.onDuration(el.duration);
    const onPlay = () => latest.current.onPlaying(true);
    const onPause = () => latest.current.onPlaying(false);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onPause);
    if (el.readyState >= 1) onMeta();

    latest.current.onReady({
      play: () => el.play(),
      pause: () => el.pause(),
      seek: (t) => { el.currentTime = t; },
      setRate: (r) => { el.playbackRate = r; },
      getTime: () => el.currentTime,
    });
    const timer = setInterval(() => latest.current.onTime(el.currentTime), 100);

    return () => {
      clearInterval(timer);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onPause);
    };
  }, [src]);

  return <video ref={video} className="player__file" src={src} playsInline preload="metadata" />;
}
