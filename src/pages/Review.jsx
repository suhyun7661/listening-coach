import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import ErrorTagPicker from '../components/ErrorTagPicker';
import { Tag } from '../components/Common';
import { allBlanks, computeScore, finalTag, summarizeTags } from '../lib/errorTags';
import { isMiss } from '../lib/grading';
import { loadAttempt, saveUserTags } from '../lib/attemptStore';

export default function Review() {
  const { attemptId } = useParams();
  const [attempt] = useState(() => loadAttempt(attemptId));
  const [userTags, setUserTags] = useState(attempt?.userTags ?? {});
  const [showScript, setShowScript] = useState(false);

  const results = attempt?.results ?? [];
  const score = useMemo(() => computeScore(results), [results]);
  const almost = useMemo(() => allBlanks(results).filter((b) => b.status === 'almost').length, [results]);
  const counts = useMemo(() => summarizeTags(results, userTags), [results, userTags]);

  if (!attempt) {
    return (
      <div className="page">
        <h1 className="page__title">Review</h1>
        <p className="page__lead">{attemptId ? 'That report could not be found in this browser.' : 'There is nothing to review yet. Finish a practice clip and press “Submit clip for grading”.'}</p>
        <Link to="/history" className="btn btn--outline">All past reports</Link>{' '}
        <Link to="/" className="btn btn--primary">Go to the library</Link>
      </div>
    );
  }

  // The user's choice is stored next to the automatic guess (userTag vs autoTag).
  function setTag(blankId, tag) {
    const next = { ...userTags, [blankId]: tag };
    setUserTags(next);
    saveUserTags(attempt.id, next);
  }

  const nextLevel = Math.min(6, attempt.level + 1);

  return (
    <div className="page">
      <Link to={`/practice/${attempt.clipId}`} className="back-link">‹ Back to clip</Link>
      <h1 className="page__title">Review: {attempt.title}</h1>

      <div className="review-top">
        <section className="score-card" aria-label="Your score">
          <span className="score-card__label">Your score</span>
          <span className="score-card__value">{score.percent}%</span>
          <span className="score-card__detail">{score.correct} of {score.total} blanks correct</span>
          {almost > 0 && <span className="score-card__sub">{almost} almost right (half a point each)</span>}
          <span className="score-card__sub">Level {attempt.level} · played at {attempt.speed}x</span>
        </section>

        <ErrorSummary counts={counts} />

        <section className="card" aria-labelledby="next-h">
          <h2 id="next-h" className="side-title">Next steps</h2>
          <div className="stack">
            <Link to="/vocab" className="btn btn--primary btn--block">Start vocab quiz</Link>
            <Link to="/history" className="btn btn--outline btn--block">All past reports</Link>
            <button type="button" className="btn btn--outline btn--block" aria-expanded={showScript} onClick={() => setShowScript(!showScript)}>
              Full script (English + Korean)
            </button>
            {attempt.level < 6 && (
              <Link to={`/practice/${attempt.clipId}?level=${nextLevel}`} className="btn btn--outline btn--block">Try again at Level {nextLevel}</Link>
            )}
          </div>
        </section>
      </div>

      {showScript && (
        <section className="card script" aria-label="Full script">
          <h2 className="side-title">Full script</h2>
          <ol className="script__list">
            {results.map((row) => (
              <li key={row.sentenceId}>
                <span>{row.text}</span>
                <span lang="ko" className="script__ko">{row.ko}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <h2 className="section-title">Sentence by sentence</h2>
      <div className="stack stack--lg">
        {results.map((row) => {
          const blanks = row.tokens.filter((t) => t.type === 'blank');
          const misses = blanks.filter(isMiss);
          const perfect = misses.length === 0 && !blanks.some((b) => b.status === 'almost');
          return (
            <article key={row.sentenceId} className="card review-row">
              <div className="review-row__main">
                <p className="review-row__en">
                  <span className="review-row__num">{String(row.number).padStart(2, '0')}</span>
                  {row.tokens.map((t) => {
                    if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
                    return (
                      <span key={t.index}>
                        {t.before}
                        {t.status === 'correct' && <span className="mark mark--ok">{t.answer}</span>}
                        {t.status === 'almost' && <span className="mark mark--almost" title={`You wrote "${t.userAnswer}"`}>{t.answer}</span>}
                        {isMiss(t) && (
                          <>
                            <s className="mark mark--wrong">{t.userAnswer.trim() || '(empty)'}</s>{' '}
                            <strong className="mark mark--ok">{t.answer}</strong>
                          </>
                        )}
                        {t.after}{' '}
                      </span>
                    );
                  })}
                </p>
                {row.ko && <p lang="ko" className="review-row__ko">{row.ko}</p>}
                {row.keyWords.map((kw) => (
                  <p key={kw.word} className="review-row__note">
                    <strong>{kw.word}</strong> = <span lang="ko">{kw.ko}</span>{kw.note ? `. ${kw.note}` : ''}
                  </p>
                ))}
                {misses.map((m) => (
                  <div key={m.blankId} className="review-row__miss">
                    <span>Why did you miss <strong>{m.answer}</strong>?</span>
                    <ErrorTagPicker autoTag={m.autoTag} value={userTags[m.blankId]} onChange={(tag) => setTag(m.blankId, tag)} word={m.answer} />
                  </div>
                ))}
              </div>
              <div className="review-row__side">
                {perfect ? (
                  <span className="tag tag--AC">Correct</span>
                ) : (
                  <div className="review-row__tags">
                    {misses.map((m) => <Tag key={m.blankId} id={finalTag(m, userTags)} />)}
                    {misses.length === 0 && <span className="tag tag--AC">Almost</span>}
                  </div>
                )}
                <div className="review-row__btns">
                  <button type="button" className="btn btn--secondary btn--small" disabled title="Coming in a later stage">Replay</button>
                  <button type="button" className="btn btn--outline btn--small" disabled title="Accent audio comes in Stage 12">Compare US / UK</button>
                </div>
                <button type="button" className="btn btn--outline btn--small btn--block" disabled title="The notebook comes in a later stage">+ Save to notebook</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
