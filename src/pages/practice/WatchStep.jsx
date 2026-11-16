import ClipVideo from '../../components/ClipVideo';
import { Icon } from '../../components/Common';

// Step 1: watch the whole video. The levels unlock after it has played to the end once.
export default function WatchStep({ clip, watched, onWatched, onContinue }) {
  return (
    <div className="page">
      <h1 className="page__title">Watch first</h1>
      <p className="page__lead">Watch the whole video once. Then you can choose a level.</p>

      <ClipVideo clip={clip} subtitleModes={['off', 'ko']} onEnded={onWatched} />

      <div className={`notice${watched ? ' notice--ok' : ''}`} role="status">
        <span className="notice__icon" aria-hidden="true"><Icon name={watched ? 'check' : 'lock'} /></span>
        <div>
          <strong>{watched ? 'You’ve finished watching!' : 'Watch the full video to unlock the practice levels.'}</strong>
          {watched && <p className="muted">Now you can unlock the practice levels.</p>}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn btn--primary btn--lg" disabled={!watched} onClick={onContinue}>
          <span>Choose your level</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
