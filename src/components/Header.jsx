import { NavLink, Link } from 'react-router-dom';

const MENU = [
  { to: '/', label: 'Library' },
  { to: '/practice', label: 'Practice' },
  { to: '/compete', label: 'Compete' },
  { to: '/vocab', label: 'Vocab quiz' },
  { to: '/notebook', label: 'Notebook' },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">Listening Coach</Link>
        <nav className="header__nav" aria-label="Main">
          <ul className="header__menu">
            {MENU.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `header__link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="header__account">Account</button>
      </div>
    </header>
  );
}
