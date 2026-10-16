import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateBlanks } from './blanks';

// Wait after the last keystroke once every blank has text.
// Typing again restarts the wait; Enter skips it.
export const AUTO_ADVANCE_DELAY = 2000;

const emptyAnswers = (tokensBySentence) =>
  tokensBySentence.map((tokens) => tokens.filter((t) => t.type === 'blank').map(() => ''));

// All the typing and moving-on rules for one clip at one level.
// It never touches the video: moving to another sentence only changes what is on screen.
export function useDictation(sentences, level) {
  const tokensBySentence = useMemo(() => sentences.map((s) => generateBlanks(s, level)), [sentences, level]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => emptyAnswers(tokensBySentence));
  const [edited, setEdited] = useState(false); // typed since arriving at this sentence
  const [finished, setFinished] = useState(false);
  const [pending, setPending] = useState(false); // countdown bar showing
  const [countdownKey, setCountdownKey] = useState(0);

  const inputRefs = useRef([]);
  const timer = useRef(null);

  // New level or clip: start over.
  useEffect(() => {
    clearTimeout(timer.current);
    setAnswers(emptyAnswers(tokensBySentence));
    setCurrent(0);
    setFinished(false);
    setEdited(false);
    setPending(false);
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
    else setFinished(true); // after the last sentence, wait for Submit
  }, [current, sentences.length]);

  // Start (or restart) the wait whenever the answers change.
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
    if (finished) return undefined;
    const id = setTimeout(() => inputRefs.current[0]?.focus({ preventScroll: true }), 0);
    return () => clearTimeout(id);
  }, [current, finished, tokensBySentence]);

  const updateAnswer = useCallback(
    (blankNumber, value) => {
      setEdited(true);
      setAnswers((prev) => prev.map((list, si) => (si === current ? list.map((a, bi) => (bi === blankNumber ? value : a)) : list)));
    },
    [current]
  );

  // Enter: next empty blank, or move on at once when everything is filled.
  const handleKeyDown = useCallback(
    (e, blankNumber) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (allFilled) {
        advance();
        return;
      }
      const next = currentAnswers.findIndex((a, i) => i > blankNumber && !a.trim());
      const firstEmpty = currentAnswers.findIndex((a) => !a.trim());
      inputRefs.current[next !== -1 ? next : firstEmpty]?.focus();
    },
    [allFilled, advance, currentAnswers]
  );

  const sentenceDone = (si) => answers[si]?.length > 0 && answers[si].every((a) => a.trim() !== '');

  return {
    tokensBySentence, current, answers, currentAnswers, finished, pending, countdownKey,
    inputRefs, goTo, advance, updateAnswer, handleKeyDown, sentenceDone,
  };
}
