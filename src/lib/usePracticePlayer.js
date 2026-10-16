import { useCallback, useMemo, useRef, useState } from 'react';

// Playback logic for Practice mode: replay one sentence, loop it, change speed.
// sentenceRef always points at the sentence the learner is looking at ({ start, end }).
// Changing sentences never pauses or moves the video. Only the buttons do that.
export function usePracticePlayer(sentenceRef) {
  const remote = useRef(null);          // the player's remote control
  const range = useRef(null);           // {start, end} while a sentence is being replayed
  const loopOn = useRef(false);
  const rate = useRef(1);
  const lastSeek = useRef(0);

  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [loop, setLoopState] = useState(false);
  const [ready, setReady] = useState(false);

  const seek = useCallback((t) => {
    lastSeek.current = Date.now();
    remote.current?.seek(t);
  }, []);

  const handlers = useMemo(
    () => ({
      onReady: (r) => {
        remote.current = r;
        r.setRate(rate.current);
        setReady(true);
      },
      onDuration: (d) => d && setDuration(d),
      onPlaying: setPlaying,
      onTime: (t) => {
        setTime(t);
        const r = range.current;
        // Ignore the moment right after a seek, when some players still report the old time.
        if (!r || t < r.end || Date.now() - lastSeek.current < 400) return;
        if (loopOn.current) {
          const s = sentenceRef.current; // a loop follows the sentence on screen
          range.current = { start: s.start, end: s.end };
          seek(s.start);
        } else {
          range.current = null;
          remote.current?.pause();
        }
      },
    }),
    [sentenceRef, seek]
  );

  const replay = useCallback(() => {
    const s = sentenceRef.current;
    range.current = { start: s.start, end: s.end };
    seek(s.start);
    remote.current?.play();
  }, [sentenceRef, seek]);

  const toggleLoop = useCallback(() => {
    const next = !loopOn.current;
    loopOn.current = next;
    setLoopState(next);
    if (next) replay();
  }, [replay]);

  const togglePlay = useCallback(() => {
    if (!remote.current) return;
    if (playing) {
      range.current = null;
      remote.current.pause();
    } else {
      remote.current.play();
    }
  }, [playing]);

  const setSpeed = useCallback((value) => {
    rate.current = value;
    setSpeedState(value);
    remote.current?.setRate(value);
  }, []);

  return { handlers, time, duration, playing, speed, loop, ready, replay, toggleLoop, togglePlay, setSpeed };
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
