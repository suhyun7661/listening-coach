import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clips, getClip } from '../data/clips';
import { useAuth } from '../lib/AuthContext';
import { cleanCode, createRoom, formatCode, joinRoom, listMyRooms } from '../lib/compete';

// Start a challenge room, join one with a code, or reopen a recent one.
export default function CompeteHome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [clipId, setClipId] = useState(clips[0].id);
  const [sentenceId, setSentenceId] = useState('random');
  const [level, setLevel] = useState(4);
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const clip = getClip(clipId);

  useEffect(() => {
    if (user) listMyRooms().then(setRooms).catch(() => {});
  }, [user]);

  async function create(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const sentence = sentenceId === 'random'
        ? clip.sentences[Math.floor(Math.random() * clip.sentences.length)]
        : clip.sentences.find((s) => s.id === sentenceId);
      const room = await createRoom({ clip, sentence, level, label });
      navigate(`/compete/${room.room_code}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function join(e) {
    e.preventDefault();
    setError('');
    if (code.length !== 6) return setError('A room code has 6 digits.');
    setBusy(true);
    try {
      const room = await joinRoom(code);
      return navigate(`/compete/${room.room_code}`);
    } catch (err) {
      setBusy(false);
      return setError(err.message);
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;

  if (!user) {
    return (
      <div className="page page--narrow">
        <h1 className="page__title">Compete</h1>
        <p className="page__lead">One sentence, same rules for everyone, live ranking.</p>
        <div className="card">
          <p>Sign in to create a challenge room or join your friends. We need to know who is who on the leaderboard.</p>
          <Link to="/login" state={{ from: '/compete' }} className="btn btn--primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">Compete</h1>
      <p className="page__lead">One sentence, same blanks, same rules for everyone. Best ear wins.</p>
      {error && <p className="form__error" role="alert">{error}</p>}

      <div className="compete-home">
        <form className="card form" onSubmit={create}>
          <h2 className="side-title">Create a challenge</h2>
          <label className="field">
            <span>Clip</span>
            <select value={clipId} onChange={(e) => { setClipId(e.target.value); setSentenceId('random'); }}>
              {clips.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.accent})</option>)}
            </select>
          </label>
          <label className="field">
            <span>Sentence</span>
            <select value={sentenceId} onChange={(e) => setSentenceId(e.target.value)}>
              <option value="random">A random sentence (a surprise for you too)</option>
              {clip.sentences.map((s, i) => <option key={s.id} value={s.id}>Sentence {i + 1}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Level (how many blanks)</span>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Level {n}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Label (optional, just text)</span>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Loser buys lunch" />
            <small className="muted">The app never handles money. This is only a note for your friends.</small>
          </label>
          <p className="muted">Rules for everyone: 1x speed only, 3 plays, 60 seconds, no hints, no translation, one attempt.</p>
          <button type="submit" className="btn btn--primary" disabled={busy}>Create room</button>
        </form>

        <div className="stack stack--lg">
          <form className="card form" onSubmit={join}>
            <h2 className="side-title">Join with a code</h2>
            <label className="field">
              <span>Room code (6 digits)</span>
              <input type="text" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} placeholder="482615" />
            </label>
            <button type="submit" className="btn btn--secondary" disabled={busy}>Join room</button>
          </form>

          {rooms.length > 0 && (
            <section className="card" aria-labelledby="rooms-h">
              <h2 id="rooms-h" className="side-title">Your recent rooms</h2>
              <ul className="due">
                {rooms.map((r) => (
                  <li key={r.id}>
                    <Link to={`/compete/${r.room_code}`} className="due__item room-link">
                      <span>{formatCode(r.room_code)}{r.label ? ` · ${r.label}` : ''}</span>
                      <span className="muted">Level {r.level}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
