import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlayIcon, Icon } from '../components/Common';
import VideoPlayer from '../components/VideoPlayer';
import { clips, getClip } from '../data/clips';
import { formatTime, usePracticePlayer } from '../lib/usePracticePlayer';

const SPEEDS = [0.5, 0.75, 1, 1.25];

export default function Practice() {
  const { clipId } = useParams();
  const clip = getClip(clipId) ?? clips[0];
  // Levels 1-2 show a Korean scene summary. For now the level is the clip's own level.
  const level = clip.difficulty;

  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState([0]);
  const sentence = clip.sentences[index];

  // The player reads the sentence on screen from this ref.
  const sentenceRef = useRef(sentence);
  sentenceRef.current = sentence;
  const player = usePracticePlayer(sentenceRef);

  function goTo(i) {
    setIndex(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  }

  const total = player.duration || 1;
  const pct = (t) => `${Math.min(100, (t / total) * 100)}%`;

  return (
    <div className="page">
      <Link to="/" className="back-link">‹ Back to library</Link>
      <div className="practice-head">
        <h1 className="page__title">{clip.title}</h1>
        <div className="practice-head__pills">
          <span className="pill pill--accent">{clip.accent} accent</span>
          <span className="pill pill--violet">Level {level}</span>
          <span className="pill pill--outline">Practice mode</span>
        </div>
      </div>

      <div className="practice-layout">
        <div className="practice-main">
          <section className="player card" aria-label="Video player">
            <div className="player__video">
              <VideoPlayer clip={clip} handlers={player.handlers} />
              {!player.playing && (
                <button type="button" className="player__play" aria-label="Play video" onClick={player.togglePlay} disabled={!player.ready}>
                  <PlayIcon size={34} />
                </button>
              )}
            </div>
            <div className="player__bar">
              <span>{formatTime(player.time)}</span>
              <div className="progress progress--player" role="progressbar" aria-label="Video position" aria-valuemin="0" aria-valuemax={Math.round(total)} aria-valuenow={Math.round(player.time)}>
                <span className="progress__done" style={{ width: pct(player.time) }} />
                <span className="progress__sentence" style={{ left: pct(sentence.start), width: pct(sentence.end - sentence.start) }} />
              </div>
              <span>{formatTime(player.duration)}</span>
            </div>
            <div className="player__controls">
              {player.playing && (
                <button type="button" className="btn btn--outline" onClick={player.togglePlay}>Pause</button>
              )}
              <button type="button" className="btn btn--secondary" onClick={player.replay} disabled={!player.ready}>
                <Icon name="replay" /> Replay sentence
              </button>
              <button type="button" className={`btn btn--outline${player.loop ? ' is-on' : ''}`} aria-pressed={player.loop} onClick={player.toggleLoop} disabled={!player.ready}>
                <Icon name="loop" /> Loop sentence
              </button>
              <div className="speed" role="group" aria-label="Speed">
                <span className="speed__label">Speed</span>
                <div className="speed__options">
                  {SPEEDS.map((s) => (
                    <button key={s} type="button" className={`speed__btn${player.speed === s ? ' is-selected' : ''}`} aria-pressed={player.speed === s} onClick={() => player.setSpeed(s)}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card sentence-card" aria-label="Current sentence">
            <div className="sentence-card__head">
              <h2>Sentence {index + 1} of {clip.sentences.length}</h2>
              <span className="muted">{formatTime(sentence.start)} – {formatTime(sentence.end)}</span>
            </div>
            <p className="muted sentence-card__todo">The fill-in-the-blank boxes arrive in Stage 5. For now you can practise the video controls.</p>
            <div className="sentence-card__foot">
              <button type="button" className="btn btn--outline" disabled={index === 0} onClick={() => goTo(index - 1)}>Previous</button>
              <button type="button" className="btn btn--primary" disabled={index === clip.sentences.length - 1} onClick={() => goTo(index + 1)}>Next sentence</button>
            </div>
          </section>
        </div>

        <aside className="practice-side">
          <section className="card" aria-labelledby="tracker-h">
            <h2 id="tracker-h" className="side-title">Sentences</h2>
            <ol className="tracker">
              {clip.sentences.map((s, i) => {
                const state = i === index ? 'current' : visited.includes(i) ? 'done' : 'todo';
                return (
                  <li key={s.id}>
                    <button type="button" className={`tracker__btn is-${state}`} aria-current={state === 'current' ? 'step' : undefined} onClick={() => goTo(i)}>{i + 1}</button>
                  </li>
                );
              })}
            </ol>
            <p className="legend">
              <span><i className="legend__box legend__box--done" /> Done</span>
              <span><i className="legend__box legend__box--current" /> Current</span>
              <span><i className="legend__box" /> Not yet</span>
            </p>
          </section>

          {level <= 2 && (
            <section className="summary-card">
              <h2 className="summary-card__title">Scene summary</h2>
              <p lang="ko" className="summary-card__ko">{clip.contextKo}</p>
              <p className="summary-card__note">Korean translation of each line appears after grading.</p>
            </section>
          )}

          <Link to="/review" className="btn btn--submit">Submit clip for grading</Link>
        </aside>
      </div>
    </div>
  );
}
