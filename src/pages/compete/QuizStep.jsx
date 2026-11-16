import { useCallback, useEffect, useRef, useState } from 'react';
import { EXPRESSIONS, QUESTIONS } from '../../data/compete-quiz';
import { getClip } from '../../lib/clipStore';
import { gradeQuestion } from '../../lib/quiz';
import { useSegmentAudio } from '../../lib/useSegmentAudio';

const AUDIO_SRC = '/audio/walk-with-me.mp3';
const MAX_REPLAYS = 2;
const TYPE_LABEL = { listen: 'Listen and Type', meaning: 'Meaning Match', gap: 'Fill in the Gap' };
const byId = Object.fromEntries(EXPRESSIONS.map((e) => [e.id, e]));

// Step 2: 15 questions in one fixed order. After each answer you see Correct / Incorrect, the correct
// expression (and its Korean meaning when you were wrong). An answer cannot be changed once submitted.
export default function QuizStep({ onFinish, onExit }) {
  const clip = getClip('walk-with-me');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false); // this question has been submitted
  const [replays, setReplays] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const q = QUESTIONS[index];
  const expr = byId[q.expression];
  const { play, stop, playing } = useSegmentAudio(AUDIO_SRC);
  const sentence = q.type === 'listen' ? clip.sentences.find((s) => s.id === q.sentenceId) : null;
  const inputRef = useRef(null);
  const nextRef = useRef(null);

  // New question: reset, focus the field, and (Listen and Type) play the audio once by itself.
  useEffect(() => {
    setTyped('');
    setPicked(null);
    setDone(false);
    setReplays(0);
    setBlocked(false);
    let alive = true;
    if (sentence) play(sentence.start, sentence.end).then((ok) => alive && setBlocked(!ok));
    const id = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    return () => { alive = false; clearTimeout(id); stop(); };
  }, [index, sentence, play, stop]);

  // After submitting, the Next button gets the focus so Enter continues.
  useEffect(() => { if (done) nextRef.current?.focus(); }, [done]);

  const replay = useCallback(() => {
    if (!sentence || replays >= MAX_REPLAYS) return;
    setReplays((r) => r + 1);
    setBlocked(false);
    play(sentence.start, sentence.end);
  }, [sentence, replays, play]);

  const answer = q.type === 'meaning' ? picked : typed.trim();
  const correct = done ? gradeQuestion(q, answers[q.id]) : false;
  const canSubmit = q.type === 'meaning' ? picked !== null : typed.trim() !== '';

  function submit() {
    if (done || !canSubmit) return;
    stop();
    setAnswers((a) => ({ ...a, [q.id]: answer }));
    setDone(true);
  }

  function next() {
    if (index < QUESTIONS.length - 1) setIndex(index + 1);
    else onFinish(answers);
  }

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  };

  // What to show as "the correct expression": the accepted form that fits (typed types) or the expression itself.
  const correctText = q.type === 'meaning' ? expr.en : q.accept[0];
  const last = index === QUESTIONS.length - 1;

  return (
    <div className="page quiz">
      <div className="quiz__top">
        <button type="button" className="back-link back-link--button" onClick={() => { if (index === 0 && !done) onExit(); else if (window.confirm('Leave the quiz? Your answers will be lost.')) onExit(); }}>‹ Back</button>
        <span className="pill">{TYPE_LABEL[q.type]}</span>
        <span className="quiz__count">Question {index + 1} / {QUESTIONS.length}</span>
      </div>
      <div className="progress" aria-hidden="true"><span className="progress__done" style={{ width: `${((index + (done ? 1 : 0)) / QUESTIONS.length) * 100}%` }} /></div>

      <section className="quiz__card" aria-label="Question">
        {q.type === 'listen' && (
          <>
            <p className="quiz__prompt">Listen, then type the English expression that means:</p>
            <p lang="ko" className="quiz__ko">{expr.ko}</p>
            <div className="quiz__audio">
              <button type="button" className="btn btn--outline" onClick={replay} disabled={replays >= MAX_REPLAYS || done}>
                Replay
              </button>
              <span role="status" aria-live="polite">Replays left: {MAX_REPLAYS - replays} / {MAX_REPLAYS}{playing ? ' · Playing…' : ''}</span>
            </div>
            {blocked && <p className="muted">Your browser did not play the sound by itself. <button type="button" className="linklike" onClick={() => sentence && play(sentence.start, sentence.end).then((ok) => setBlocked(!ok))}>Play the sentence</button></p>}
            <input ref={inputRef} className="quiz__input" type="text" value={typed} disabled={done} onChange={(e) => setTyped(e.target.value)} onKeyDown={onKey} aria-label="Type the English expression" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
          </>
        )}

        {q.type === 'meaning' && (
          <>
            <p className="quiz__prompt">What does this expression mean?</p>
            <p className="quiz__expr">{expr.en}</p>
            <div className="quiz__choices" role="radiogroup" aria-label="Choose the meaning">
              {q.choices.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={picked === i}
                  disabled={done}
                  lang="ko"
                  className={`quiz__choice${picked === i ? ' is-picked' : ''}${done && i === q.correct ? ' is-right' : ''}${done && picked === i && i !== q.correct ? ' is-wrong' : ''}`}
                  onClick={() => setPicked(i)}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {q.type === 'gap' && (
          <>
            <p className="quiz__prompt">Type the expression that completes the sentence.</p>
            <p className="quiz__sentence">
              {q.before}{' '}
              <input ref={inputRef} className="quiz__gap" type="text" value={typed} disabled={done} onChange={(e) => setTyped(e.target.value)} onKeyDown={onKey} aria-label="Missing expression" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />{' '}
              {q.after}
            </p>
            <p lang="ko" className="quiz__ko">{expr.ko}</p>
          </>
        )}

        {!done ? (
          <div className="quiz__actions">
            <button type="button" className="btn btn--primary btn--lg" disabled={!canSubmit} onClick={submit}>
              <span>Check answer</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className={`quiz__feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
            <p className="quiz__verdict">{correct ? 'Correct!' : 'Incorrect'}</p>
            {!correct && q.type !== 'meaning' && <p>Your answer: <span className="mark mark--wrong">{answers[q.id]}</span></p>}
            <p>Correct expression: <strong>{correctText}</strong></p>
            {!correct && <p>Meaning: <span lang="ko">{expr.ko}</span></p>}
            <div className="quiz__actions">
              <button ref={nextRef} type="button" className="btn btn--primary btn--lg" onClick={next}>
                <span>{last ? 'See results' : 'Next question'}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
