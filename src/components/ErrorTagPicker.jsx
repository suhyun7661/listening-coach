import { CATEGORIES } from '../lib/errorTags';

// Shows all five categories. The automatic guess is preselected and marked "suggested";
// one tap changes it.
export default function ErrorTagPicker({ autoTag, value, onChange, word }) {
  const selected = value ?? autoTag;
  return (
    <div className="tagpicker" role="radiogroup" aria-label={`Why did you miss "${word}"?`}>
      {CATEGORIES.map((c) => {
        const on = selected === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`tagpick${on ? ` is-selected tag--${c.id}` : ''}`}
            title={`${c.label}: ${c.description}`}
            onClick={() => onChange(c.id)}
          >
            <span>{c.id}</span>
            <span className="tagpick__label">{c.label}</span>
            {autoTag === c.id && <small>suggested</small>}
          </button>
        );
      })}
    </div>
  );
}
