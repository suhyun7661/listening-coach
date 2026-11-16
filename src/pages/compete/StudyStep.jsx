import { EXPRESSIONS } from '../../data/compete-quiz';
import { getClip } from '../../lib/clipStore';

// Step 1: the 15 key expressions with their meaning and the line where you heard them.
export default function StudyStep({ onStart }) {
  const clip = getClip('walk-with-me');
  const lineOf = (id) => clip?.sentences.find((s) => s.id === id);

  return (
    <div className="page">
      <h1 className="page__title">Compete Mode</h1>
      <p className="page__lead">
        Study these 15 expressions from the video. The quiz has 15 questions: listen and type, meaning match, and fill in the gap.
        You get feedback after every answer.
      </p>

      <ol className="study-list">
        {EXPRESSIONS.map((e) => {
          const line = lineOf(e.sentenceId);
          return (
            <li key={e.id} className="study-card">
              <p className="study-card__en">{e.en}</p>
              <p lang="ko" className="study-card__ko">{e.ko}</p>
              <p className="study-card__note">{e.note}</p>
              {line && <p className="study-card__line">In the video: “{line.text}”</p>}
            </li>
          );
        })}
      </ol>

      <div className="step-actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
          <span>Start the quiz</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
