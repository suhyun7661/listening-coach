import { Link } from 'react-router-dom';
import { Icon } from '../../components/Common';
import { computeScore } from '../../lib/errorTags';

// Step 4: the score and a button to the Review Report.
export default function ResultsStep({ results, saved, onAgain }) {
  const score = computeScore(results);
  const praise = score.percent >= 80 ? 'Great job!' : score.percent >= 50 ? 'Good effort!' : 'Keep practicing!';

  return (
    <div className="page results">
      <div className="results__check" aria-hidden="true"><Icon name="check" /></div>
      <h1 className="results__score">{score.correct} / {score.total} correct</h1>
      <p className="results__praise">{praise}</p>

      {saved.error && <p className="form__error" role="status">{saved.error}</p>}

      <div className="results__actions">
        {saved.id ? (
          <Link to={`/review/${saved.id}`} className="btn btn--primary btn--lg">
            <span>View Review Report</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button type="button" className="btn btn--primary btn--lg" disabled>
            <span>Saving your report…</span>
          </button>
        )}
        <Link to="/compete" className="btn btn--outline btn--lg">
          <span>Try Compete Mode</span>
          <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="linklike" onClick={onAgain}>Practice again</button>
      </div>
    </div>
  );
}
