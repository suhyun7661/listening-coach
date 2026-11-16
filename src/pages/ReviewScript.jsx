import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAttempt } from '../lib/attempts';
import { getClip, getClips } from '../lib/clipStore';
import { wrongSentences } from '../lib/errorTags';
import { useAuth } from '../lib/AuthContext';

const mmss = (t) => {
  const s = Math.max(0, Math.floor(t || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// The Full Script: the video on the left, every sentence on the right.
// The current sentence follows the video; click a sentence to jump to it. Sentences you got wrong stay red.
export default function ReviewScript() {
  const { attemptId } = useParams();
  const auth = useAuth();
  const [attempt, setAttempt] = useState(undefined);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const video = useRef(null);
  const list = useRef(null);

  useEffect(() => {
    if (auth.loading) return undefined;
    let alive = true;
    getAttempt(auth.user, attemptId).then((a) => alive && setAttempt(a)).catch(() => alive && setAttempt(null));
    return () => { alive = false; };
  }, [auth.loading, auth.user, attemptId]);

  const clip = (attempt && getClip(attempt.clipId)) || getClips()[0];
  const wrongIds = useMemo(() => new Set(wrongSentences(attempt?.results ?? []).map((r) => r.sentenceId)), [attempt]);

  // The sentence that is playing: the last one that has started.
  let current = -1;
  clip.sentences.forEach((s, i) => { if (time >= s.start - 0.05) current = i; });

  // Keep the current sentence in view inside the transcript box (without moving the whole page).
  useEffect(() => {
    const box = list.current;
    const el = box?.querySelector(`[data-index="${current}"]`);
    if (!box || !el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [current]);

  function jump(start) {
    const v = video.current;
    if (!v) return;
    v.currentTime = start;
    v.play().catch(() => {});
  }

  if (attempt === undefined) return <div className="page"><p className="muted">Loading…</p></div>;
  const back = attempt ? `/review/${attempt.id}` : '/review';

  return (
    <div className="page script-view">
      <Link to={back} className="back-link">‹ Back to Review Report</Link>
      <h1 className="page__title">Full Script</h1>
      {!attempt && <p className="muted">No report was found, so no sentences are marked as incorrect.</p>}

      <div className="script-grid">
        <section className="script-video" aria-label="Video">
          <div className="clipvideo__frame">
            <video
              ref={video}
              className="clipvideo__video"
              src={clip.videoId}
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onSeeked={(e) => setTime(e.currentTarget.currentTime)}
            />
          </div>
          <p className="script-video__time" aria-live="off">{mmss(time)} / {mmss(duration)}</p>
        </section>

        <section className="script-text" aria-label="Transcript">
          <ol ref={list} className="transcript">
            {clip.sentences.map((s, i) => {
              const wrong = wrongIds.has(s.id);
              return (
                <li key={s.id} data-index={i}>
                  <button
                    type="button"
                    className={`transcript__line${i === current ? ' is-current' : ''}${wrong ? ' is-wrong' : ''}`}
                    aria-current={i === current ? 'true' : undefined}
                    onClick={() => jump(s.start)}
                  >
                    <span className="transcript__num">{i + 1}</span>
                    <span className="transcript__time">{mmss(s.start)}</span>
                    <span className="transcript__text">{s.text}</span>
                    {wrong && <span className="transcript__flag">Incorrect</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
