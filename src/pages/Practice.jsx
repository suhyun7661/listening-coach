import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, Icon } from '../components/Common';
import { practiceSample as p } from '../data/sampleData';

const SPEEDS = ['0.5x', '0.75x', '1x', '1.25x'];

export default function Practice() {
  const [speed, setSpeed] = useState('0.75x');
  const [loop, setLoop] = useState(false);

  return (
    <div className="page">
      <Link to="/" className="back-link">‹ Back to library</Link>
      <div className="practice-head">
        <h1 className="page__title">{p.title}</h1>
        <div className="practice-head__pills">
          <span className="pill pill--accent">{p.accent} accent</span>
          <span className="pill pill--violet">Level {p.level}</span>
          <span className="pill pill--outline">Practice mode</span>
        </div>
      </div>

      <div className="practice-layout">
        <div className="practice-main">
          <section className="player card" aria-label="Video player">
            <div className="player__video">
              <button type="button" className="player__play" aria-label="Play video"><PlayIcon size={34} /></button>
              <span className="player__caption">Video player (YouTube embed or uploaded file)</span>
            </div>
            <div className="player__bar">
              <span>0:14</span>
              <div className="progress progress--player" role="progressbar" aria-label="Video position" aria-valuemin="0" aria-valuemax="52" aria-valuenow="14">
                <span className="progress__done" style={{ width: '27%' }} />
                <span className="progress__sentence" style={{ left: '27%', width: '8%' }} />
              </div>
              <span>0:52</span>
            </div>
            <div className="player__controls">
              <button type="button" className="btn btn--secondary"><Icon name="replay" /> Replay sentence</button>
              <button type="button" className={`btn btn--outline${loop ? ' is-on' : ''}`} aria-pressed={loop} onClick={() => setLoop(!loop)}>
                <Icon name="loop" /> Loop sentence
              </button>
              <div className="speed" role="group" aria-label="Speed">
                <span className="speed__label">Speed</span>
                <div className="speed__options">
                  {SPEEDS.map((s) => (
                    <button key={s} type="button" className={`speed__btn${speed === s ? ' is-selected' : ''}`} aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card sentence-card" aria-label="Current sentence">
            <div className="sentence-card__head">
              <h2>Sentence {p.current} of {p.total}</h2>
              <span className="muted">Hint: letter count shown in each blank</span>
            </div>
            <p className="sentence">
              <span>I</span> <span>didn’t</span> <span>plan</span> <span>it.</span> <span>I</span> <span>just</span>
              <input className="blank is-filled" defaultValue="came" aria-label="Blank 1 of 2" size="5" />
              <span>here</span> <span>on</span> <span>a</span>
              <input className="blank" placeholder="_ _ _ _" aria-label="Blank 2 of 2" size="5" />
              <span>.</span>
            </p>
            <div className="sentence-card__foot">
              <button type="button" className="btn btn--outline">Previous</button>
              <button type="button" className="btn btn--primary">Next sentence</button>
            </div>
          </section>
        </div>

        <aside className="practice-side">
          <section className="card" aria-labelledby="tracker-h">
            <h2 id="tracker-h" className="side-title">Sentences</h2>
            <ol className="tracker">
              {Array.from({ length: p.total }, (_, i) => i + 1).map((n) => {
                const state = n === p.current ? 'current' : p.done.includes(n) ? 'done' : 'todo';
                return (
                  <li key={n}>
                    <button type="button" className={`tracker__btn is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>{n}</button>
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

          <section className="summary-card">
            <h2 className="summary-card__title">Scene summary</h2>
            <p lang="ko" className="summary-card__ko">{p.contextKo}</p>
            <p className="summary-card__note">Korean translation of each line appears after grading.</p>
          </section>

          <Link to="/practice/review" className="btn btn--submit">Submit clip for grading</Link>
        </aside>
      </div>
    </div>
  );
}
