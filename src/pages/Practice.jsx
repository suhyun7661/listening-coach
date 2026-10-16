import { useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PlayIcon, Icon } from '../components/Common';
import VideoPlayer from '../components/VideoPlayer';
import HintedBlank from '../components/HintedBlank';
import { clips, getClip } from '../data/clips';
import { describeHints, getLevelRule } from '../lib/blanks';
import { saveAttempt } from '../lib/attemptStore';
import { buildResults } from '../lib/errorTags';
import { AUTO_ADVANCE_DELAY, useDictation } from '../lib/useDictation';
import { formatTime, usePracticePlayer } from '../lib/usePracticePlayer';

const SPEEDS = [0.5, 0.75, 1, 1.25];
const LEVELS = [1, 2, 3, 4, 5, 6];

export default function Practice() {
  const { clipId } = useParams();
  const clip = getClip(clipId) ?? clips[0];
  // key: opening another clip starts a fresh page state
  return <PracticeClip key={clip.id} clip={clip} />;
}

function PracticeClip({ clip }) {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const fromUrl = Number(search.get('level'));
  const [level, setLevel] = useState(fromUrl >= 1 && fromUrl <= 6 ? fromUrl : clip.difficulty);
  const rule = getLevelRule(level);

  const dictation = useDictation(clip.sentences, level);
  const { current, tokensBySentence, currentAnswers, finished, inputRefs } = dictation;
  const sentence = clip.sentences[current];

  // The player reads the sentence on screen from this ref.
  const sentenceRef = useRef(sentence);
  sentenceRef.current = sentence;
  const player = usePracticePlayer(sentenceRef);

  const total = player.duration || 1;
  const pct = (t) => `${Math.min(100, (t / total) * 100)}%`;
  // Grade everything, remember it for the Review page, and go there.
  // The learner's own accent is assumed to be US until accounts exist (Stage 9).
  function submit() {
    const results = buildResults(clip.sentences, tokensBySentence, dictation.answers, { clipAccent: clip.accent, userAccent: 'US' });
    const id = saveAttempt({ clipId: clip.id, title: clip.title, level, speed: player.speed, results });
    navigate(`/review/${id}`);
  }

  const isLast = current === clip.sentences.length - 1;

  let blankCounter = -1;
  inputRefs.current = [];

  return (
    <div className="page">
      <Link to="/" className="back-link">‹ Back to library</Link>
      <div className="practice-head">
        <h1 className="page__title">{clip.title}</h1>
        <div className="practice-head__pills">
          <span className="pill pill--accent">{clip.accent} accent</span>
          <label className="level-pick">
            <span>Level</span>
            <select value={level} onChange={(e) => { setLevel(Number(e.target.value)); e.target.blur(); }}>
              {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <span className="pill pill--outline">Practice mode</span>
        </div>
      </div>

      <div className="practice-layout">
        <div className="practice-main">
          <section className="player card" aria-label="Video player">
            <div className="player__video">
              <VideoPlayer clip={clip} handlers={player.handlers} />
              {!player.playing && (
                <button type="button" className="player__play" aria-label="Play video" onClick={() => { player.togglePlay(); dictation.focusBlank(); }} disabled={!player.ready}>
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
                <button type="button" className="btn btn--outline" onClick={() => { player.togglePlay(); dictation.focusBlank(); }}>Pause</button>
              )}
              <button type="button" className="btn btn--secondary" onClick={() => { player.replay(); dictation.focusBlank(); }} disabled={!player.ready}>
                <Icon name="replay" /> Replay sentence
              </button>
              <button type="button" className={`btn btn--outline${player.loop ? ' is-on' : ''}`} aria-pressed={player.loop} onClick={() => { player.toggleLoop(); dictation.focusBlank(); }} disabled={!player.ready}>
                <Icon name="loop" /> Loop sentence
              </button>
              <div className="speed" role="group" aria-label="Speed">
                <span className="speed__label">Speed</span>
                <div className="speed__options">
                  {SPEEDS.map((s) => (
                    <button key={s} type="button" className={`speed__btn${player.speed === s ? ' is-selected' : ''}`} aria-pressed={player.speed === s} onClick={() => { player.setSpeed(s); dictation.focusBlank(); }}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="card sentence-card" aria-label="Dictation">
            <div className="sentence-card__head">
              <h2>{finished ? 'All sentences filled in' : `Sentence ${current + 1} of ${clip.sentences.length}`}</h2>
              <span className="muted">Level {level} hints: {describeHints(level)}</span>
            </div>

            {finished ? (
              <p className="sentence-card__done">Check any sentence with the numbers on the right, or submit now to see your results.</p>
            ) : (
              <p className="sentence">
                {tokensBySentence[current].map((token) => {
                  if (token.type === 'text') return <span key={token.index}>{token.raw}</span>;
                  blankCounter += 1;
                  const n = blankCounter;
                  return (
                    <span key={token.index} className="sentence__word">
                      {token.before}
                      <HintedBlank
                        ref={(el) => { inputRefs.current[n] = el; }}
                        blank={token}
                        value={currentAnswers[n] ?? ''}
                        onChange={(v) => dictation.updateAnswer(n, v)}
                        onKeyDown={(e) => dictation.handleKeyDown(e, n)}
                        label={`Blank ${n + 1} of ${currentAnswers.length}`}
                      />
                      {token.after}
                    </span>
                  );
                })}
              </p>
            )}

            <div className="countdown" aria-live="polite">
              {dictation.pending && !finished && (
                <>
                  <span className="countdown__bar" key={dictation.countdownKey} style={{ animationDuration: `${AUTO_ADVANCE_DELAY}ms` }} />
                  <span className="countdown__text">
                    {isLast ? 'Last sentence done. Press Enter to finish.' : 'Next sentence coming up. Keep typing to stay, or press Enter to go now.'}
                  </span>
                </>
              )}
            </div>

            <div className="sentence-card__foot">
              <button type="button" className="btn btn--outline" disabled={current === 0 && !finished} onClick={() => dictation.goTo(finished ? current : current - 1)}>Previous</button>
              <button type="button" className="btn btn--primary" disabled={finished} onClick={dictation.advance}>
                {isLast ? 'Finish' : 'Next sentence'}
              </button>
            </div>
          </section>
        </div>

        <aside className="practice-side">
          <section className="card" aria-labelledby="tracker-h">
            <h2 id="tracker-h" className="side-title">Sentences</h2>
            <ol className="tracker">
              {clip.sentences.map((s, i) => {
                const state = i === current && !finished ? 'current' : dictation.sentenceDone(i) ? 'done' : 'todo';
                return (
                  <li key={s.id}>
                    <button type="button" className={`tracker__btn is-${state}`} aria-current={state === 'current' ? 'step' : undefined} aria-label={`Sentence ${i + 1}`} onClick={() => dictation.goTo(i)}>{i + 1}</button>
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

          {rule.sceneSummary && (
            <section className="summary-card">
              <h2 className="summary-card__title">Scene summary</h2>
              <p lang="ko" className="summary-card__ko">{clip.contextKo}</p>
              <p className="summary-card__note">Korean translation of each line appears after grading.</p>
            </section>
          )}

          <button type="button" className="btn btn--submit" onClick={submit}>Submit clip for grading</button>
        </aside>
      </div>
    </div>
  );
}
