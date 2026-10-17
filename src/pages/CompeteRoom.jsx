import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import HintedBlank from '../components/HintedBlank';
import { Icon, PlayIcon } from '../components/Common';
import { getClip } from '../lib/clipStore';
import { playMessage, playSentence } from '../lib/audio';
import { useAuth } from '../lib/AuthContext';
import { formatCode, formatTime, getStatus, openRoom, playRun, rankResults, roomTokens, startRun, submitRun } from '../lib/compete';
import { gradeAnswer } from '../lib/grading';
import { useRoomBoard } from '../lib/useRoomBoard';

const RULES = ['1x speed only', 'Max 3 plays', '60 seconds', 'No hints or translation', 'One attempt'];

export default function CompeteRoom() {
  const { code } = useParams();
  const auth = useAuth();
  const [room, setRoom] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (auth.loading || !auth.user) return undefined;
    let alive = true;
    openRoom(code)
      .then((r) => alive && setRoom(r))
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [auth.loading, auth.user, code]);

  if (auth.loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!auth.user) return <Navigate to="/login" state={{ from: `/compete/${code}` }} replace />;
  if (loadError) {
    return (
      <div className="page page--narrow">
        <h1 className="page__title">Room not found</h1>
        <p className="page__lead">{loadError}</p>
        <Link to="/compete" className="btn btn--primary">Back to Compete</Link>
      </div>
    );
  }
  if (!room) return <div className="page"><p className="muted">Opening the room…</p></div>;
  return <Room key={room.id} room={room} user={auth.user} />;
}

function Room({ room, user }) {
  const clip = getClip(room.clip_id);
  const sentence = clip?.sentences.find((s) => s.id === room.sentence_id);
  const tokens = useMemo(() => roomTokens(sentence?.text ?? '', room.blank_indexes), [sentence, room.blank_indexes]);
  const blankCount = room.blank_indexes.length;

  const { board, live, reload } = useRoomBoard(room.id);

  const [phase, setPhase] = useState('loading'); // loading | ready | running | done
  const [plays, setPlays] = useState(0);
  const [left, setLeft] = useState(room.time_limit_seconds);
  const [answers, setAnswers] = useState(() => Array(blankCount).fill(''));
  const [result, setResult] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const endAt = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitting = useRef(false);
  const inputs = useRef([]);

  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      setResult(await submitRun(room.id, answersRef.current));
      setPhase('done');
      reload();
    } catch (e) {
      setNote(e.message);
      submitting.current = false;
    }
  }, [room.id, reload]);
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Where am I? (Also what happens after a refresh in the middle of a run.)
  useEffect(() => {
    let alive = true;
    getStatus(room.id)
      .then((st) => {
        if (!alive) return;
        setPlays(st.plays);
        if (st.finished) return setPhase('done');
        if (!st.started) return setPhase('ready');
        const remaining = st.time_limit_seconds * 1000 - (Date.parse(st.now) - Date.parse(st.started_at));
        if (remaining <= 0) {
          setPhase('running');
          return submitRef.current();
        }
        endAt.current = performance.now() + remaining;
        return setPhase('running');
      })
      .catch((e) => alive && setNote(e.message));
    return () => {
      alive = false;
    };
  }, [room.id]);

  // The countdown. When it reaches zero the answers are sent automatically.
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const tick = () => {
      const ms = endAt.current - performance.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0) submitRef.current();
    };
    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running') inputs.current[0]?.focus();
  }, [phase]);

  async function start() {
    setBusy(true);
    setNote('');
    try {
      const st = await startRun(room.id);
      const remaining = st.time_limit_seconds * 1000 - (Date.parse(st.now) - Date.parse(st.started_at));
      endAt.current = performance.now() + remaining;
      setPlays(st.plays);
      setPhase('running');
    } catch (e) {
      setNote(e.message);
    }
    setBusy(false);
  }

  async function play() {
    setBusy(true);
    setNote('');
    try {
      const st = await playRun(room.id); // the server counts the play first
      setPlays(st.plays);
      const heard = await playSentence(clip.id, sentence, clip.accent);
      setNote(playMessage(heard, clip.accent));
    } catch (e) {
      setNote(e.message);
    }
    setBusy(false);
  }

  function setAnswer(i, value) {
    setAnswers((prev) => prev.map((a, n) => (n === i ? value : a)));
  }

  function onKey(e, i) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    inputs.current[i + 1]?.focus();
  }

  async function copy(text, what) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setNote('Could not copy. Please select and copy it by hand.');
    }
  }

  const mine = result ?? board?.results.find((r) => r.user_id === user.id) ?? null;
  const maxPlays = room.max_plays;
  let blankNumber = -1;
  inputs.current = [];

  return (
    <div className="page">
      <section className="room-banner" aria-label="Challenge room">
        <div>
          <p className="room-banner__small">Challenge room</p>
          <h1 className="room-banner__title">One sentence. Same rules. Best ear wins.</h1>
          {room.label && <span className="room-banner__label">{room.label}</span>}
        </div>
        <div className="room-banner__actions">
          <div className="room-code">
            <span>ROOM CODE</span>
            <strong>{formatCode(room.room_code)}</strong>
          </div>
          <button type="button" className="btn btn--ghost" onClick={() => copy(room.room_code, 'code')}>{copied === 'code' ? 'Copied!' : 'Copy code'}</button>
          <button type="button" className="btn btn--white" onClick={() => copy(`${window.location.origin}/compete/${room.room_code}`, 'link')}>{copied === 'link' ? 'Link copied!' : 'Share link'}</button>
        </div>
      </section>

      <div className="compete-layout">
        <section className="card" aria-label="Your turn">
          <div className="turn-head">
            <h2>Level {room.level} · {clip?.accent} accent</h2>
            {phase === 'running' && (
              <span className={`timer${left <= 10 ? ' timer--low' : ''}`} role="timer"><Icon name="timer" /> {formatTime(left * 1000)} left</span>
            )}
          </div>
          <ul className="rules">
            {RULES.map((r) => <li key={r} className="pill pill--outline">{r}</li>)}
          </ul>
          {note && <p className="form__error" role="status">{note}</p>}

          {phase === 'loading' && <p className="muted">Checking your place in the room…</p>}

          {phase === 'ready' && (
            <div className="room-ready">
              <p>The {room.time_limit_seconds} seconds start the moment you press Start, and you only get one attempt.</p>
              <button type="button" className="btn btn--primary btn--wide" onClick={start} disabled={busy}>Start</button>
            </div>
          )}

          {phase === 'running' && (
            <>
              <div className="play-box">
                <button type="button" className="btn btn--primary" onClick={play} disabled={busy || plays >= maxPlays}><PlayIcon /> Play sentence</button>
                <span>{maxPlays - plays} of {maxPlays} plays left</span>
                <span className="dots" aria-hidden="true">
                  {Array.from({ length: maxPlays }, (_, i) => <i key={i} className={i < plays ? 'is-spent' : ''} />)}
                </span>
              </div>
              <p className="muted">Practice audio for now. Your real clip video will play here once it is added.</p>
              <p className="sentence">
                {tokens.map((t) => {
                  if (t.type === 'text') return <span key={t.index}>{t.raw}</span>;
                  blankNumber += 1;
                  const n = blankNumber;
                  return (
                    <span key={t.index} className="sentence__word">
                      {t.before}
                      <HintedBlank
                        ref={(el) => { inputs.current[n] = el; }}
                        blank={t}
                        value={answers[n] ?? ''}
                        onChange={(v) => setAnswer(n, v)}
                        onKeyDown={(e) => onKey(e, n)}
                        label={`Blank ${n + 1} of ${blankCount}`}
                      />
                      {t.after}
                    </span>
                  );
                })}
              </p>
              <div className="turn-foot">
                <button type="button" className="btn btn--submit btn--wide" onClick={submit}>Submit answer</button>
              </div>
            </>
          )}

          {phase === 'done' && <MyResult mine={mine} tokens={tokens} sentence={sentence} />}
        </section>

        <Leaderboard board={board} live={live} me={user.id} phase={phase} />
      </div>
    </div>
  );
}

function MyResult({ mine, tokens, sentence }) {
  if (!mine) return <p className="muted">Saving your result…</p>;
  const given = Array.isArray(mine.answers) ? mine.answers : [];
  let n = -1;
  return (
    <div className="room-done">
      <p className="room-done__score">{Number(mine.accuracy)}%</p>
      <p>{Number(mine.correct_blanks)} of {mine.total_blanks} points · {mine.plays} play{mine.plays === 1 ? '' : 's'} · {formatTime(mine.elapsed_ms)}</p>
      <p className="review-row__en">
        {tokens.map((t) => {
          if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
          n += 1;
          const mark = gradeAnswer(given[n] ?? '', t.word);
          return (
            <span key={t.index}>
              {t.before}
              {mark.status === 'correct' && <span className="mark mark--ok">{t.word}</span>}
              {mark.status === 'almost' && <span className="mark mark--almost" title={`You wrote "${given[n]}"`}>{t.word}</span>}
              {(mark.status === 'wrong' || mark.status === 'empty') && (
                <>
                  <s className="mark mark--wrong">{(given[n] ?? '').trim() || '(empty)'}</s>{' '}
                  <strong className="mark mark--ok">{t.word}</strong>
                </>
              )}
              {t.after}{' '}
            </span>
          );
        })}
      </p>
      {sentence?.ko && <p lang="ko" className="review-row__ko">{sentence.ko}</p>}
      <p className="muted">Your result is final. See where you rank on the leaderboard.</p>
      <Link to="/compete" className="btn btn--outline">Back to Compete</Link>
    </div>
  );
}

function Leaderboard({ board, live, me, phase }) {
  const ranked = board ? rankResults(board.results) : [];
  const finished = new Set(ranked.map((r) => r.user_id));
  const waiting = board ? board.members.filter((m) => !finished.has(m.user_id)) : [];
  const nameOf = (id) => `${board?.names[id] ?? 'Player'}${id === me ? ' (you)' : ''}`;

  return (
    <aside className="card" aria-labelledby="lb-h">
      <div className="lb-head">
        <h2 id="lb-h" className="side-title">Live leaderboard</h2>
        <span className={`live${live ? '' : ' live--off'}`}><i /> {live ? 'Live' : 'Updating'}</span>
      </div>
      {!board ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="lb">
          <thead>
            <tr><th>#</th><th>Player</th><th>Score</th><th>Plays</th><th>Time</th></tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.id} className={`${i === 0 ? 'is-best' : ''}${r.user_id === me ? ' is-me' : ''}`}>
                <td>{i + 1}</td>
                <td lang="ko">{nameOf(r.user_id)}</td>
                <td><strong>{Number(r.accuracy)}%</strong></td>
                <td>{r.plays}</td>
                <td>{formatTime(r.elapsed_ms)}</td>
              </tr>
            ))}
            {waiting.map((m) => (
              <tr key={m.user_id} className="is-you">
                <td>–</td>
                <td lang="ko">{nameOf(m.user_id)}</td>
                <td colSpan="3">{m.user_id === me ? (phase === 'running' ? 'Playing now' : 'Not started') : 'Not finished'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted">Ties: fewer plays wins, then faster time.</p>
      <Link to="/compete" className="btn btn--outline btn--block">Create a new challenge</Link>
    </aside>
  );
}
