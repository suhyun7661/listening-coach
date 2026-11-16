import { CATEGORIES, mainWeakness } from '../lib/errorTags';

// The five categories as bars, with the main weakness underneath.
export default function ErrorSummary({ counts, title = 'Why you missed them', scope = 'in this clip' }) {
  const max = Math.max(1, ...Object.values(counts));
  const main = mainWeakness(counts);
  const mainCategory = CATEGORIES.find((c) => c.id === main);

  return (
    <section className="card" aria-labelledby="why-h">
      <h2 id="why-h" className="side-title">{title}</h2>
      <ul className="bars">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="bars__row">
            <span className={`bars__name text--${c.id}`}>{c.label}</span>
            <span className="bars__track">
              <span className={`bars__fill fill--${c.id}`} style={{ width: `${(counts[c.id] / max) * 100}%` }} />
            </span>
            <span className="bars__count">{counts[c.id]}</span>
          </li>
        ))}
      </ul>
      <p className="bars__main">
        {mainCategory ? (
          <>Main weakness {scope}: <strong>{mainCategory.label}</strong> <span lang="ko">{mainCategory.ko}</span></>
        ) : (
          `No missed words ${scope}.`
        )}
      </p>
    </section>
  );
}
