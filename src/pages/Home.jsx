import { Link } from 'react-router-dom';

// The main screen: a photo, a headline, and only two choices.
export default function Home() {
  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero__text">
          <hr className="hero__rule" />
          <h1 id="hero-h" className="hero__title">Listen.<br />Fill in.<br />Improve.</h1>
          <p className="hero__sub">Sharpen your English with real conversations.</p>
          <div className="hero__actions">
            <Link to="/practice" className="btn btn--primary btn--lg">
              <span>Practice Mode</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/compete" className="btn btn--outline btn--lg">
              <span>Compete Mode</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
