import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PlayIcon, Icon } from '../components/Common';
import { categoryNames, sourceLabel } from '../data/sampleData';
import { getClips } from '../lib/clipStore';
import { formatTime } from '../lib/usePracticePlayer';
import { CATEGORIES } from '../lib/errorTags';
import { useAttempts } from '../lib/useAttempts';

const TILE_ORDER = ['SP', 'V', 'CS', 'AC', 'MI'];

// Every clip gets its own bright colour (the sample clips keep theirs).
const PALETTE = ['#5b3df5', '#2f7beb', '#12a57c', '#8b44ee', '#0e9aa7', '#3d5afe', '#d9488a', '#e07a1f'];
const SAMPLE_COLORS = { 'holiday-pub-01': '#5b3df5', 'intern-01': '#2f7beb', 'cafe-01': '#12a57c', 'interview-01': '#8b44ee', 'directions-01': '#0e9aa7' };
const colorFor = (id) => SAMPLE_COLORS[id] ?? PALETTE[[...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % PALETTE.length];

function Chips({ label, options, value, onChange }) {
  return (
    <div className="filter">
      <span className="filter__label" id={`f-${label}`}>{label}</span>
      <div className="filter__chips" role="group" aria-labelledby={`f-${label}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip${value === o.value ? ' is-selected' : ''}`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Library() {
  const clips = getClips().map((c) => ({
    id: c.id, title: c.title, source: c.source, accent: c.accent, level: c.difficulty,
    length: formatTime(c.sentences[c.sentences.length - 1].end), color: colorFor(c.id),
    // Everything the search box can find: the title, the key expressions (and their Korean) and the sentences.
    searchText: [
      c.title,
      ...c.sentences.flatMap((s) => [s.text, ...(s.keyWords ?? []).flatMap((k) => [k.word, k.ko])]),
    ].join(' ').toLowerCase(),
  }));
  const { attempts, totals, main, loading } = useAttempts();
  const mainCategory = CATEGORIES.find((c) => c.id === main);
  const [level, setLevel] = useState('all');
  const [accent, setAccent] = useState('all');
  const [source, setSource] = useState('all');
  const [query, setQuery] = useState('');

  const words = query.trim().toLowerCase();
  const shown = clips.filter(
    (c) =>
      (level === 'all' || c.level === level) &&
      (accent === 'all' || c.accent === accent) &&
      (source === 'all' || c.source === source) &&
      (!words || c.searchText.includes(words))
  );
  const filtered = level !== 'all' || accent !== 'all' || source !== 'all' || words !== '';
  const clearFilters = () => {
    setLevel('all');
    setAccent('all');
    setSource('all');
    setQuery('');
  };

  return (
    <div className="page">
      <div className="home-top">
        <section className="card welcome" aria-labelledby="welcome-h">
          <p className="welcome__small">
            {attempts.length ? `Based on your ${attempts.length} saved report${attempts.length > 1 ? 's' : ''}` : 'Your weak spots will show up here'}
          </p>
          <h1 id="welcome-h" className="welcome__title">
            {loading ? (
              'Loading your results…'
            ) : mainCategory ? (
              <>Welcome back. Your main weakness is <span className={`text--${main}`}>{mainCategory.label.toLowerCase()} ({main})</span>.</>
            ) : attempts.length ? (
              'Welcome back. You have no missed words so far. Great listening!'
            ) : (
              'Welcome! Practice one clip and we will find your main weakness.'
            )}
          </h1>
          <ul className="weakness">
            {TILE_ORDER.map((id) => (
              <li key={id} className={`weakness__item tag--${id}`}>
                <span className="weakness__num">{totals[id]}</span>
                <span className="weakness__name">{id} · {categoryNames[id]}</span>
              </li>
            ))}
          </ul>
          <p className="welcome__links">
            <Link to="/history" className="welcome__link">See your past reports</Link>
            <Link to="/progress" className="welcome__link">See your progress</Link>
          </p>
        </section>

        <section className="mode-panel" aria-labelledby="mode-h">
          <h2 id="mode-h" className="mode-panel__title">Choose a mode</h2>
          <Link to="/practice" className="mode mode--practice">
            <Icon name="pencil" />
            <span>
              <strong>Practice mode</strong>
              <span>Full clip dictation with speed control and hints</span>
            </span>
          </Link>
          <Link to="/compete" className="mode mode--compete">
            <Icon name="trophy" />
            <span>
              <strong>Competing mode</strong>
              <span>One sentence, same rules, live ranking</span>
            </span>
          </Link>
        </section>
      </div>

      <div className="library-head">
        <h2 className="section-title">Clip library</h2>
        <label className="search">
          <Icon name="search" />
          <span className="visually-hidden">Search clips or expressions</span>
          <input type="search" placeholder="Search clips or expressions" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="card filters">
        <Chips label="Level" value={level} onChange={setLevel} options={[{ value: 'all', label: 'All' }, ...[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))]} />
        <Chips label="Accent" value={accent} onChange={setAccent} options={[{ value: 'all', label: 'All' }, { value: 'US', label: 'US' }, { value: 'UK', label: 'UK' }]} />
        <Chips label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All' }, { value: 'youtube', label: 'YouTube' }, { value: 'file', label: 'Original video' }]} />
      </div>

      <p className="library-count" role="status">
        Showing {shown.length} of {clips.length} clip{clips.length === 1 ? '' : 's'}
        {filtered && <button type="button" className="library-clear" onClick={clearFilters}>Clear filters</button>}
      </p>

      {shown.length === 0 && (
        <div className="card library-empty">
          <p>No clips match these filters.</p>
          <button type="button" className="btn btn--primary" onClick={clearFilters}>Show all clips</button>
        </div>
      )}

      <ul className="clip-grid">
        {shown.map((clip) => (
          <li key={clip.id} className="clip">
            <div className="clip__thumb" style={{ background: clip.color }}>
              <span className="clip__source">{sourceLabel[clip.source]}</span>
              <span className="clip__play"><PlayIcon size={22} /></span>
              <span className="clip__length">{clip.length}</span>
            </div>
            <div className="clip__body">
              <h3 className="clip__title">{clip.title}</h3>
              <div className="clip__meta">
                <span className="pill pill--accent">{clip.accent}</span>
                <span className="pill">Level {clip.level}</span>
              </div>
              <Link to={`/practice/${clip.id}`} className="clip__start">Start practice</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
