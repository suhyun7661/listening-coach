// Temporary page body. Stage 2 replaces each of these with the real screen.
export default function PlaceholderPage({ title, lead }) {
  return (
    <div className="page">
      <h1 className="page__title">{title}</h1>
      <p className="page__lead">{lead}</p>
      <div className="card">This screen will be built in Stage 2.</div>
    </div>
  );
}
