import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { computeScore, summarizeTags, wrongSentences } from '../lib/errorTags';
import { CATEGORIES } from '../lib/diagnosis';
import { categoryStats, extremes, MAPPING_NOTE } from '../lib/questionCategory';
import { LEVEL_NAMES } from '../lib/blanks';
import { getAttempt } from '../lib/attempts';
import { useAuth } from '../lib/AuthContext';

const names = (list) => list.map((s) => CATEGORIES.find((c) => c.id === s.id).label).join(' and ');
const pct = (s) => (s.accuracy === null ? 'No questions' : `${s.accuracy}%`);

// The Diagnosis Report: how the learner did on each skill in THIS practice level.
// The question category comes from the question itself (see questionCategory.js), never from the mistake labels
// the learner chose. It opens only after every mistaken sentence has a confirmed category.
export default function DiagnosisReport() {
  const { attemptId } = useParams();
  const auth = useAuth();
  const [attempt, setAttempt] = useState(undefined);

  useEffect(() => {
    if (auth.loading) return undefined;
    let alive = true;
    getAttempt(auth.user, attemptId).then((a) => alive && setAttempt(a)).catch(() => alive && setAttempt(null));
    return () => { alive = false; };
  }, [auth.loading, auth.user, attemptId]);

  const results = attempt?.results ?? [];
  const score = useMemo(() => computeScore(results), [results]);
  const wrong = useMemo(() => wrongSentences(results), [results]);
  const stats = useMemo(() => categoryStats(results), [results]);
  const { strongest, weakest } = useMemo(() => extremes(stats), [stats]);
  const pending = useMemo(() => summarizeTags(results, attempt?.userTags ?? {}).pending, [results, attempt]);

  if (attempt === undefined) return <div className="page"><p className="muted">Loading your report…</p></div>;
  if (!attempt) {
    return (
      <div className="page">
        <h1 className="page__title">Diagnosis Report</h1>
        <p className="page__lead">That report could not be found.</p>
        <Link to="/practice" className="btn btn--primary">Go to Practice</Link>
      </div>
    );
  }

  const back = `/review/${attempt.id}`;
  if (pending > 0) {
    return (
      <div className="page">
        <Link to={back} className="back-link">‹ Back to Review Report</Link>
        <h1 className="page__title">Diagnosis Report</h1>
        <p className="notice" role="status">
          Incomplete: {pending} of {wrong.length} mistaken {wrong.length === 1 ? 'sentence is' : 'sentences are'} not confirmed yet.
          Confirm a category for each one in the Review Report first.
        </p>
        <p><Link to={back} className="btn btn--primary">Back to Review Report</Link></p>
      </div>
    );
  }

  const sentencesCorrect = results.length - wrong.length;
  const accuracy = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  const tied = (list) => list.length > 1;

  return (
    <div className="page review">
      <Link to={back} className="back-link">‹ Back to Review Report</Link>
      <header className="review-head">
        <h1 className="page__title">Diagnosis Report</h1>
        <Link to={back} className="btn btn--outline">Back to Review Report</Link>
      </header>

      <section className="card" aria-labelledby="sum-h">
        <h2 id="sum-h" className="side-title">Practice summary</h2>
        <ul className="diag-summary">
          <li><span className="diag-summary__value">{LEVEL_NAMES[attempt.level] ?? `Level ${attempt.level}`}</span><span className="diag-summary__label">Practice level</span></li>
          <li><span className="diag-summary__value">{results.length}</span><span className="diag-summary__label">Sentences in this level</span></li>
          <li><span className="diag-summary__value">{sentencesCorrect}</span><span className="diag-summary__label">Correct sentences</span></li>
          <li><span className="diag-summary__value">{wrong.length}</span><span className="diag-summary__label">Incorrect sentences</span></li>
          <li><span className="diag-summary__value">{accuracy}%</span><span className="diag-summary__label">Overall accuracy ({score.correct} / {score.total} blanks)</span></li>
        </ul>
      </section>

      <section className="card" aria-labelledby="cat-h">
        <h2 id="cat-h" className="side-title">Accuracy by category</h2>
        <ul className="diag-bars">
          {stats.map((s) => {
            const c = CATEGORIES.find((x) => x.id === s.id);
            return (
              <li key={s.id}>
                <div className="diag-bar__top">
                  <span className={`diag-bar__name text--${s.id}`}>{c.label} <span lang="ko">{c.ko}</span></span>
                  <span className="diag-bar__nums">
                    {s.total ? `${s.correct} / ${s.total} correct · ${s.accuracy}%` : 'No questions in this category'}
                  </span>
                </div>
                <div
                  className="diag-bar__track"
                  role="img"
                  aria-label={s.total ? `${c.label}: ${s.correct} of ${s.total} correct, ${s.accuracy} percent` : `${c.label}: no questions`}
                >
                  <span className={`diag-bar__fill fill--${s.id}`} style={{ width: `${s.accuracy ?? 0}%` }} />
                </div>
                <p className="diag-bar__note">Questions in this category: {MAPPING_NOTE[s.id]}.</p>
              </li>
            );
          })}
        </ul>
        <p className="muted">
          Accuracy = correct questions in the category ÷ all questions in the category. A group such as a key expression counts as one question.
          The lesson data has no category labels, so each question is assigned to a category by a fixed rule from the word itself, not from the
          mistake categories you chose. A category with no questions shows “No questions” instead of 0%.
        </p>
      </section>

      <div className="diag-points">
        <section className="card" aria-labelledby="strong-h">
          <h2 id="strong-h" className="side-title">Strongest point</h2>
          {strongest.length ? (
            <>
              <p className="weak-card__name">{names(strongest)}</p>
              <p className="muted">{tied(strongest) ? 'Tied: ' : ''}{pct(strongest[0])} accuracy</p>
            </>
          ) : <p className="muted">Not enough data.</p>}
        </section>
        <section className="card" aria-labelledby="weak2-h">
          <h2 id="weak2-h" className="side-title">Weakest point</h2>
          {weakest.length ? (
            <>
              <p className="weak-card__name">{names(weakest)}</p>
              <p className="muted">{tied(weakest) ? 'Tied: ' : ''}{pct(weakest[0])} accuracy</p>
            </>
          ) : <p className="muted">Not enough data.</p>}
        </section>
      </div>
      {strongest.length > 0 && strongest.length === weakest.length && strongest.every((s) => weakest.some((w) => w.id === s.id)) && (
        <p className="muted">All categories with questions have the same accuracy, so none stands out.</p>
      )}

      <div className="review-actions">
        <Link to={back} className="btn btn--primary">Back to Review Report</Link>
      </div>
    </div>
  );
}
