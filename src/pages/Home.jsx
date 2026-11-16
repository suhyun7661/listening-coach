import { Link } from 'react-router-dom';
import { Icon } from '../components/Common';

// The main screen: only two choices.
export default function Home() {
  return (
    <div className="page">
      <section className="mode-panel" aria-labelledby="mode-h">
        <h1 id="mode-h" className="mode-panel__title">Choose a mode</h1>
        <Link to="/practice" className="mode mode--practice">
          <Icon name="pencil" />
          <span>
            <strong>Practice mode</strong>
            <span>Watch the video, then fill in the blanks while you listen</span>
          </span>
        </Link>
        <Link to="/compete" className="mode mode--compete">
          <Icon name="trophy" />
          <span>
            <strong>Compete mode</strong>
            <span>An expression quiz with a leaderboard</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
