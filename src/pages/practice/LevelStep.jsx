import { Icon } from '../../components/Common';

const LEVELS = [
  { id: 1, name: 'Easy', icon: 'leaf', blanks: '1–2 blanks per sentence', hints: 'Hints: Korean meaning, first letter + letter count' },
  { id: 2, name: 'Intermediate', icon: 'bars', blanks: 'Key expressions and hard-to-catch words', hints: 'Hints: Korean meaning of the expression, word and letter count' },
  { id: 3, name: 'Hard', icon: 'diamond', blanks: 'Expressions plus more words (up to 6)', hints: 'No hints' },
];

// Step 2: pick a level. The choice is not remembered: you pick again every visit.
export default function LevelStep({ onPick, onBack }) {
  return (
    <div className="page">
      <button type="button" className="back-link back-link--button" onClick={onBack}>‹ Back to the video</button>
      <h1 className="page__title">Choose your level</h1>
      <p className="page__lead">Pick a level that matches your confidence.</p>

      <ul className="level-grid">
        {LEVELS.map((l) => (
          <li key={l.id}>
            <button type="button" className="level-card" onClick={() => onPick(l.id)}>
              <span className="level-card__icon" aria-hidden="true"><Icon name={l.icon} /></span>
              <strong className="level-card__name">{l.name}</strong>
              <span className="level-card__blanks">{l.blanks}</span>
              <span className="level-card__hints">{l.hints}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
