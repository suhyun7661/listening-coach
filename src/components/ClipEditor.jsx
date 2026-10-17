import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import { Icon } from './Common';
import { MAX_VIDEO_BYTES } from '../lib/adminApi';
import {
  applyTap, applyTranscript, clipFromDraft, parseYouTubeId, slugify, splitTranscript, suggestId, validateDraft,
} from '../lib/adminClip';
import { formatTime, usePracticePlayer } from '../lib/usePracticePlayer';

const STEPS = ['Details', 'Transcript', 'Timing', 'Translation', 'Save'];
const SPEEDS = [0.5, 0.75, 1, 1.25];

// The clip editor: five steps from "what is this clip" to "saved".
// api = { saveClip, uploadVideo } so the editor can be tried out without a database.
export default function ClipEditor({ initial, isNew, takenIds, previousSentenceIds = [], api, onSaved }) {
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  return (
    <div className="editor">
      <nav aria-label="Steps" className="editor__steps">
        {STEPS.map((name, i) => (
          <button key={name} type="button" className={`chip${step === i ? ' is-selected' : ''}`} aria-current={step === i ? 'step' : undefined} onClick={() => setStep(i)}>
            {i + 1}. {name}
          </button>
        ))}
      </nav>

      {step === 0 && <DetailsStep draft={draft} patch={patch} isNew={isNew} takenIds={takenIds} api={api} />}
      {step === 1 && <TranscriptStep draft={draft} setDraft={setDraft} isNew={isNew} />}
      {step === 2 && <TimingStep draft={draft} setDraft={setDraft} />}
      {step === 3 && <TranslationStep draft={draft} setDraft={setDraft} />}
      {step === 4 && (
        <SaveStep
          draft={draft} isNew={isNew} takenIds={takenIds} previousSentenceIds={previousSentenceIds}
          api={api} saved={saved} onSaved={() => { setSaved(true); onSaved?.(); }}
        />
      )}

      <div className="editor__nav">
        <button type="button" className="btn btn--outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {step < STEPS.length - 1 && <button type="button" className="btn btn--primary" onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]}</button>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 1. details and video
function DetailsStep({ draft, patch, isNew, takenIds, api }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const youTubeId = draft.source === 'youtube' ? parseYouTubeId(draft.videoRef) : '';

  function changeTitle(title) {
    // New clips get an id from the title until the id is edited by hand.
    const auto = suggestId(draft.title, takenIds);
    patch({ title, ...(isNew && (draft.id === '' || draft.id === auto) ? { id: suggestId(title, takenIds) } : {}) });
  }

  async function chooseFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!draft.id) return setMessage('Give the clip a title first, so the video has a folder to go in.');
    setBusy(true);
    setMessage('Uploading… this can take a minute for a large video.');
    try {
      const url = await api.uploadVideo(draft.id, file);
      patch({ source: 'file', videoRef: url });
      return setMessage('Uploaded.');
    } catch (err) {
      return setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card form" aria-label="Clip details">
      <label className="field">
        <span>Title</span>
        <input type="text" value={draft.title} onChange={(e) => changeTitle(e.target.value)} placeholder="Café small talk" />
      </label>
      <label className="field">
        <span>Clip id (used in links; cannot change after saving)</span>
        <input type="text" value={draft.id} disabled={!isNew} onChange={(e) => patch({ id: slugify(e.target.value) })} />
      </label>
      <div className="form__row">
        <label className="field">
          <span>Accent</span>
          <select value={draft.accent} onChange={(e) => patch({ accent: e.target.value })}>
            <option value="US">US</option><option value="UK">UK</option>
          </select>
        </label>
        <label className="field">
          <span>Level (difficulty 1 to 6)</span>
          <select value={draft.difficulty} onChange={(e) => patch({ difficulty: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Scene summary in Korean (shown at levels 1 and 2)</span>
        <textarea rows="2" value={draft.contextKo} onChange={(e) => patch({ contextKo: e.target.value })} lang="ko" />
      </label>

      <fieldset className="field field--set">
        <legend>Video</legend>
        <div className="form__tabs">
          <label className={`chip${draft.source === 'youtube' ? ' is-selected' : ''}`}>
            <input type="radio" name="source" className="visually-hidden" checked={draft.source === 'youtube'} onChange={() => patch({ source: 'youtube', videoRef: '' })} />
            YouTube link
          </label>
          <label className={`chip${draft.source === 'file' ? ' is-selected' : ''}`}>
            <input type="radio" name="source" className="visually-hidden" checked={draft.source === 'file'} onChange={() => patch({ source: 'file', videoRef: '' })} />
            Upload a video file
          </label>
        </div>

        {draft.source === 'youtube' ? (
          <>
            <input type="text" aria-label="YouTube link" value={draft.videoRef} onChange={(e) => patch({ videoRef: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            {draft.videoRef && (youTubeId
              ? <small className="muted">Video id: {youTubeId}. The video is only embedded, never copied.</small>
              : <small className="form__error">That does not look like a YouTube link.</small>)}
          </>
        ) : (
          <>
            <input type="file" aria-label="Video file" accept="video/mp4,video/webm" onChange={chooseFile} disabled={busy} />
            <small className="muted">.mp4 or .webm, up to {MAX_VIDEO_BYTES / 1024 / 1024} MB.</small>
            {draft.videoRef && <small className="muted">Current video: {decodeURIComponent(draft.videoRef.split('/').pop())}</small>}
          </>
        )}
        {message && <p className="muted" role="status">{message}</p>}
      </fieldset>

      <label className="check">
        <input type="checkbox" checked={draft.published} onChange={(e) => patch({ published: e.target.checked })} />
        <span>Published (visible to learners in the library)</span>
      </label>
    </section>
  );
}

// ---------------------------------------------------------------- 2. transcript
function TranscriptStep({ draft, setDraft, isNew }) {
  const [text, setText] = useState(draft.sentences.map((s) => s.text).join('\n'));
  const lines = splitTranscript(text);
  const removing = draft.sentences.length > lines.length;

  function apply() {
    setDraft((d) => ({ ...d, sentences: applyTranscript(d.sentences, lines) }));
  }

  return (
    <section className="card form" aria-label="Transcript">
      <label className="field">
        <span>Paste the English transcript: one sentence per line</span>
        <textarea rows="10" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p className="muted">
        {lines.length} sentence{lines.length === 1 ? '' : 's'} found.
        {' '}A line you did not change keeps its times and translation.
      </p>
      {!isNew && removing && <p className="form__error">Removing sentences from a clip that people already practised can make their old reports look different.</p>}
      <button type="button" className="btn btn--secondary" onClick={apply} disabled={!lines.length}>Use these sentences</button>
      {draft.sentences.length > 0 && <p className="muted" role="status">The clip currently has {draft.sentences.length} sentence{draft.sentences.length === 1 ? '' : 's'}.</p>}
    </section>
  );
}

// ---------------------------------------------------------------- 3. timing
function TimingStep({ draft, setDraft }) {
  const [cursor, setCursor] = useState(0);
  const sentenceRef = useRef({ start: 0, end: 1 });
  const player = usePracticePlayer(sentenceRef);
  const sentences = draft.sentences;

  // A clip for the player. Without a video the pretend clock is used.
  const lastEnd = Math.max(60, ...sentences.map((s) => Number(s.end) || 0));
  const youTubeId = draft.source === 'youtube' ? parseYouTubeId(draft.videoRef) : '';
  const videoId = draft.source === 'youtube' ? youTubeId : draft.videoRef;
  const hasVideo = Boolean(videoId);
  const playerClip = useMemo(
    () => ({ id: `draft-${videoId || 'none'}`, source: draft.source, videoId: hasVideo ? videoId : 'PLACEHOLDER', sentences: [{ end: lastEnd }] }),
    [draft.source, videoId, hasVideo, lastEnd]
  );

  function setTime(i, key, value) {
    setDraft((d) => ({ ...d, sentences: d.sentences.map((s, n) => (n === i ? { ...s, [key]: value === '' ? null : Number(value) } : s)) }));
  }
  const nowTime = () => Math.round(player.time * 10) / 10;

  function tap() {
    if (cursor >= sentences.length) return;
    setDraft((d) => ({ ...d, sentences: applyTap(d.sentences, cursor, player.time) }));
    setCursor((c) => c + 1);
  }
  const tapRef = useRef(tap);
  tapRef.current = tap;

  // Keyboard shortcut: press T while the video plays.
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 't') return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      tapRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function playSentence(i) {
    const s = sentences[i];
    if (s.start === null || s.end === null) return;
    sentenceRef.current = { start: Number(s.start), end: Number(s.end) };
    player.replay();
  }

  if (!sentences.length) return <section className="card"><p>Add the transcript first (step 2).</p></section>;

  return (
    <section aria-label="Timing" className="timing">
      <div className="card timing__player">
        {!hasVideo && <p className="muted">No video yet (step 1). A pretend clock is running so you can still try the buttons.</p>}
        <div className="player__video">
          <VideoPlayer key={playerClip.id} clip={playerClip} handlers={player.handlers} />
        </div>
        <div className="player__bar">
          <span>{formatTime(player.time)}</span>
          <span className="timing__now">now {nowTime().toFixed(1)} s</span>
          <span>{formatTime(player.duration)}</span>
        </div>
        <div className="player__controls">
          <button type="button" className="btn btn--secondary" onClick={player.togglePlay} disabled={!player.ready}>{player.playing ? 'Pause' : 'Play'}</button>
          <div className="speed" role="group" aria-label="Speed">
            <div className="speed__options">
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={`speed__btn${player.speed === s ? ' is-selected' : ''}`} aria-pressed={player.speed === s} onClick={() => player.setSpeed(s)}>{s}x</button>
              ))}
            </div>
          </div>
        </div>
        <div className="tap-box">
          <button type="button" className="btn btn--primary btn--wide" onClick={tap} disabled={cursor >= sentences.length}>
            Tap: sentence {Math.min(cursor + 1, sentences.length)} starts NOW
          </button>
          <p className="muted">
            Play the video and tap (or press <kbd>T</kbd>) at the moment each sentence begins. Each tap also ends the sentence before it.
            {cursor >= sentences.length && ' All sentences have a start. Set the end of the last one below.'}
          </p>
          <button type="button" className="btn btn--outline btn--small" onClick={() => setCursor(0)}>Start tapping again from sentence 1</button>
        </div>
      </div>

      <ol className="timing__list">
        {sentences.map((s, i) => (
          <li key={s.id} className={`card timing__row${i === cursor ? ' is-cursor' : ''}`}>
            <p className="timing__text"><span className="review-row__num">{i + 1}</span>{s.text}</p>
            <div className="timing__fields">
              <label>Start (s)
                <input type="number" step="0.1" min="0" value={s.start ?? ''} onChange={(e) => setTime(i, 'start', e.target.value)} />
              </label>
              <button type="button" className="btn btn--outline btn--small" onClick={() => setTime(i, 'start', nowTime())}>Start = now</button>
              <label>End (s)
                <input type="number" step="0.1" min="0" value={s.end ?? ''} onChange={(e) => setTime(i, 'end', e.target.value)} />
              </label>
              <button type="button" className="btn btn--outline btn--small" onClick={() => setTime(i, 'end', nowTime())}>End = now</button>
              <button type="button" className="btn btn--secondary btn--small" onClick={() => playSentence(i)} disabled={s.start === null || s.end === null || !player.ready}><Icon name="replay" /> Play</button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------- 4. Korean and key expressions
function TranslationStep({ draft, setDraft }) {
  const update = (i, changes) => setDraft((d) => ({ ...d, sentences: d.sentences.map((s, n) => (n === i ? { ...s, ...changes } : s)) }));
  const updateKey = (i, k, changes) =>
    update(i, { keyWords: draft.sentences[i].keyWords.map((x, n) => (n === k ? { ...x, ...changes } : x)) });

  if (!draft.sentences.length) return <section className="card"><p>Add the transcript first (step 2).</p></section>;
  return (
    <section aria-label="Translation and key expressions" className="stack stack--lg">
      <p className="muted">Write your <strong>own</strong> Korean translations. Official subtitles must not be copied.</p>
      {draft.sentences.map((s, i) => (
        <article key={s.id} className="card form">
          <p className="review-row__en"><span className="review-row__num">{i + 1}</span>{s.text}</p>
          <label className="field">
            <span>Korean translation</span>
            <textarea rows="2" lang="ko" value={s.ko} onChange={(e) => update(i, { ko: e.target.value })} />
          </label>

          <div className="field">
            <span>Key expressions (shown with a meaning at levels 3 and in the notebook)</span>
            {s.keyWords.map((k, n) => (
              <div key={n} className="keyrow">
                <input type="text" aria-label="Phrase" placeholder="on a whim" value={k.word} onChange={(e) => updateKey(i, n, { word: e.target.value })} />
                <input type="text" aria-label="Korean meaning" lang="ko" placeholder="충동적으로" value={k.ko} onChange={(e) => updateKey(i, n, { ko: e.target.value })} />
                <input type="text" aria-label="Note" placeholder="Short note in English (optional)" value={k.note} onChange={(e) => updateKey(i, n, { note: e.target.value })} />
                <button type="button" className="btn btn--outline btn--small" onClick={() => update(i, { keyWords: s.keyWords.filter((_, x) => x !== n) })}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn--outline btn--small" onClick={() => update(i, { keyWords: [...s.keyWords, { word: '', ko: '', note: '' }] })}>+ Add key expression</button>
          </div>

          <label className="field">
            <span>Word meanings, one per line, like <code>came: 왔다</code> (shown above blanks at levels 1 and 2)</span>
            <textarea rows="3" lang="ko" value={s.glossText} onChange={(e) => update(i, { glossText: e.target.value })} />
          </label>
        </article>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------- 5. check and save
function SaveStep({ draft, isNew, takenIds, previousSentenceIds, api, saved, onSaved }) {
  const problems = validateDraft(draft, { takenIds, isNew });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setBusy(true);
    setError('');
    try {
      await api.saveClip(clipFromDraft(draft), previousSentenceIds);
      onSaved();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  return (
    <section className="card form" aria-label="Check and save">
      <h2 className="side-title">{draft.title || 'New clip'} <span className="muted">({draft.id})</span></h2>
      <p>{draft.sentences.length} sentences · {draft.accent} accent · level {draft.difficulty} · {draft.published ? 'published' : 'hidden (draft)'}</p>

      {problems.length > 0 ? (
        <>
          <p className="form__error" role="alert">Please fix these before saving:</p>
          <ul className="problems">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </>
      ) : (
        <p className="form__notice">Everything looks good.</p>
      )}
      {error && <p className="form__error" role="alert">{error}</p>}

      <button type="button" className="btn btn--primary" onClick={save} disabled={busy || problems.length > 0}>{busy ? 'Saving…' : 'Save clip'}</button>

      {saved && (
        <div className="form__notice" role="status">
          <p><strong>Saved!</strong> The clip is now in the library.</p>
          <p>
            <Link to={`/practice/${draft.id}`}>Try it in Practice</Link> · <Link to="/admin">Back to the clip list</Link>
          </p>
          <p>
            <strong>One more step for the US/UK audio:</strong> in your project folder run <code>npm run make:audio</code> (it only makes the new files),
            then drag the new files from <code>generated-audio</code> into the <code>audio</code> folder in Supabase Storage.
          </p>
        </div>
      )}
    </section>
  );
}
