import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import ErrorTagPicker from '../components/ErrorTagPicker';
import { computeScore, mainWeakness, spellingSlips, summarizeTags, wrongSentences } from '../lib/errorTags';
import { categoryById, guidance, suggestedTag } from '../lib/diagnosis';
import { isMiss } from '../lib/grading';
import { LEVEL_NAMES } from '../lib/blanks';
import { getAttempt, setUserTag } from '../lib/attempts';
import { useAuth } from '../lib/AuthContext';

// One mistaken sentence: correct answer, your answer, the suggested category, the category YOU confirm,
// and a collapsible Listening Guidance that always follows the category that is selected now.
function ReviewCard({ row, confirmed, onConfirm }) {
  const [open, setOpen] = useState(false);
  const suggested = suggestedTag(row);
  const selected = confirmed ?? suggested; // the guidance follows this
  const tips = guidance(selected, row);
  const misses = row.tokens.filter((t) => t.type === 'blank' && isMiss(t));

  const sentence = (mode) =>
    row.tokens.map((t) => {
      if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
      const miss = isMiss(t);
      let body = t.answer;
      if (miss && mode === 'correct') body = <strong className="mark mark--ok">{t.answer}</strong>;
      if (miss && mode === 'yours') body = <span className="mark mark--wrong">{t.userAnswer.trim() || '(empty)'}</span>;
      return <span key={t.index}>{t.before}{body}{t.after}{' '}</span>;
    });

  return (
    <article className="review-row" aria-label={`Sentence ${row.number}`}>
      <header className="review-row__head">
        <span className="review-row__num">Sentence {row.number}</span>
        {row.ko && <span lang="ko" className="review-row__ko">{row.ko}</span>}
      </header>

      <div className="review-row__cols">
        <div className="review-col">
          <p className="review-col__label">Correct answer</p>
          <p className="review-col__text">{sentence('correct')}</p>
        </div>
        <div className="review-col">
          <p className="review-col__label">Your answer</p>
          <p className="review-col__text">{sentence('yours')}</p>
        </div>
      </div>

      {row.keyWords.map((kw) => (
        <p key={kw.word} className="review-row__note">
          <strong>{kw.word}</strong> = <span lang="ko">{kw.ko}</span>{kw.note ? `. ${kw.note}` : ''}
        </p>
      ))}

      <div className="review-row__miss">
        <p className="category-line">
          <span>Suggested category: <strong className={`text--${suggested}`}>{categoryById(suggested).label}</strong></span>
          <span>Confirmed category: {confirmed ? <strong className={`text--${confirmed}`}>{categoryById(confirmed).label}</strong> : <em>not confirmed yet</em>}</span>
        </p>
        <p className="muted">
          {misses.length > 1 ? `${misses.length} parts of this sentence were missed. ` : ''}
          This is a first guess from your answer, not a verdict. Tap the category that fits best; your choice is the final one.
        </p>
        <ErrorTagPicker suggested={suggested} confirmed={confirmed} onChange={(tag) => onConfirm(row.sentenceId, tag)} label={`Mistake category for sentence ${row.number}`} />
      </div>

      <div className="guidance">
        <button type="button" className="guidance__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span>Listening Guidance</span>
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div className="guidance__body" aria-live="polite">
            <p className="guidance__for">
              For: <strong className={`text--${selected}`}>{categoryById(selected).label}</strong>{confirmed ? '' : ' (suggested, not confirmed yet)'}
            </p>
            <h3>Why you may have missed it</h3>
            <p>{tips.why}</p>
            <h3>What to listen for</h3>
            <p>{tips.listen}</p>
            <h3>Focus on</h3>
            <p className="guidance__focus">{tips.focus}</p>
          </div>
        )}
      </div>
    </article>
  );
}

// The Review Report: the only place to look back at mistakes. It shows ONLY the sentences that were wrong.
export default function Review() {
  const { attemptId } = useParams();
  const auth = useAuth();
  const [attempt, setAttempt] = useState(undefined); // undefined = loading, null = not found
  const [userTags, setUserTags] = useState({}); // confirmed categories, keyed by sentence id
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
    return () => { alive = false; };
  }, [auth.loading, auth.user, attemptId]);

  const results = attempt?.results ?? [];
  const score = useMemo(() => computeScore(results), [results]);
  const wrong = useMemo(() => wrongSentences(results), [results]);
  const slips = useMemo(() => spellingSlips(results), [results]);
  const counts = useMemo(() => summarizeTags(results, userTags), [results, userTags]);

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

  // The learner's confirmed category is saved next to the suggestion (userTag vs autoTag).
  async function confirm(sentenceId, tag) {
    const next = { ...userTags, [sentenceId]: tag };
    setUserTags(next);
    setTagError('');
    try {
      await setUserTag(auth.user, attempt, sentenceId, next);
    } catch {
      setTagError('Your category could not be saved. Please try again.');
    }
  }

  const weak = categoryById(mainWeakness(counts));
  const confirmedCount = wrong.filter((r) => userTags[r.sentenceId]).length;

  return (
    <div className="page review">
      <Link to="/practice" className="back-link">‹ Back to Practice</Link>
      <header className="review-head">
        <h1 className="page__title">Review Report</h1>
        <Link to={`/review/${attempt.id}/script`} className="btn btn--outline">View Full Script</Link>
      </header>
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
          {wrong.length > 0 && <p className="muted">{confirmedCount} of {wrong.length} mistaken sentences confirmed by you. Unconfirmed ones use the suggestion.</p>}
        </section>
        <ErrorSummary counts={counts} title="Your mistakes by category" scope="in this round" />
      </div>

      {slips.length > 0 && (
        <section className="spelling" aria-labelledby="spell-h">
          <h2 id="spell-h" className="spelling__title">Minor Spelling Errors</h2>
          <p className="muted">Minor spelling mistake. The intended word was recognized correctly. These count as correct and are not listening errors.</p>
          <ul className="spelling__list">
            {slips.map((s) => (
              <li key={`${s.number}-${s.answer}`}>
                <span className="spelling__num">#{s.number}</span>
                <span>Correct: <strong>{s.answer}</strong></span>
                <span>Yours: <span className="mark mark--almost">{s.userAnswer}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="review-actions">
        <Link to="/practice" className="btn btn--primary">Practice again</Link>
      </div>

      <h2 className="section-title">{wrong.length ? 'Sentences to Review' : 'No sentences to review'}</h2>
      {wrong.length === 0 && <p className="page__lead">Every sentence was understood. Try a harder level or Compete Mode.</p>}

      <div className="stack stack--lg">
        {wrong.map((row) => (
          <ReviewCard key={row.sentenceId} row={row} confirmed={userTags[row.sentenceId]} onConfirm={confirm} />
        ))}
      </div>
    </div>
  );
}
