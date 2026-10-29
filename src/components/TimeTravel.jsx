import { getDayOffset, reviewNow, setDayOffset } from '../lib/testClock';

// Test-only bar (Layout shows it only under `npm run dev`).
// The buttons add to the pretend date, then reload so every page re-reads it.
export default function TimeTravel() {
  const offset = getDayOffset();
  const date = reviewNow().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  function go(days) {
    setDayOffset(days === 0 ? 0 : offset + days);
    window.location.reload();
  }

  return (
    <aside className="timetravel" aria-label="Time travel (test only)">
      <p className="timetravel__date">
        <strong>Test date: {offset ? `${date} (+${offset} day${offset === 1 ? '' : 's'})` : `${date} (today)`}</strong>
        <span className="muted"> · test only, review dates only</span>
      </p>
      <div className="timetravel__buttons">
        <button type="button" className="btn btn--outline btn--small" onClick={() => go(1)}>+1 day</button>
        <button type="button" className="btn btn--outline btn--small" onClick={() => go(3)}>+3 days</button>
        <button type="button" className="btn btn--outline btn--small" onClick={() => go(7)}>+7 days</button>
        <button type="button" className="btn btn--outline btn--small" onClick={() => go(0)} disabled={!offset}>Back to today</button>
      </div>
    </aside>
  );
}
