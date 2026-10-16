import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Tag } from '../components/Common';
import { quizSample as q } from '../data/sampleData';

const TYPES = ['Listen and type', 'Meaning match', 'Fill the gap'];

export default function VocabQuiz() {
  const [type, setType] = useState('Meaning match');
  const [selected, setSelected] = useState(q.selected);

  return (
    <div className="page">
      <div className="quiz-layout">
        <div>
          <p className="muted">Made from your own mistakes</p>
          <div className="quiz-head">
            <h1 className="page__title">Vocab quiz</h1>
            <span className="quiz-head__count">Question {q.number} of {q.total}</span>
          </div>
          <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="1" aria-valuemax={q.total} aria-valuenow={q.number}>
            <span className="progress__done progress__done--coral" style={{ width: `${(q.number / q.total) * 100}%` }} />
          </div>

          <div className="quiz-types" role="group" aria-label="Question type">
            {TYPES.map((t) => (
              <button key={t} type="button" className={`chip chip--wide${type === t ? ' is-selected' : ''}`} aria-pressed={type === t} onClick={() => setType(t)}>
                {t}
              </button>
            ))}
          </div>

          <section className="card quiz-card">
            <div className="quiz-card__top">
              <div>
                <p className="muted">What does this expression mean?</p>
                <p className="quiz-card__word">{q.expression}</p>
              </div>
              <div className="quiz-card__play">
                <button type="button" className="btn btn--secondary"><Icon name="speaker" /> Play US</button>
                <button type="button" className="btn btn--outline"><Icon name="speaker" /> Play UK</button>
              </div>
            </div>
            <p className="quiz-example">
              Example: {q.example[0]}<strong>{q.example[1]}</strong>{q.example[2]}
            </p>
            <div className="options" role="radiogroup" aria-label="Choose the meaning">
              {q.options.map((o, i) => (
                <label key={o} className={`option${selected === i ? ' is-selected' : ''}`}>
                  <input type="radio" name="meaning" checked={selected === i} onChange={() => setSelected(i)} />
                  <span lang="ko">{o}</span>
                </label>
              ))}
            </div>
            <div className="quiz-card__foot">
              <button type="button" className="btn btn--outline">Skip</button>
              <button type="button" className="btn btn--primary">Check answer</button>
            </div>
          </section>
        </div>

        <aside className="practice-side">
          <section className="card" aria-labelledby="due-h">
            <h2 id="due-h" className="side-title">Due for review today</h2>
            <p className="muted due__link"><Link to="/history">Open your past reports</Link></p>
            <ul className="due">
              {q.due.map((d) => (
                <li key={d.text} className="due__item">
                  <span>{d.text}</span>
                  <Tag id={d.tag} plain />
                </li>
              ))}
            </ul>
          </section>
          <section className="summary-card">
            <h2 className="summary-card__title">Review schedule</h2>
            <p className="summary-card__body">Wrong answers come back after 1 day, then 3 days, then 7 days.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
