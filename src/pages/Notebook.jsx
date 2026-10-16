import { Tag } from '../components/Common';
import { notebookSample } from '../data/sampleData';

// No reference screen for this page yet: a simple list in the same style.
export default function Notebook() {
  return (
    <div className="page">
      <h1 className="page__title">Notebook</h1>
      <p className="page__lead">Words and expressions you saved from your own mistakes.</p>
      <ul className="stack">
        {notebookSample.map((n) => (
          <li key={n.word} className="card note-item">
            <div>
              <p className="note-item__word">{n.word}</p>
              <p lang="ko" className="note-item__ko">{n.ko}</p>
              <p className="muted">From: {n.clip}</p>
            </div>
            <div className="note-item__side">
              <Tag id={n.tag} />
              <span className="muted">Next review: {n.next}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
