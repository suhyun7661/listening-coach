import { Icon, PlayIcon } from '../components/Common';
import { competeSample as c } from '../data/sampleData';

export default function Compete() {
  return (
    <div className="page">
      <section className="room-banner" aria-label="Challenge room">
        <div>
          <p className="room-banner__small">Challenge room</p>
          <h1 className="room-banner__title">One sentence. Same rules. Best ear wins.</h1>
          <span className="room-banner__label">{c.label}</span>
        </div>
        <div className="room-banner__actions">
          <div className="room-code">
            <span>ROOM CODE</span>
            <strong>{c.code}</strong>
          </div>
          <button type="button" className="btn btn--ghost">Copy code</button>
          <button type="button" className="btn btn--white">Share link</button>
        </div>
      </section>

      <div className="compete-layout">
        <section className="card" aria-label="Your turn">
          <div className="turn-head">
            <h2>Your turn · Level {c.level} · {c.accent} accent</h2>
            <span className="timer"><Icon name="timer" /> {c.secondsLeft} left</span>
          </div>
          <ul className="rules">
            {c.rules.map((r) => <li key={r} className="pill pill--outline">{r}</li>)}
          </ul>

          <div className="play-box">
            <button type="button" className="btn btn--primary"><PlayIcon /> Play sentence</button>
            <span>{c.playsLeft} of 3 plays left</span>
            <span className="dots" aria-hidden="true"><i /><i /><i className="is-spent" /></span>
          </div>

          <p className="sentence">
            <span>Can</span> <span>I</span>
            <input className="blank is-filled" defaultValue="get" aria-label="Blank 1 of 3" size="5" />
            <span>you</span> <span>something</span>
            <input className="blank" aria-label="Blank 2 of 3" size="5" />
            <span>drink</span> <span>before</span> <span>the</span>
            <input className="blank" aria-label="Blank 3 of 3" size="5" />
            <span>closes?</span>
          </p>
          <div className="turn-foot">
            <button type="button" className="btn btn--submit btn--wide">Submit answer</button>
          </div>
        </section>

        <aside className="card" aria-labelledby="lb-h">
          <div className="lb-head">
            <h2 id="lb-h" className="side-title">Live leaderboard</h2>
            <span className="live"><i /> Live</span>
          </div>
          <table className="lb">
            <thead>
              <tr><th>#</th><th>Player</th><th>Score</th><th>Plays</th><th>Time</th></tr>
            </thead>
            <tbody>
              {c.players.map((p) => (
                <tr key={p.rank} className={p.best ? 'is-best' : ''}>
                  <td>{p.rank}</td><td lang="ko">{p.name}</td><td><strong>{p.score}</strong></td><td>{p.plays}</td><td>{p.time}</td>
                </tr>
              ))}
              <tr className="is-you">
                <td>–</td><td lang="ko">수현 (you)</td><td colSpan="3">Playing now</td>
              </tr>
            </tbody>
          </table>
          <p className="muted">Ties: fewer plays wins, then faster time.</p>
          <button type="button" className="btn btn--outline btn--block">Create a new challenge</button>
        </aside>
      </div>
    </div>
  );
}
