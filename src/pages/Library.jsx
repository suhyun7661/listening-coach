import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PlayIcon, Icon } from '../components/Common';
import { clips, sourceLabel, weaknessCounts } from '../data/sampleData';

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
  // Filters only change the screen for now; real filtering comes with real data.
  const [level, setLevel] = useState(3);
  const [accent, setAccent] = useState('all');
  const [source, setSource] = useState('all');

  return (
    <div className="page">
      <div className="home-top">
        <section className="card welcome" aria-labelledby="welcome-h">
          <p className="welcome__small">From your Day 1 listening check</p>
          <h1 id="welcome-h" className="welcome__title">
            Welcome back. Your main weakness is <span className="accent-sp">speed (SP)</span>.
          </h1>
          <ul className="weakness">
            {weaknessCounts.map((w) => (
              <li key={w.id} className={`weakness__item tag--${w.id}`}>
                <span className="weakness__num">{w.count}</span>
                <span className="weakness__name">{w.id} · {w.label}</span>
              </li>
            ))}
          </ul>
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
          <input type="search" placeholder="Search clips or expressions" />
        </label>
      </div>

      <div className="card filters">
        <Chips label="Level" value={level} onChange={setLevel} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))} />
        <Chips label="Accent" value={accent} onChange={setAccent} options={[{ value: 'all', label: 'All' }, { value: 'US', label: 'US' }, { value: 'UK', label: 'UK' }]} />
        <Chips label="Source" value={source} onChange={setSource} options={[{ value: 'all', label: 'All' }, { value: 'youtube', label: 'YouTube' }, { value: 'file', label: 'Original video' }]} />
      </div>

      <ul className="clip-grid">
        {clips.map((clip) => (
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
              <Link to="/practice" className="clip__start">Start practice</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
