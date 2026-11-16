import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClipVideo from '../components/ClipVideo';
import ErrorSummary from '../components/ErrorSummary';
import ErrorTagPicker from '../components/ErrorTagPicker';
import { CATEGORIES, computeScore, mainWeakness, summarizeTags } from '../lib/errorTags';
import { isMiss } from '../lib/grading';
import { LEVEL_NAMES } from '../lib/blanks';
import { getClip } from '../lib/clipStore';
import { getAttempt, setUserTag } from '../lib/attempts';
import { useAuth } from '../lib/AuthContext';

// The Review Report: the only place to look back at mistakes.
// Top: the biggest weakness (from the categories the learner confirmed).
// Then every sentence with a mistake: correct sentence on the left, the learner's answer on the right,
// and five category chips (the automatic guess is marked "suggested"; one tap changes it).
export default function Review() {
  const { attemptId } = useParams();
  const auth = useAuth();
  const [attempt, setAttempt] = useState(undefined); // undefined = loading, null = not found
  const [userTags, setUserTags] = useState({});
  const [showVideo, setShowVideo] = useState(false);
  const [tagError, setTagError] = useState('');

  useEffect(() => {
    if (auth.loading) return undefined;
    let alive = true;
    getAttempt(auth.user, attemptId)
      .then((a) => {
        if (!alive) return;
        setAttempt(a);
        setUserTags(a?.userTags ?? {});
      })
      .catch(() => alive && setAttempt(null));
    return () => {
      alive = false;
    };
  }, [auth.loading, auth.user, attemptId]);

  const results = attempt?.results ?? [];
  const score = useMemo(() => computeScore(results), [results]);
  const counts = useMemo(() => summarizeTags(results, userTags), [results, userTags]);
  const clip = attempt ? getClip(attempt.clipId) : null;

  if (attempt === undefined) {
    return <div className="page"><p className="muted">Loading your report…</p></div>;
  }
  if (!attempt) {
    return (
      <div className="page">
        <h1 className="page__title">Review Report</h1>
        <p className="page__lead">{attemptId ? 'That report could not be found.' : 'There is nothing to review yet. Finish a Practice round first.'}</p>
        <Link to="/practice" className="btn btn--primary">Go to Practice</Link>
      </div>
    );
  }

  // The learner's choice is stored next to the automatic guess (userTag vs autoTag).
  async function setTag(blankId, tag) {
    const next = { ...userTags, [blankId]: tag };
    setUserTags(next);
    setTagError('');
    try {
      await setUserTag(auth.user, attempt, blankId, next);
    } catch {
      setTagError('Your category change could not be saved. Please try again.');
    }
  }

  const weakId = mainWeakness(counts);
  const weak = CATEGORIES.find((c) => c.id === weakId);
  const wrongRows = results.filter((row) => row.tokens.some((t) => t.type === 'blank' && isMiss(t)));

  return (
    <div className="page review">
      <Link to="/practice" className="back-link">‹ Back to Practice</Link>
      <h1 className="page__title">Review Report</h1>
      {tagError && <p className="form__error" role="alert">{tagError}</p>}

      <div className="review-top">
        <section className="weak-card" aria-labelledby="weak-h">
          <p className="weak-card__label" id="weak-h">Your biggest weakness</p>
          {weak ? (
            <>
              <p className="weak-card__name">{weak.label} <span lang="ko">{weak.ko}</span></p>
              <p className="weak-card__text">{weak.description}</p>
            </>
          ) : (
            <p className="weak-card__name">None. Great listening!</p>
          )}
          <p className="weak-card__score">{score.correct} / {score.total} correct · {LEVEL_NAMES[attempt.level] ?? `Level ${attempt.level}`}</p>
        </section>
        <ErrorSummary counts={counts} title="Your mistakes by category" scope="in this round" />
      </div>

      <div className="review-actions">
        <button type="button" className="btn btn--outline" aria-expanded={showVideo} onClick={() => setShowVideo(!showVideo)}>
          {showVideo ? 'Hide the video' : 'Watch the full video'}
        </button>
        <Link to="/practice" className="btn btn--primary">Practice again</Link>
      </div>

      {showVideo && clip && (
        <section className="review-video" aria-label="Full video">
          <ClipVideo clip={clip} subtitleModes={['off', 'en', 'ko']} />
        </section>
      )}

      <h2 className="section-title">{wrongRows.length ? 'Sentences to review' : 'No mistakes'}</h2>
      {wrongRows.length === 0 && <p className="page__lead">Every sentence was correct. Try a harder level or Compete Mode.</p>}

      <div className="stack stack--lg">
        {wrongRows.map((row) => {
          const misses = row.tokens.filter((t) => t.type === 'blank' && isMiss(t));
          return (
            <article key={row.sentenceId} className="review-row">
              <header className="review-row__head">
                <span className="review-row__num">Sentence {row.number}</span>
                {row.ko && <span lang="ko" className="review-row__ko">{row.ko}</span>}
              </header>

              <div className="review-row__cols">
                <div className="review-col">
                  <p className="review-col__label">Correct sentence</p>
                  <p className="review-col__text">
                    {row.tokens.map((t) => {
                      if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
                      return (
                        <span key={t.index}>
                          {t.before}
                          {isMiss(t) ? <strong className="mark mark--ok">{t.answer}</strong> : t.answer}
                          {t.after}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
                <div className="review-col">
                  <p className="review-col__label">Your answer</p>
                  <p className="review-col__text">
                    {row.tokens.map((t) => {
                      if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
                      return (
                        <span key={t.index}>
                          {t.before}
                          {isMiss(t) ? <span className="mark mark--wrong">{t.userAnswer.trim() || '(empty)'}</span> : t.answer}
                          {t.after}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>

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
            </article>
          );
        })}
      </div>
    </div>
  );
}
