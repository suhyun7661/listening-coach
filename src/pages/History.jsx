import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import { Tag } from '../components/Common';
import { CATEGORY_IDS, computeScore, mainWeakness, summarizeTags } from '../lib/errorTags';
import { loadAttempts } from '../lib/attemptStore';

// Every report you have finished, newest first, plus the totals added up over all of them.
export default function History() {
  const rows = useMemo(
    () =>
      loadAttempts().map((a) => {
        const counts = summarizeTags(a.results, a.userTags);
        return { ...a, score: computeScore(a.results), counts, main: mainWeakness(counts) };
      }),
    []
  );

  const totals = useMemo(() => {
    const sum = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
    rows.forEach((r) => CATEGORY_IDS.forEach((id) => { sum[id] += r.counts[id]; }));
    return sum;
  }, [rows]);

  return (
    <div className="page">
      <h1 className="page__title">Past reports</h1>
      <p className="page__lead">Every clip you have graded is saved here, so you can open it again any time.</p>

      {rows.length === 0 ? (
        <div className="card">
          <p>No reports yet. Finish a practice clip and press “Submit clip for grading”.</p>
          <Link to="/" className="btn btn--primary">Go to the library</Link>
        </div>
      ) : (
        <>
          <ErrorSummary counts={totals} title={`All ${rows.length} reports added up`} scope="across all reports" />
          <h2 className="section-title history-title">Your reports</h2>
          <ul className="stack">
            {rows.map((r) => (
              <li key={r.id} className="card history-row">
                <div>
                  <p className="history-row__title">{r.title}</p>
                  <p className="muted">
                    {new Date(r.createdAt).toLocaleString()} · Level {r.level} · {r.speed}x
                  </p>
                </div>
                <div className="history-row__side">
                  <span className="history-row__score">{r.score.percent}%</span>
                  {r.main ? <Tag id={r.main} /> : <span className="tag tag--AC">No misses</span>}
                  <Link to={`/review/${r.id}`} className="btn btn--secondary btn--small">Open report</Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
