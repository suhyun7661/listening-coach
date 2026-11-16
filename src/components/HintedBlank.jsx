import { forwardRef, useRef } from 'react';
import { hintCaption, hintPattern } from '../lib/blanks';

// One blank (Easy) or one GROUP of blanks (Intermediate / Hard: one box per word of an expression).
// Hints come from the level automatically; there is no hint button.
// A group is one answer: its boxes are kept in a single string, joined with "|".
const HintedBlank = forwardRef(function HintedBlank({ blank, value, onChange, onKeyDown, label }, ref) {
  const { hint, parts } = blank;
  const boxes = useRef([]);

  const spoken = [
    hint.firstLetter && `starts with ${hint.firstLetter}`,
    hint.wordCount > 1 && `${hint.wordCount} words`,
    hint.letterCount && `${hint.letterCount} letters`,
  ].filter(Boolean).join(', ');

  // ---- Easy: one box with "g _ _" under it.
  if (!parts) {
    const width = Math.max(4, hint.letterCount + 2);
    const pattern = hintPattern(hint);
    return (
      <span className="blank-wrap">
        {hint.meaning && <span className="blank-wrap__meaning" lang="ko">{hint.meaning}</span>}
        <input
          ref={ref}
          className={`blank${value.trim() ? ' is-filled' : ''}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label={spoken ? `${label}, ${spoken}` : label}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{ width: `${width}ch`, minWidth: 0 }}
        />
        {pattern && <span className="blank-wrap__hint" aria-hidden="true">{pattern}</span>}
      </span>
    );
  }

  // ---- Groups: one box per word, each as wide as its word.
  const typed = value ? value.split('|') : [];
  const caption = hintCaption(hint);

  const setPart = (i, text) => {
    const next = parts.map((_, k) => (k === i ? text : typed[k] ?? ''));
    onChange(next.join('|'));
  };
  const focusBox = (i) => boxes.current[i]?.focus();

  const onPartKey = (e, i) => {
    if (e.key === ' ') {
      e.preventDefault(); // a space moves to the next word box
      if (i < parts.length - 1) focusBox(i + 1);
      return;
    }
    if (e.key === 'Backspace' && !(typed[i] ?? '') && i > 0) {
      e.preventDefault();
      focusBox(i - 1);
      return;
    }
    onKeyDown(e);
  };

  return (
    <span className="blank-wrap">
      {hint.meaning && <span className="blank-wrap__meaning" lang="ko">{hint.meaning}</span>}
      <span className="blank-group" role="group" aria-label={spoken ? `${label}, ${spoken}` : label}>
        {parts.map((p, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
              if (i === 0 && typeof ref === 'function') ref(el);
              else if (i === 0 && ref) ref.current = el;
            }}
            className={`blank blank--part${(typed[i] ?? '').trim() ? ' is-filled' : ''}`}
            type="text"
            value={typed[i] ?? ''}
            onChange={(e) => setPart(i, e.target.value.replace(/[|\s]/g, ''))}
            onKeyDown={(e) => onPartKey(e, i)}
            aria-label={`${label}, word ${i + 1} of ${parts.length}`}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{ width: `${Math.max(3, p.letters + 2)}ch`, minWidth: 0 }}
          />
        ))}
      </span>
      {caption && <span className="blank-wrap__caption" aria-hidden="true">{caption}</span>}
    </span>
  );
});

export default HintedBlank;
