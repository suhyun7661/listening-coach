// A simple page body for screens that are not built yet (and for "page not found").
export default function PlaceholderPage({ title, lead }) {
  return (
    <div className="page">
      <h1 className="page__title">{title}</h1>
      <p className="page__lead">{lead}</p>
    </div>
  );
}
