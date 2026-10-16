import { useMemo, useState } from 'react';
import ErrorSummary from './ErrorSummary';
import ErrorTagPicker from './ErrorTagPicker';
import { computeScore, summarizeTags } from '../lib/errorTags';
import { isMiss } from '../lib/grading';

// results: the array SentenceDictation passes to onSubmit.
// onTagsChange(userTags): optional, for saving to the database later (Stage 10).
export default function ReviewPanel({ results, onTagsChange }) {
  const [userTags, setUserTags] = useState({});
  const score = useMemo(() => computeScore(results), [results]);
  const counts = useMemo(() => summarizeTags(results, userTags), [results, userTags]);

  function setTag(blankId, tag) {
    const next = { ...userTags, [blankId]: tag };
    setUserTags(next);
    onTagsChange?.(next);
  }

  return (
    <div className="lc-review">
      <div className="lc-review__top">
        <div className="lc-score">
          <span className="lc-score__label">Your score</span>
          <span className="lc-score__value">{score.percent}%</span>
          <span className="lc-score__detail">
            {score.correct} of {score.total} blanks correct
          </span>
        </div>
        <ErrorSummary counts={counts} />
      </div>

      <h2 className="lc-review__heading">Sentence by sentence</h2>
      {results.map((row) => {
        const misses = row.tokens.filter((t) => t.type === 'blank' && isMiss(t));
        return (
          <article key={row.sentenceId} className="lc-row">
            <p className="lc-row__english">
              <span className="lc-row__num">{String(row.number).padStart(2, '0')}</span>
              {row.tokens.map((t) => {
                if (t.type === 'text') return <span key={t.index}>{t.raw} </span>;
                return (
                  <span key={t.index}>
                    {t.before}
                    {t.status === 'correct' && <span className="lc-mark lc-mark--ok">{t.answer}</span>}
                    {t.status === 'almost' && (
                      <span className="lc-mark lc-mark--almost" title={`You wrote "${t.userAnswer}"`}>
                        {t.answer}
                      </span>
                    )}
                    {isMiss(t) && (
                      <>
                        <s className="lc-mark lc-mark--wrong">{t.userAnswer.trim() || '(empty)'}</s>{' '}
                        <strong className="lc-mark lc-mark--ok">{t.answer}</strong>
                      </>
                    )}
                    {t.after}{' '}
                  </span>
                );
              })}
            </p>
            {row.ko && (
              <p className="lc-row__ko" lang="ko">
                {row.ko}
              </p>
            )}
            {row.keyWords.map((kw) => (
              <p key={kw.word} className="lc-row__note">
                <strong>{kw.word}</strong> = <span lang="ko">{kw.ko}</span>
                {kw.note ? `. ${kw.note}` : ''}
              </p>
            ))}
            {misses.map((m) => (
              <div key={m.blankId} className="lc-row__miss">
                <span className="lc-row__miss-word">
                  Why did you miss <strong>{m.answer}</strong>?
                </span>
                <ErrorTagPicker autoTag={m.autoTag} value={userTags[m.blankId]} onChange={(tag) => setTag(m.blankId, tag)} word={m.answer} />
              </div>
            ))}
          </article>
        );
      })}
    </div>
  );
}
