import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Tag } from '../components/Common';
import { getClip, getClips } from '../lib/clipStore';
import { gradeAnswer } from '../lib/grading';
import { saveReview, sentenceFor } from '../lib/notebook';
import { isDue, scheduleAfter, whenText } from '../lib/spaced';
import { playMessage, playWord } from '../lib/audio';
import { seededRandom } from '../lib/textUtils';
import { useNotebook } from '../lib/useNotebook';

const TYPES = [
  { id: 'listen', label: 'Listen and type' },
  { id: 'meaning', label: 'Meaning match' },
  { id: 'gap', label: 'Fill the gap' },
];
const QUIZ_SIZE = 8;

// Every Korean meaning in the clip data: used as wrong answers in Meaning match.
const meaningPool = () => [
  ...new Set(getClips().flatMap((c) => c.sentences.flatMap((s) => [...(s.keyWords ?? []).map((k) => k.ko), ...Object.values(s.glosses ?? {})]))),
];

const escapeRegExp = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "I just came here on a whim." + "on a whim" -> "I just came here _____."
function gapSentence(item) {
  const sentence = sentenceFor(item);
  if (!sentence) return null;
  const re = new RegExp(escapeRegExp(item.word).replace(/\s+/g, '\\s+'), 'i');
  return re.test(sentence.text) ? sentence.text.replace(re, '_____') : null;
}

function meaningOptions(item) {
  const random = seededRandom(item.id);
  const wrong = meaningPool().filter((m) => m !== item.ko)
    .map((m) => ({ m, r: random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, 3)
    .map((x) => x.m);
  const at = Math.floor(random() * 4);
  const list = [...wrong];
  list.splice(at, 0, item.ko);
  return { list, correct: at };
}

export default function VocabQuiz() {
  const { items, loading, error, reload, user } = useNotebook();
  const [type, setType] = useState('meaning');
  const [session, setSession] = useState(null); // { queue, index, results }
  const [problem, setProblem] = useState('');

  const due = useMemo(() => items.filter((i) => isDue(i)), [items]);

  // Start a quiz as soon as the notebook has loaded (up to 8 due words, oldest first).
  useEffect(() => {
    if (!loading && user && session === null) setSession({ queue: due.slice(0, QUIZ_SIZE), index: 0, results: [] });
  }, [loading, user, session, due]);

  function restart() {
    setSession(null);
    reload();
  }

  async function answered(item, correct) {
    const next = scheduleAfter(item.step, correct);
    try {
      await saveReview(item.id, next);
      setProblem('');
    } catch {
      setProblem('Your answer could not be saved, so this word may come back sooner.');
    }
    setSession((s) => ({ ...s, results: [...s.results, { item, correct, next }] }));
  }

  function skip(item) {
    setSession((s) => ({ ...s, results: [...s.results, { item, skipped: true }] }));
  }

  function goNext() {
    setSession((s) => ({ ...s, index: s.index + 1 }));
  }

  if (!user && !loading) {
    return (
      <div className="page">
        <h1 className="page__title">Vocab quiz</h1>
        <div className="card">
          <p>Sign in to use the vocab quiz. It is made from the words you miss, and brings them back after 1, 3 and 7 days.</p>
          <Link to="/login" state={{ from: '/vocab' }} className="btn btn--primary">Sign in</Link>
        </div>
      </div>
    );
  }

  const total = session?.queue.length ?? 0;
  const finished = session && session.index >= total;
  const item = session && !finished ? session.queue[session.index] : null;

  return (
    <div className="page">
      <div className="quiz-layout">
        <div>
          <p className="muted">Made from your own mistakes</p>
          <div className="quiz-head">
            <h1 className="page__title">Vocab quiz</h1>
            {total > 0 && !finished && <span className="quiz-head__count">Question {session.index + 1} of {total}</span>}
          </div>
          <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax={total} aria-valuenow={session?.index ?? 0}>
            <span className="progress__done progress__done--coral" style={{ width: total ? `${(Math.min(session.index, total) / total) * 100}%` : '0%' }} />
          </div>

          <div className="quiz-types" role="group" aria-label="Question type">
            {TYPES.map((t) => (
              <button key={t.id} type="button" className={`chip chip--wide${type === t.id ? ' is-selected' : ''}`} aria-pressed={type === t.id} onClick={() => setType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {error && <p className="form__error" role="alert">{error}</p>}
          {problem && <p className="form__error" role="alert">{problem}</p>}

          {loading || !session ? (
            <p className="muted">Loading your words…</p>
          ) : total === 0 ? (
            <section className="card quiz-card">
              <h2 className="side-title">Nothing is due right now</h2>
              <p>
                {items.length === 0
                  ? 'Your notebook is empty. Grade a clip and save the words you missed, then come back here.'
                  : `You are all caught up. Your next word comes back ${whenText(items.map((i) => i.nextAt).sort()[0])}.`}
              </p>
              <Link to={items.length ? '/notebook' : '/'} className="btn btn--primary">{items.length ? 'Open my notebook' : 'Go to the library'}</Link>
            </section>
          ) : finished ? (
            <Summary results={session.results} onAgain={restart} />
          ) : (
            <Question key={item.id} item={item} type={type} onAnswered={answered} onSkip={skip} onNext={goNext} isLast={session.index === total - 1} />
          )}
        </div>

        <aside className="practice-side">
          <section className="card" aria-labelledby="due-h">
            <h2 id="due-h" className="side-title">Due for review today</h2>
            {due.length === 0 ? (
              <p className="muted">Nothing due.</p>
            ) : (
              <ul className="due">
                {due.map((d) => (
                  <li key={d.id} className="due__item">
                    <span>{d.word}</span>
                    {d.tag && <Tag id={d.tag} plain />}
                  </li>
                ))}
              </ul>
            )}
            <p className="muted due__link"><Link to="/notebook">Open my notebook</Link></p>
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

export function Question({ item, type, onAnswered, onSkip, onNext, isLast }) {
  const clip = getClip(item.clipId);
  const accent = clip?.accent ?? 'US';
  const gap = useMemo(() => gapSentence(item), [item]);
  const options = useMemo(() => (item.ko ? meaningOptions(item) : null), [item]);

  // Some words cannot be asked in some ways; fall back to typing.
  const actual = type === 'meaning' && !options ? 'listen' : type === 'gap' && !gap ? 'listen' : type;
  const changed = actual !== type;

  const [input, setInput] = useState('');
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null); // { correct, note }
  const inputRef = useRef(null);
  const nextRef = useRef(null);

  // What happened the last time a Play button was pressed (empty when it all went well).
  const [playNote, setPlayNote] = useState('');
  async function play(accent) {
    const result = await playWord(item.word, accent);
    setPlayNote(playMessage(result, accent));
  }

  useEffect(() => {
    if (feedback) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [feedback]);

  function check(e) {
    e.preventDefault();
    if (feedback) return;
    if (actual === 'meaning') {
      if (picked === null) return;
      const correct = picked === options.correct;
      setFeedback({ correct });
      onAnswered(item, correct);
      return;
    }
    if (!input.trim()) return;
    const { status } = gradeAnswer(input, item.word);
    const correct = status === 'correct' || status === 'almost';
    setFeedback({ correct, note: status === 'almost' ? 'Almost! Check the spelling.' : '' });
    onAnswered(item, correct);
  }

  return (
    <form className="card quiz-card" onSubmit={check}>
      <div className="quiz-card__top">
        <div>
          <p className="muted">
            {actual === 'meaning' ? 'What does this expression mean?' : actual === 'gap' ? 'Type the missing word or expression' : 'Listen, then type what you hear'}
          </p>
          {actual === 'meaning' && <p className="quiz-card__word">{item.word}</p>}
          {actual === 'gap' && <p className="quiz-card__sentence">{gap}</p>}
          {actual === 'listen' && item.ko && <p lang="ko" className="quiz-card__hint">Meaning: {item.ko}</p>}
        </div>
        <div className="quiz-card__play">
          <button type="button" className="btn btn--secondary" onClick={() => play('US')}><Icon name="speaker" /> Play US</button>
          <button type="button" className="btn btn--outline" onClick={() => play('UK')}><Icon name="speaker" /> Play UK</button>
        </div>
      </div>
      {playNote && <p className="muted voice-note" role="status">{playNote}</p>}
      {changed && <p className="muted">No other way to ask this word, so it is a typing question.</p>}
      {actual === 'gap' && item.ko && <p lang="ko" className="quiz-card__hint">Hint: {item.ko}</p>}
      {actual === 'meaning' && sentenceFor(item) && (
        <p className="quiz-example">Example: {sentenceFor(item).text}</p>
      )}

      {actual === 'meaning' ? (
        <div className="options" role="radiogroup" aria-label="Choose the meaning">
          {options.list.map((o, i) => (
            <label key={o} className={`option${picked === i ? ' is-selected' : ''}${feedback && i === options.correct ? ' is-correct' : ''}${feedback && picked === i && i !== options.correct ? ' is-wrong' : ''}`}>
              <input type="radio" name="meaning" checked={picked === i} disabled={Boolean(feedback)} onChange={() => setPicked(i)} />
              <span lang="ko">{o}</span>
            </label>
          ))}
        </div>
      ) : (
        <label className="field quiz-input">
          <span className="visually-hidden">Your answer</span>
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={Boolean(feedback)} placeholder="Type your answer" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
        </label>
      )}

      {feedback && (
        <div className={`quiz-feedback ${feedback.correct ? 'quiz-feedback--ok' : 'quiz-feedback--no'}`} role="status">
          <strong>{feedback.correct ? 'Correct!' : 'Not quite.'}</strong> {feedback.note}
          <div>{item.word}{item.ko ? <> = <span lang="ko">{item.ko}</span></> : null}</div>
          {item.note && <div className="muted">{item.note}</div>}
          <div className="muted">{feedback.correct ? 'It will come back later.' : 'It comes back tomorrow.'}</div>
        </div>
      )}

      <div className="quiz-card__foot">
        {feedback ? (
          <span />
        ) : (
          <button type="button" className="btn btn--outline" onClick={() => onSkip(item) || onNext()}>Skip</button>
        )}
        {feedback ? (
          <button type="button" ref={nextRef} className="btn btn--primary" onClick={onNext}>{isLast ? 'See results' : 'Next question'}</button>
        ) : (
          <button type="submit" className="btn btn--primary">Check answer</button>
        )}
      </div>
    </form>
  );
}

export function Summary({ results, onAgain }) {
  const answered = results.filter((r) => !r.skipped);
  const right = answered.filter((r) => r.correct).length;
  return (
    <section className="card quiz-card">
      <h2 className="side-title">Quiz finished</h2>
      <p className="quiz-summary__score">{right} of {answered.length} correct</p>
      <ul className="due">
        {results.map((r) => (
          <li key={r.item.id} className="due__item">
            <span>{r.skipped ? '– ' : r.correct ? '✓ ' : '✗ '}{r.item.word}</span>
            <span className="muted">{r.skipped ? 'skipped' : `back ${whenText(r.next.nextAt)}`}</span>
          </li>
        ))}
      </ul>
      <div className="quiz-card__foot">
        <Link to="/notebook" className="btn btn--outline">My notebook</Link>
        <button type="button" className="btn btn--primary" onClick={onAgain}>Check for more due words</button>
      </div>
    </section>
  );
}
