import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HintedBlank from './HintedBlank';
import { describeHints, generateBlanks } from '../lib/blanks';
import { buildResults } from '../lib/errorTags';

// Wait after the last keystroke once every blank has text.
// Typing again restarts the wait; Enter skips it.
export const AUTO_ADVANCE_DELAY = 2000;

function emptyAnswers(tokensBySentence) {
  return tokensBySentence.map((tokens) => tokens.filter((t) => t.type === 'blank').map(() => ''));
}

export default function SentenceDictation({ sentences, level, clipAccent = '', userAccent = 'US', onSubmit }) {
  const tokensBySentence = useMemo(() => sentences.map((s) => generateBlanks(s, level)), [sentences, level]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => emptyAnswers(tokensBySentence));
  const [edited, setEdited] = useState(false); // typed since arriving at this sentence
  const [finished, setFinished] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [pending, setPending] = useState(false);

  const inputRefs = useRef([]);
  const timer = useRef(null);

  // New level or clip: start over.
  useEffect(() => {
    setAnswers(emptyAnswers(tokensBySentence));
    setCurrent(0);
    setFinished(false);
    setEdited(false);
  }, [tokensBySentence]);

  const currentAnswers = answers[current] ?? [];
  const allFilled = currentAnswers.length > 0 && currentAnswers.every((a) => a.trim() !== '');

  const goTo = useCallback((index) => {
    clearTimeout(timer.current);
    setPending(false);
    setEdited(false);
    setFinished(false);
    setCurrent(index);
  }, []);

  const advance = useCallback(() => {
    clearTimeout(timer.current);
    setPending(false);
    setEdited(false);
    if (current < sentences.length - 1) setCurrent((c) => c + 1);
    else setFinished(true);
  }, [current, sentences.length]);

  // Start (or restart) the auto-advance wait whenever the answers change.
  useEffect(() => {
    clearTimeout(timer.current);
    if (!edited || !allFilled || finished) {
      setPending(false);
      return undefined;
    }
    setPending(true);
    setCountdownKey((k) => k + 1);
    timer.current = setTimeout(advance, AUTO_ADVANCE_DELAY);
    return () => clearTimeout(timer.current);
  }, [currentAnswers, edited, allFilled, finished, advance]);

  // Put the cursor in the first blank of each new sentence.
  useEffect(() => {
    if (finished) return;
    const id = requestAnimationFrame(() => inputRefs.current[0]?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(id);
  }, [current, finished]);

  function updateAnswer(blankNumber, value) {
    setEdited(true);
    setAnswers((prev) => prev.map((list, si) => (si === current ? list.map((a, bi) => (bi === blankNumber ? value : a)) : list)));
  }

  function handleKeyDown(e, blankNumber) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (allFilled) {
      advance();
      return;
    }
    const next = currentAnswers.findIndex((a, i) => i > blankNumber && !a.trim());
    const firstEmpty = currentAnswers.findIndex((a) => !a.trim());
    inputRefs.current[next !== -1 ? next : firstEmpty]?.focus();
  }

  function submit() {
    clearTimeout(timer.current);
    onSubmit?.(buildResults(sentences, tokensBySentence, answers, { clipAccent, userAccent }));
  }

  const sentenceDone = (si) => answers[si]?.length > 0 && answers[si].every((a) => a.trim() !== '');

  let blankCounter = -1;
  inputRefs.current = [];

  return (
    <div className="lc-dictation">
      <div className="lc-dictation__head">
        <h2 className="lc-dictation__title">
          {finished ? 'All sentences filled in' : `Sentence ${current + 1} of ${sentences.length}`}
        </h2>
        <span className="lc-dictation__hints">Level {level} hints: {describeHints(level)}</span>
      </div>

      {finished ? (
        <div className="lc-dictation__finished">
          <p>Check any sentence with the numbers below, or submit now to see your results.</p>
        </div>
      ) : (
        <p className="lc-sentence">
          {tokensBySentence[current].map((token) => {
            if (token.type === 'text') {
              return (
                <span key={token.index} className="lc-sentence__word">
                  {token.raw}
                </span>
              );
            }
            blankCounter += 1;
            const n = blankCounter;
            return (
              <span key={token.index} className="lc-sentence__word">
                {token.before}
                <HintedBlank
                  ref={(el) => {
                    inputRefs.current[n] = el;
                  }}
                  blank={token}
                  value={currentAnswers[n] ?? ''}
                  onChange={(v) => updateAnswer(n, v)}
                  onKeyDown={(e) => handleKeyDown(e, n)}
                  label={`Blank ${n + 1} of ${currentAnswers.length}`}
                />
                {token.after}
              </span>
            );
          })}
        </p>
      )}

      <div className="lc-countdown" aria-live="polite">
        {pending && !finished && (
          <>
            <span className="lc-countdown__bar" key={countdownKey} style={{ animationDuration: `${AUTO_ADVANCE_DELAY}ms` }} />
            <span className="lc-countdown__text">
              {current < sentences.length - 1 ? 'Next sentence coming up. Keep typing to stay, or press Enter to go now.' : 'Last sentence done. Press Enter to finish.'}
            </span>
          </>
        )}
      </div>

      <div className="lc-dictation__foot">
        <nav className="lc-tracker" aria-label="Sentences">
          {sentences.map((s, si) => (
            <button
              key={s.id ?? si}
              type="button"
              className={`lc-tracker__item${si === current && !finished ? ' is-current' : ''}${sentenceDone(si) ? ' is-done' : ''}`}
              aria-current={si === current && !finished ? 'step' : undefined}
              onClick={() => goTo(si)}
            >
              {si + 1}
            </button>
          ))}
        </nav>
        <button type="button" className="lc-submit" onClick={submit}>
          Submit clip for grading
        </button>
      </div>
    </div>
  );
}
