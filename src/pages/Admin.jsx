// No reference screen: a plain preview of the admin tools planned for Stage 15.
const STEPS = [
  'Add a clip (YouTube link or uploaded video)',
  'Paste the transcript',
  'Fix sentence timestamps',
  'Draft Korean translations',
  'Mark key expressions',
  'Generate US and UK accent audio',
];

export default function Admin() {
  return (
    <div className="page">
      <h1 className="page__title">Admin</h1>
      <p className="page__lead">Tools for adding clips (coming in a later stage).</p>
      <ol className="card admin-steps">
        {STEPS.map((s) => <li key={s}>{s}</li>)}
      </ol>
    </div>
  );
}
