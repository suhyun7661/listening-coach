import { useEffect, useRef } from 'react';

// Used while a clip still has a placeholder video. It runs a pretend clock so that
// Replay, Loop and Speed can be tried before a real video exists.
export default function StandInPlayer({ duration, handlers }) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const clock = { t: 0, playing: false, rate: 1 };
    latest.current.onDuration(duration);
    latest.current.onReady({
      play: () => { clock.playing = true; latest.current.onPlaying(true); },
      pause: () => { clock.playing = false; latest.current.onPlaying(false); },
      seek: (t) => { clock.t = Math.max(0, Math.min(t, duration)); },
      setRate: (r) => { clock.rate = r; },
      getTime: () => clock.t,
    });
    const timer = setInterval(() => {
      if (clock.playing) {
        clock.t += 0.1 * clock.rate;
        if (clock.t >= duration) {
          clock.t = duration;
          clock.playing = false;
          latest.current.onPlaying(false);
        }
      }
      latest.current.onTime(clock.t);
    }, 100);
    return () => clearInterval(timer);
  }, [duration]);

  return (
    <p className="player__notice player__notice--top">
      Practice stand-in: this clip has no real video yet, so a pretend clock runs instead.
    </p>
  );
}
