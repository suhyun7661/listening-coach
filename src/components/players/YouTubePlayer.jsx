import { useEffect, useRef, useState } from 'react';

// Loads Google's YouTube IFrame Player API once. We only embed; we never download videos.
let apiPromise;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

// Every player gives the page the same small remote control:
// { play, pause, seek, getTime }
export default function YouTubePlayer({ videoId, handlers }) {
  const host = useRef(null);
  const latest = useRef(handlers);
  latest.current = handlers;
  const [error, setError] = useState('');

  useEffect(() => {
    let player;
    let timer;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const el = document.createElement('div');
      host.current.appendChild(el);
      player = new YT.Player(el, {
        videoId,
        playerVars: { controls: 0, rel: 0, playsinline: 1, modestbranding: 1, disablekb: 1 },
        events: {
          onReady: () => {
            latest.current.onDuration(player.getDuration());
            latest.current.onReady({
              play: () => player.playVideo(),
              pause: () => player.pauseVideo(),
              seek: (t) => player.seekTo(t, true),
              getTime: () => player.getCurrentTime(),
            });
            timer = setInterval(() => latest.current.onTime(player.getCurrentTime()), 100);
          },
          onStateChange: (e) => {
            latest.current.onPlaying(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.PLAYING) latest.current.onDuration(player.getDuration());
          },
          onError: () => setError('This YouTube video cannot be played here.'),
        },
      });
    });

    return () => {
      cancelled = true;
      clearInterval(timer);
      player?.destroy?.();
      if (host.current) host.current.innerHTML = '';
    };
  }, [videoId]);

  return (
    <>
      <div className="player__embed" ref={host} />
      {error && <p className="player__notice">{error}</p>}
    </>
  );
}
