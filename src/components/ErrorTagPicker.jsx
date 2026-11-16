import { CATEGORIES } from '../lib/errorTags';

// The four categories for ONE mistaken sentence.
//   suggested = the app's first diagnosis (marked "suggested", never final)
//   confirmed = the category the learner chose (the final one); empty until they tap one
// One tap confirms a category. Tapping another one changes it.
export default function ErrorTagPicker({ suggested, confirmed, onChange, label }) {
  return (
    <div className="tagpicker" role="radiogroup" aria-label={label}>
      {CATEGORIES.map((c) => {
        const on = confirmed === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`tagpick${on ? ` is-selected tag--${c.id}` : ''}${!confirmed && suggested === c.id ? ' is-suggested' : ''}`}
            title={`${c.label}: ${c.description}`}
            onClick={() => onChange(c.id)}
          >
            <span>{c.label}</span>
            {suggested === c.id && <small>suggested</small>}
          </button>
        );
      })}
    </div>
  );
}
