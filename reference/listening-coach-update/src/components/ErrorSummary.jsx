import { CATEGORIES, mainWeakness } from '../lib/errorTags';

export default function ErrorSummary({ counts }) {
  const max = Math.max(1, ...Object.values(counts));
  const main = mainWeakness(counts);
  const mainCategory = CATEGORIES.find((c) => c.id === main);

  return (
    <section className="lc-summary" aria-labelledby="lc-summary-title">
      <h2 id="lc-summary-title" className="lc-summary__title">Why you missed them</h2>
      <ul className="lc-summary__list">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="lc-summary__row">
            <span className={`lc-summary__name lc-text--${c.id}`}>
              {c.id} · {c.label}
            </span>
            <span className="lc-summary__track">
              <span className={`lc-summary__bar lc-bar--${c.id}`} style={{ width: `${(counts[c.id] / max) * 100}%` }} />
            </span>
            <span className="lc-summary__count">{counts[c.id]}</span>
          </li>
        ))}
      </ul>
      <p className="lc-summary__main">
        {mainCategory ? (
          <>
            Main weakness in this clip: <strong>{mainCategory.label} ({mainCategory.id})</strong>{' '}
            <span lang="ko">{mainCategory.ko}</span>
          </>
        ) : (
          'No missed words in this clip.'
        )}
      </p>
    </section>
  );
}
