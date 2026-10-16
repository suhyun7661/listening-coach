import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import ErrorTagPicker from '../components/ErrorTagPicker';
import { Tag } from '../components/Common';
import { allBlanks, computeScore, finalTag, summarizeTags } from '../lib/errorTags';
import { isMiss } from '../lib/grading';
import { getAttempt, setUserTag } from '../lib/attempts';
import { useAuth } from '../lib/AuthContext';
import { addItems, itemsFromSentence } from '../lib/notebook';
import { playMessage, playSentence } from '../lib/audio';
import { getClip } from '../data/clips';

export default function Review() {
  const { attemptId } = useParams();
  const location = useLocation();
  const auth = useAuth();
  const [attempt, setAttempt] = useState(undefined); // undefined = loading, null = not found
  const [userTags, setUserTags] = useState({});
  const [showScript, setShowScript] = useState(false);
  const [tagError, setTagError] = useState('');
  const [saveNotes, setSaveNotes] = useState({}); // message under each Save button
  const [compare, setCompare] = useState(null); // sentence id whose Compare panel is open
  const [compareNote, setCompareNote] = useState('');

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
    return () => {
      alive = false;
    };
  }, [auth.loading, auth.user, attemptId]);

  const results = attempt?.results ?? [];
  const score = useMemo(() => computeScore(results), [results]);
  const almost = useMemo(() => allBlanks(results).filter((b) => b.status === 'almost').length, [results]);
  const counts = useMemo(() => summarizeTags(results, userTags), [results, userTags]);

  if (attempt === undefined) {
    return <div className="page"><p className="muted">Loading your report…</p></div>;
  }
  if (!attempt) {
    return (
      <div className="page">
        <h1 className="page__title">Review</h1>
        <p className="page__lead">{attemptId ? 'That report could not be found.' : 'There is nothing to review yet. Finish a practice clip and press “Submit clip for grading”.'}</p>
        <Link to="/history" className="btn btn--outline">All past reports</Link>{' '}
        <Link to="/" className="btn btn--primary">Go to the library</Link>
      </div>
    );
  }

  // The learner's choice is stored next to the automatic guess (userTag vs autoTag).
  async function setTag(blankId, tag) {
    const next = { ...userTags, [blankId]: tag };
    setUserTags(next);
    setTagError('');
    try {
      await setUserTag(auth.user, attempt, blankId, next);
    } catch {
      setTagError('Your tag change could not be saved. Please try again.');
    }
  }

  // Save the missed words of one sentence (or of every sentence) to the notebook.
  async function saveWords(key, rows) {
    if (!auth.user) return setSaveNotes((n) => ({ ...n, [key]: 'Sign in to save words to your notebook.' }));
    const items = rows.flatMap((r) => itemsFromSentence(r, attempt.clipId, userTags));
    if (!items.length) return setSaveNotes((n) => ({ ...n, [key]: 'No words to save here.' }));
    try {
      const added = await addItems(auth.user.id, items);
      const text = added ? `Saved ${added} new word${added > 1 ? 's' : ''} to your notebook.` : 'Already in your notebook.';
      return setSaveNotes((n) => ({ ...n, [key]: text }));
    } catch {
      return setSaveNotes((n) => ({ ...n, [key]: 'Could not save. Please try again.' }));
    }
  }

  // Plays the US or UK recording of one sentence.
  async function playCompare(row, accent) {
    const sentence = getClip(attempt.clipId)?.sentences.find((x) => x.id === row.sentenceId);
    if (!sentence) return;
    const result = await playSentence(attempt.clipId, sentence, accent);
    setCompareNote(playMessage(result, accent));
  }

  const nextLevel = Math.min(6, attempt.level + 1);

  return (
    <div className="page">
      <Link to={`/practice/${attempt.clipId}`} className="back-link">‹ Back to clip</Link>
      <h1 className="page__title">Review: {attempt.title}</h1>

      {location.state?.notSaved && (
        <p className="form__error" role="status">We could not save this report to your account, so it is only saved in this browser for now.</p>
      )}
      {tagError && <p className="form__error" role="alert">{tagError}</p>}

      <div className="review-top">
        <section className="score-card" aria-label="Your score">
          <span className="score-card__label">Your score</span>
          <span className="score-card__value">{score.percent}%</span>
          <span className="score-card__detail">{score.correct} of {score.total} blanks correct</span>
          {almost > 0 && <span className="score-card__sub">{almost} almost right (half a point each)</span>}
          <span className="score-card__sub">Level {attempt.level} · played at {attempt.speed}x</span>
        </section>

        <ErrorSummary counts={counts} />

        <section className="card" aria-labelledby="next-h">
          <h2 id="next-h" className="side-title">Next steps</h2>
          <div className="stack">
            <Link to="/vocab" className="btn btn--primary btn--block">Start vocab quiz</Link>
            <button type="button" className="btn btn--outline btn--block" onClick={() => saveWords('all', results)}>+ Save all missed words to notebook</button>
            {saveNotes.all && <p className="muted save-note" role="status">{saveNotes.all}</p>}
            <Link to="/history" className="btn btn--outline btn--block">All past reports</Link>
            <Link to="/progress" className="btn btn--outline btn--block">My progress</Link>
            <button type="button" className="btn btn--outline btn--block" aria-expanded={showScript} onClick={() => setShowScript(!showScript)}>
              Full script (English + Korean)
            </button>
            {attempt.level < 6 && (
              <Link to={`/practice/${attempt.clipId}?level=${nextLevel}`} className="btn btn--outline btn--block">Try again at Level {nextLevel}</Link>
            )}
          </div>
        </section>
      </div>

      {showScript && (
        <section className="card script" aria-label="Full script">
          <h2 className="side-title">Full script</h2>
          <ol className="script__list">
            {results.map((row) => (
              <li key={row.sentenceId}>
                <span>{row.text}</span>
                <span lang="ko" className="script__ko">{row.ko}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <h2 className="section-title">Sentence by sentence</h2>
      <div className="stack stack--lg">
        {results.map((row) => {
          const blanks = row.tokens.filter((t) => t.type === 'blank');
          const misses = blanks.filter(isMiss);
          const perfect = misses.length === 0 && !blanks.some((b) => b.status === 'almost');
          return (
            <article key={row.sentenceId} className="card review-row">
              <div className="review-row__main">
                <p className="review-row__en">
                  <span className="review-row__num">{String(row.number).padStart(2, '0')}</span>
                  {row.tokens.map((t) => {
                    if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
                    return (
                      <span key={t.index}>
                        {t.before}
                        {t.status === 'correct' && <span className="mark mark--ok">{t.answer}</span>}
                        {t.status === 'almost' && <span className="mark mark--almost" title={`You wrote "${t.userAnswer}"`}>{t.answer}</span>}
                        {isMiss(t) && (
                          <>
                            <s className="mark mark--wrong">{t.userAnswer.trim() || '(empty)'}</s>{' '}
                            <strong className="mark mark--ok">{t.answer}</strong>
                          </>
                        )}
                        {t.after}{' '}
                      </span>
                    );
                  })}
                </p>
                {row.ko && <p lang="ko" className="review-row__ko">{row.ko}</p>}
                {row.keyWords.map((kw) => (
                  <p key={kw.word} className="review-row__note">
                    <strong>{kw.word}</strong> = <span lang="ko">{kw.ko}</span>{kw.note ? `. ${kw.note}` : ''}
                  </p>
                ))}
                {misses.map((m) => (
                  <div key={m.blankId} className="review-row__miss">
                    <span>Why did you miss <strong>{m.answer}</strong>?</span>
                    <ErrorTagPicker autoTag={m.autoTag} value={userTags[m.blankId]} onChange={(tag) => setTag(m.blankId, tag)} word={m.answer} />
                  </div>
                ))}
              </div>
              <div className="review-row__side">
                {perfect ? (
                  <span className="tag tag--AC">Correct</span>
                ) : (
                  <div className="review-row__tags">
                    {misses.map((m) => <Tag key={m.blankId} id={finalTag(m, userTags)} />)}
                    {misses.length === 0 && <span className="tag tag--AC">Almost</span>}
                  </div>
                )}
                {compare === row.sentenceId && (
                  <div className="compare" role="group" aria-label="Compare accents">
                    <p className="muted">Listen to the same sentence in both accents.</p>
                    <div className="review-row__btns">
                      <button type="button" className="btn btn--secondary btn--small" onClick={() => playCompare(row, 'US')}>Play US</button>
                      <button type="button" className="btn btn--secondary btn--small" onClick={() => playCompare(row, 'UK')}>Play UK</button>
                    </div>
                    {compareNote && <p className="muted voice-note" role="status">{compareNote}</p>}
                  </div>
                )}
                <div className="review-row__btns">
                  <button type="button" className="btn btn--secondary btn--small" disabled title="Coming in a later stage">Replay</button>
                  <button type="button" className="btn btn--outline btn--small" aria-expanded={compare === row.sentenceId} onClick={() => { setCompare(compare === row.sentenceId ? null : row.sentenceId); setCompareNote(''); }}>Compare US / UK</button>
                </div>
                <button type="button" className="btn btn--outline btn--small btn--block" onClick={() => saveWords(row.sentenceId, [row])} disabled={perfect}>+ Save to notebook</button>
                {saveNotes[row.sentenceId] && <p className="muted save-note" role="status">{saveNotes[row.sentenceId]}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
