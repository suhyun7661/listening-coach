import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from '../components/Common';
import { removeItem } from '../lib/notebook';
import { isDue, stepLabel, whenText } from '../lib/spaced';
import { useNotebook } from '../lib/useNotebook';
import { getClip } from '../data/clips';

// Words and expressions saved from your own mistakes, with when each one is next reviewed.
export default function Notebook() {
  const { items, loading, error, reload, user } = useNotebook();
  const [problem, setProblem] = useState('');
  const dueCount = items.filter((i) => isDue(i)).length;

  async function remove(item) {
    if (!window.confirm(`Remove “${item.word}” from your notebook?`)) return;
    try {
      await removeItem(item.id);
      setProblem('');
      reload();
    } catch {
      setProblem('Could not remove it. Please try again.');
    }
  }

  return (
    <div className="page">
      <h1 className="page__title">Notebook</h1>
      <p className="page__lead">Words and expressions you saved from your own mistakes.</p>

      {!user && !loading ? (
        <div className="card">
          <p>Sign in to keep a notebook. It saves the words you miss and brings them back for review after 1, 3 and 7 days.</p>
          <Link to="/login" state={{ from: '/notebook' }} className="btn btn--primary">Sign in</Link>
        </div>
      ) : (
        <>
          {error && <p className="form__error" role="alert">{error}</p>}
          {problem && <p className="form__error" role="alert">{problem}</p>}
          {loading ? (
            <p className="muted">Loading your notebook…</p>
          ) : items.length === 0 ? (
            <div className="card">
              <p>Your notebook is empty. After you grade a clip, press “Save to notebook” on a sentence you missed words in.</p>
              <Link to="/" className="btn btn--primary">Go to the library</Link>
            </div>
          ) : (
            <>
              <p className="notebook-bar">
                <span>{items.length} word{items.length > 1 ? 's' : ''} saved · <strong>{dueCount} due now</strong></span>
                <Link to="/vocab" className="btn btn--primary">{dueCount ? 'Start vocab quiz' : 'Open vocab quiz'}</Link>
              </p>
              <ul className="stack">
                {items.map((n) => (
                  <li key={n.id} className="card note-item">
                    <div>
                      <p className="note-item__word">{n.word}</p>
                      {n.ko && <p lang="ko" className="note-item__ko">{n.ko}</p>}
                      <p className="muted">From: {getClip(n.clipId)?.title ?? 'a clip'}</p>
                    </div>
                    <div className="note-item__side">
                      {n.tag && <Tag id={n.tag} />}
                      <span className="muted">{stepLabel(n.step)} · next review {whenText(n.nextAt)}</span>
                      <button type="button" className="btn btn--outline btn--small" onClick={() => remove(n)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
