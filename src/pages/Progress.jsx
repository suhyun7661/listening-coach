import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../lib/errorTags';
import { useAttempts } from '../lib/useAttempts';

const LEVELS = [1, 2, 3, 4, 5, 6];
const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// Progress dashboard: scores over time, mistakes over time, average score per level.
export default function Progress() {
  const { attempts, loading, error } = useAttempts();

  // Oldest first, so charts read left to right. Show the latest 12 reports.
  const timeline = useMemo(() => [...attempts].reverse().slice(-12), [attempts]);
  const maxMisses = Math.max(1, ...timeline.map((a) => CATEGORIES.reduce((n, c) => n + a.counts[c.id], 0)));

  const byLevel = useMemo(
    () =>
      LEVELS.map((level) => {
        const list = attempts.filter((a) => a.level === level);
        const avg = list.length ? Math.round(list.reduce((n, a) => n + a.score.percent, 0) / list.length) : null;
        return { level, count: list.length, avg };
      }),
    [attempts]
  );

  return (
    <div className="page">
      <h1 className="page__title">My progress</h1>
      <p className="page__lead">See whether you are improving, and which kinds of mistakes you make most.</p>
      {error && <p className="form__error" role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Loading your reports…</p>
      ) : attempts.length === 0 ? (
        <div className="card">
          <p>No data yet. Finish one practice clip and your charts will appear here.</p>
          <Link to="/" className="btn btn--primary">Go to the library</Link>
        </div>
      ) : (
        <div className="stack stack--lg">
          <section className="card" aria-labelledby="score-h">
            <h2 id="score-h" className="side-title">Score on each clip</h2>
            <p className="muted chart__note">Latest {timeline.length} report{timeline.length > 1 ? 's' : ''}, oldest on the left.</p>
            <ul className="columns" aria-label="Score per report">
              {timeline.map((a) => (
                <li key={a.id} className="columns__item" aria-label={`${shortDate(a.createdAt)}, ${a.title}, level ${a.level}: ${a.score.percent} percent`}>
                  <span className="columns__value">{a.score.percent}%</span>
                  <span className="columns__track"><span className="columns__bar columns__bar--score" style={{ height: `${a.score.percent}%` }} /></span>
                  <span className="columns__label">L{a.level}</span>
                  <span className="columns__date">{shortDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card" aria-labelledby="miss-h">
            <h2 id="miss-h" className="side-title">Mistakes by category over time</h2>
            <ul className="legend legend--cats">
              {CATEGORIES.map((c) => (
                <li key={c.id}><i className={`legend__dot fill--${c.id}`} /> {c.id} · {c.label}</li>
              ))}
            </ul>
            <ul className="columns" aria-label="Mistakes per report">
              {timeline.map((a) => {
                const total = CATEGORIES.reduce((n, c) => n + a.counts[c.id], 0);
                return (
                  <li
                    key={a.id}
                    className="columns__item"
                    aria-label={`${shortDate(a.createdAt)}: ${CATEGORIES.map((c) => `${c.id} ${a.counts[c.id]}`).join(', ')}`}
                  >
                    <span className="columns__value">{total}</span>
                    <span className="columns__track columns__track--stack">
                      {CATEGORIES.map((c) =>
                        a.counts[c.id] ? (
                          <span key={c.id} className={`columns__seg fill--${c.id}`} style={{ height: `${(a.counts[c.id] / maxMisses) * 100}%` }} title={`${c.id}: ${a.counts[c.id]}`} />
                        ) : null
                      )}
                    </span>
                    <span className="columns__label">L{a.level}</span>
                    <span className="columns__date">{shortDate(a.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card" aria-labelledby="level-h">
            <h2 id="level-h" className="side-title">Average score per level</h2>
            <ul className="bars">
              {byLevel.map((l) => (
                <li key={l.level} className="bars__row bars__row--level">
                  <span className="bars__name">Level {l.level}</span>
                  <span className="bars__track"><span className="bars__fill fill--level" style={{ width: `${l.avg ?? 0}%` }} /></span>
                  <span className="bars__count bars__count--wide">{l.avg === null ? '–' : `${l.avg}%`}</span>
                  <span className="muted bars__times">{l.count} time{l.count === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
