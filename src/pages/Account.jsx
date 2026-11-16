import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Account() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Fill the form once the profile has loaded.
  useEffect(() => {
    if (auth.profile) {
      setDisplayName(auth.profile.display_name);
    }
  }, [auth.profile]);

  if (auth.loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!auth.user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  async function save(e) {
    e.preventDefault();
    setMessage('');
    if (!displayName.trim()) return setMessage('Please enter a name.');
    setBusy(true);
    const result = await auth.updateProfile({ displayName: displayName.trim() });
    setBusy(false);
    return setMessage(result.error ?? 'Saved.');
  }

  async function logOut() {
    await auth.signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="page page--narrow">
      <h1 className="page__title">Your account</h1>
      <p className="page__lead">Signed in as {auth.user.email}</p>

      <form className="card form" onSubmit={save}>
        <label className="field">
          <span>Your name</span>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
        </label>

        {message && <p className={message === 'Saved.' ? 'form__notice' : 'form__error'} role="status">{message}</p>}
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>

      <p className="account-links">
        <button type="button" className="btn btn--outline" onClick={logOut}>Sign out</button>
      </p>
    </div>
  );
}
