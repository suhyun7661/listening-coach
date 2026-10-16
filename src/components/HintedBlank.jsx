import { forwardRef } from 'react';
import { hintPattern } from '../lib/blanks';

// One blank. Hints come from the level automatically; there is no hint button.
const HintedBlank = forwardRef(function HintedBlank({ blank, value, onChange, onKeyDown, label }, ref) {
  const { hint } = blank;
  // Without a letter-count hint, every blank has the same width so it doesn't give the answer away.
  const width = hint.letterCount ? Math.max(4, hint.letterCount + 2) : 9;
  // The hint (e.g. "g _ _ _") is its own line under the blank, so it stays visible while typing.
  const pattern = hintPattern(hint);
  const spoken = [
    hint.firstLetter && `starts with ${hint.firstLetter}`,
    hint.letterCount && `${hint.letterCount} letters`,
  ].filter(Boolean).join(', ');

  return (
    <span className="blank-wrap">
      {hint.meaning && (
        <span className="blank-wrap__meaning" lang="ko">
          {hint.meaning}
        </span>
      )}
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
});

export default HintedBlank;
