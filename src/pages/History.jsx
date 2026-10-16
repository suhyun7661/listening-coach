import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import { Tag } from '../components/Common';
import { useAuth } from '../lib/AuthContext';
import { countBrowserReports, importBrowserReports } from '../lib/attempts';
import { useAttempts } from '../lib/useAttempts';

// Every report you have finished, newest first, plus the totals added up over all of them.
export default function History() {
  const { user } = useAuth();
  const { attempts, totals, loading, error, reload } = useAttempts();
  const [waiting, setWaiting] = useState(false);
  const [notice, setNotice] = useState('');
  const browserCount = user ? countBrowserReports() : 0;

  async function moveToAccount() {
    setWaiting(true);
    const moved = await importBrowserReports(user);
    setWaiting(false);
    setNotice(moved ? `Moved ${moved} report${moved > 1 ? 's' : ''} to your account.` : 'Could not move the reports. Please try again.');
    reload();
  }

  return (
    <div className="page">
      <h1 className="page__title">Past reports</h1>
      <p className="page__lead">
        {user ? 'Your reports are saved in your account, so you can open them on any device.' : (
          <>Reports are saved in this browser only. <Link to="/login">Sign in</Link> to keep them in your account.</>
        )}
      </p>

      {browserCount > 0 && (
        <div className="card history-move">
          <p>You have {browserCount} report{browserCount > 1 ? 's' : ''} saved only in this browser.</p>
          <button type="button" className="btn btn--primary" onClick={moveToAccount} disabled={waiting}>
            {waiting ? 'Moving…' : 'Move them to my account'}
          </button>
        </div>
      )}
      {notice && <p className="form__notice" role="status">{notice}</p>}
      {error && <p className="form__error" role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Loading your reports…</p>
      ) : attempts.length === 0 ? (
        <div className="card">
          <p>No reports yet. Finish a practice clip and press “Submit clip for grading”.</p>
          <Link to="/" className="btn btn--primary">Go to the library</Link>
        </div>
      ) : (
        <>
          <ErrorSummary counts={totals} title={`All ${attempts.length} reports added up`} scope="across all reports" />
          <p><Link to="/progress" className="btn btn--outline">See my progress charts</Link></p>
          <h2 className="section-title history-title">Your reports</h2>
          <ul className="stack">
            {attempts.map((r) => (
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
