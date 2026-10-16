import { CATEGORIES } from '../lib/errorTags';

// Shows the five categories. The automatic guess is preselected and marked;
// one tap changes it.
export default function ErrorTagPicker({ autoTag, value, onChange, word }) {
  const selected = value ?? autoTag;
  return (
    <div className="lc-tagpicker" role="radiogroup" aria-label={`Why did you miss "${word}"?`}>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={selected === c.id}
          className={`lc-tag lc-tag--${c.id}${selected === c.id ? ' is-selected' : ''}`}
          title={`${c.label}: ${c.description}`}
          onClick={() => onChange(c.id)}
        >
          <span className="lc-tag__id">{c.id}</span>
          <span className="lc-tag__label">{c.label}</span>
          {autoTag === c.id && <span className="lc-tag__guess">suggested</span>}
        </button>
      ))}
    </div>
  );
}
