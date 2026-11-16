import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HintedBlank from '../../components/HintedBlank';
import { generateBlanks, LEVEL_NAMES } from '../../lib/blanks';
import { buildResults } from '../../lib/errorTags';
import { gradeAnswer } from '../../lib/grading';
import { useSegmentAudio } from '../../lib/useSegmentAudio';
import { answerText } from '../../lib/textUtils';

export const MAX_REPLAYS = 3;
const emptyAnswers = (tokensBySentence) => tokensBySentence.map((tokens) => tokens.filter((t) => t.type === 'blank').map(() => ''));

// Step 3: audio-only dictation, one sentence at a time.
// The sentence plays once by itself, then "Replay" works up to 3 times.
// Enter submits the sentence. The number on the left turns blue (all correct) or red.
export default function DictationStep({ clip, level, audioSrc, onFinish, onExit }) {
  const sentences = clip.sentences;
  const tokensBySentence = useMemo(() => sentences.map((s) => generateBlanks(s, level)), [sentences, level]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => emptyAnswers(tokensBySentence));
  const [marks, setMarks] = useState([]); // per sentence: 'correct' | 'wrong'
  const [replays, setReplays] = useState({}); // sentence id -> replays used
  const [blocked, setBlocked] = useState(false); // the browser did not allow the automatic play

  const { play, stop, playing } = useSegmentAudio(audioSrc);
  const inputRefs = useRef([]);
  const sentence = sentences[index];
  const left = MAX_REPLAYS - (replays[sentence.id] ?? 0);

  // Each new sentence: play it once by itself and put the cursor in the first blank.
  useEffect(() => {
    let alive = true;
    play(sentence.start, sentence.end).then((ok) => alive && setBlocked(!ok));
    const id = setTimeout(() => inputRefs.current[0]?.focus({ preventScroll: true }), 0);
    return () => {
      alive = false;
      clearTimeout(id);
      stop();
    };
  }, [index, sentence, play, stop]);

  const replay = useCallback(() => {
    if (left <= 0) return;
    setReplays((r) => ({ ...r, [sentence.id]: (r[sentence.id] ?? 0) + 1 }));
    setBlocked(false);
    play(sentence.start, sentence.end);
    inputRefs.current[0]?.focus({ preventScroll: true });
  }, [left, play, sentence]);

  // Used only when the browser blocked the first automatic play: it does not use up a replay.
  const playFree = () => {
    play(sentence.start, sentence.end).then((ok) => setBlocked(!ok));
    inputRefs.current[0]?.focus({ preventScroll: true });
  };

  const updateAnswer = (blankNumber, value) => {
    setAnswers((prev) => prev.map((list, si) => (si === index ? list.map((a, bi) => (bi === blankNumber ? value : a)) : list)));
  };

  // Enter: grade this sentence, colour its number, move on. After the last one, finish.
  function submit() {
    const blanks = tokensBySentence[index].filter((t) => t.type === 'blank');
    const graded = blanks.map((b, n) => {
      const typed = answerText(answers[index][n] ?? '');
      return { b, typed, ...gradeAnswer(typed, b.answer) };
    });
    const allRight = graded.every((g) => g.status === 'correct' || g.status === 'almost');
    setMarks((m) => [...m.slice(0, index), allRight ? 'correct' : 'wrong']);
    if (index < sentences.length - 1) {
      setIndex(index + 1);
    } else {
      stop();
      onFinish({ results: buildResults(sentences, tokensBySentence, answers), replays });
    }
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // Enter goes to the next box; on the last box it submits the sentence.
    const boxes = [...e.currentTarget.closest('.sentence').querySelectorAll('input')];
    const next = boxes[boxes.indexOf(e.currentTarget) + 1];
    if (next) next.focus();
    else submit();
  };

  function leave() {
    if (index === 0 || window.confirm('Leave this round? Your answers will be lost.')) onExit();
  }

  let blankCounter = -1;
  inputRefs.current = [];

  return (
    <div className="page dictation">
      <div className="dictation__top">
        <button type="button" className="back-link back-link--button" onClick={leave}>‹ Back</button>
        <span className="pill">{LEVEL_NAMES[level]}</span>
        <span className="dictation__replays" role="status" aria-live="polite">Replays left: {left} / {MAX_REPLAYS}</span>
        <button type="button" className="btn btn--outline" onClick={replay} disabled={left <= 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></svg>
          Replay
        </button>
      </div>

      <div className="dictation__body">
        <ol className="rail" aria-label="Sentences">
          {sentences.map((s, i) => {
            const state = marks[i] ?? (i === index ? 'current' : 'todo');
            const label = marks[i] === 'correct' ? 'correct' : marks[i] === 'wrong' ? 'incorrect' : i === index ? 'current' : 'not yet';
            return (
              <li key={s.id}>
                <span className={`rail__num is-${state}`} aria-label={`Sentence ${i + 1}, ${label}`} aria-current={i === index ? 'step' : undefined}>{i + 1}</span>
              </li>
            );
          })}
        </ol>

        <section className="dictation__card" aria-label="Dictation">
          <p className="dictation__count">Sentence {index + 1} / {sentences.length}</p>
          <p className="sentence" key={sentence.id}>
            {tokensBySentence[index].map((token) => {
              if (token.type === 'text') return <span key={token.index}>{token.raw}</span>;
              blankCounter += 1;
              const n = blankCounter;
              return (
                <span key={token.index} className="sentence__word">
                  {token.before}
                  <HintedBlank
                    ref={(el) => { inputRefs.current[n] = el; }}
                    blank={token}
                    value={answers[index][n] ?? ''}
                    onChange={(v) => updateAnswer(n, v)}
                    onKeyDown={onKeyDown}
                    label={`Blank ${n + 1} of ${answers[index].length}`}
                  />
                  {token.after}
                </span>
              );
            })}
          </p>

          <p className="dictation__status" role="status">
            {blocked ? (
              <>Your browser did not play the sound by itself. <button type="button" className="linklike" onClick={playFree}>Play the sentence</button></>
            ) : playing ? 'Playing…' : 'Type what you hear. Enter moves to the next blank. Enter on the last blank checks the sentence.'}
          </p>

          <div className="dictation__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={submit}>
              <span>{index === sentences.length - 1 ? 'Enter · Finish' : 'Enter'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
