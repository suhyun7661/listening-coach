import { Outlet } from 'react-router-dom';
import Header from './Header';
import TimeTravel from './TimeTravel';

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {import.meta.env.DEV && <TimeTravel />}
      <Header />
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
