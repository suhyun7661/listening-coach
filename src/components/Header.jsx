import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const MENU = [
  { to: '/practice', label: 'Practice' },
  { to: '/compete', label: 'Compete' },
];

function HeadphonesIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4" height="7" rx="2" />
      <rect x="17" y="14" width="4" height="7" rx="2" />
    </svg>
  );
}

export default function Header() {
  const { user, profile, loading } = useAuth();
  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? '';
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <HeadphonesIcon />
          Listening Coach
        </Link>
        <nav className="header__nav" aria-label="Main">
          <ul className="header__menu">
            {MENU.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `header__link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {user ? (
          <Link to="/account" className="header__account" aria-label={`Your account: ${name}`}>
            <span className="header__avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
            <span lang="ko">{name}</span>
          </Link>
        ) : (
          !loading && <Link to="/login" className="header__account header__account--login">Log in</Link>
        )}
      </div>
    </header>
  );
}
