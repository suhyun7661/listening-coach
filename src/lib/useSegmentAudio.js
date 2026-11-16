import { useCallback, useEffect, useRef, useState } from 'react';

// Plays one part of an audio file (from "start" to "end", in seconds) at normal speed.
// There is no speed control anywhere. play() returns false if the browser blocked the sound.
export function useSegmentAudio(src) {
  const audio = useRef(null);
  const timer = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = new Audio(src);
    el.preload = 'auto';
    audio.current = el;
    return () => {
      clearInterval(timer.current);
      el.pause();
    };
  }, [src]);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    audio.current?.pause();
    setPlaying(false);
  }, []);

  const play = useCallback(
    async (start, end) => {
      const el = audio.current;
      if (!el) return false;
      clearInterval(timer.current);
      el.pause();
      try {
        el.currentTime = start;
        await el.play();
      } catch {
        setPlaying(false);
        return false;
      }
      setPlaying(true);
      timer.current = setInterval(() => {
        if (el.currentTime >= end) stop();
      }, 25);
      return true;
    },
    [stop]
  );

  return { play, stop, playing };
}
