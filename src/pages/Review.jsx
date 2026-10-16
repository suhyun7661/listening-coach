import { Link } from 'react-router-dom';
import { Tag } from '../components/Common';
import { reviewSample as r } from '../data/sampleData';

const ALL_TAGS = ['CS', 'SP', 'V', 'AC', 'MI'];
const MAX = 3;

export default function Review() {
  return (
    <div className="page">
      <Link to="/practice" className="back-link">‹ Back to clip</Link>
      <h1 className="page__title">Review: {r.title}</h1>

      <div className="review-top">
        <section className="score-card" aria-label="Your score">
          <span className="score-card__label">Your score</span>
          <span className="score-card__value">{r.percent}%</span>
          <span className="score-card__detail">{r.correct} of {r.total} blanks correct</span>
          <span className="score-card__sub">Level {r.level} · played at {r.speed}</span>
        </section>

        <section className="card" aria-labelledby="why-h">
          <h2 id="why-h" className="side-title">Why you missed them</h2>
          <ul className="bars">
            {r.misses.map((m) => (
              <li key={m.id} className="bars__row">
                <span className={`bars__name text--${m.id}`}><Tag id={m.id} plain={false} /></span>
                <span className="bars__track"><span className={`bars__fill fill--${m.id}`} style={{ width: `${(m.count / MAX) * 60 + (m.count === MAX ? 0 : 0)}%` }} /></span>
                <span className="bars__count">{m.count}</span>
              </li>
            ))}
          </ul>
          <p className="muted">Tags are guessed automatically (marked “suggested”). Tap another tag on any word to fix it.</p>
        </section>

        <section className="card" aria-labelledby="next-h">
          <h2 id="next-h" className="side-title">Next steps</h2>
          <div className="stack">
            <Link to="/vocab" className="btn btn--primary btn--block">Start vocab quiz</Link>
            <button type="button" className="btn btn--outline btn--block">Full script (English + Korean)</button>
            <button type="button" className="btn btn--outline btn--block">Try again at Level 4</button>
          </div>
        </section>
      </div>

      <h2 className="section-title">Sentence by sentence</h2>
      <div className="stack stack--lg">
        {r.rows.map((row) => (
          <article key={row.n} className="card review-row">
            <div className="review-row__main">
              <p className="review-row__en">
                <span className="review-row__num">{row.n}</span>
                {row.before} {row.wrong && (
                  <>
                    <s className="mark mark--wrong">{row.wrong}</s>{' '}
                    <strong className="mark mark--ok">{row.right}</strong>{' '}
                  </>
                )}
                {row.allCorrect && <strong className="mark mark--ok">All correct</strong>}
                {row.after}
              </p>
              <p lang="ko" className="review-row__ko">{row.ko}</p>
              {row.note && <p className="review-row__note">{row.note}</p>}
              {row.tag && (
                <div className="tagpicker" role="group" aria-label="Why did you miss this word?">
                  {ALL_TAGS.map((t) => (
                    <button key={t} type="button" className={`tagpick tag--${t}${t === row.tag ? ' is-selected' : ''}`} aria-pressed={t === row.tag}>
                      {t}{t === row.tag && <small>suggested</small>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="review-row__side">
              {row.allCorrect ? <span className="tag tag--AC">Correct</span> : <Tag id={row.tag} />}
              <div className="review-row__btns">
                <button type="button" className="btn btn--secondary btn--small">Replay</button>
                <button type="button" className="btn btn--outline btn--small">Compare US / UK</button>
              </div>
              <button type="button" className="btn btn--outline btn--small btn--block">+ Save to notebook</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
