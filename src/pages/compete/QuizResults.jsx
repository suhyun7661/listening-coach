import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPETITORS } from '../../data/compete-quiz';
import { buildLeaderboard, ordinal, resultMessages, scoreQuiz } from '../../lib/quiz';
import { getCompetitors, getMyResult, saveMyResult } from '../../lib/quizDb';
import { useAuth } from '../../lib/AuthContext';

// Step 3: your score, short messages, and the leaderboard (you + 5 fixed fictional competitors).
// Only your LATEST result is stored: it overwrites the previous one.
export default function QuizResults({ answers, onAgain, onStudy }) {
  const { user, profile } = useAuth();
  const result = useMemo(() => scoreQuiz(answers), [answers]);
  const [competitors, setCompetitors] = useState(null);
  const [previous, setPrevious] = useState(undefined); // undefined = still loading
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const [comps, prev] = await Promise.all([getCompetitors(), getMyResult(user)]);
      setCompetitors(comps);
      setPrevious(prev ? prev.score : null); // read BEFORE it is overwritten
      await saveMyResult(user, { ...result, answers });
    })();
  }, [user, result, answers]);

  const ready = competitors !== null && previous !== undefined;
  const list = ready ? competitors : COMPETITORS;
  const name = profile?.display_name || 'You';
  const board = buildLeaderboard(list, result.score, name);
  const me = board.find((p) => p.me);
  const messages = ready ? resultMessages({ score: result.score, total: result.total, previous, competitors: list }) : [];

  return (
    <div className="page results">
      <h1 className="results__score">{result.score} / {result.total}</h1>
      <p className="results__praise">{result.percent}% accuracy · You are {ordinal(me.rank)} of {board.length}</p>

      {messages.length > 0 && (
        <ul className="messages" role="status">
          {messages.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}

      <table className="board">
        <caption className="visually-hidden">Leaderboard</caption>
        <thead>
          <tr><th scope="col">Rank</th><th scope="col">Name</th><th scope="col">Score</th></tr>
        </thead>
        <tbody>
          {board.map((p) => (
            <tr key={p.name + p.me} className={p.me ? 'is-me' : ''} aria-current={p.me ? 'true' : undefined}>
              <td>{ordinal(p.rank)}</td>
              <td>{p.name}{p.me && <span className="board__label">Latest Result</span>}</td>
              <td>{p.score} / {result.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">The other five are fictional benchmark players. Only your latest result is saved.</p>

      <div className="results__actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onAgain}>
          <span>Try again</span>
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn btn--outline btn--lg" onClick={onStudy}>
          <span>Study the expressions</span>
        </button>
        <Link to="/practice" className="linklike">Back to Practice</Link>
      </div>
    </div>
  );
}
