import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const MIN_PASSWORD = 8;

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goBackTo = location.state?.from ?? '/';

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth.user) return <Navigate to={goBackTo} replace />;

  const isSignup = mode === 'signup';

  function switchMode(next) {
    setMode(next);
    setError('');
    setNotice('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email.includes('@')) return setError('Please enter a valid email address.');
    if (isSignup && !displayName.trim()) return setError('Please enter a name to show in the app.');
    if (isSignup && password.length < MIN_PASSWORD) return setError(`Your password needs at least ${MIN_PASSWORD} characters.`);
    if (!password) return setError('Please enter your password.');

    setBusy(true);
    const result = isSignup
      ? await auth.signUp({ email: email.trim(), password, displayName: displayName.trim() })
      : await auth.signIn({ email: email.trim(), password });
    setBusy(false);

    if (result.error) return setError(result.error);
    if (result.needsConfirmation) {
      return setNotice('Almost done! We sent a link to your email. Click it, then come back and sign in.');
    }
    return navigate(goBackTo, { replace: true });
  }

  return (
    <div className="page page--narrow">
      <h1 className="page__title">{isSignup ? 'Create your account' : 'Sign in'}</h1>
      <p className="page__lead">
        {isSignup ? 'Save your reports and see your progress on any device.' : 'Welcome back! Sign in to see your saved progress.'}
      </p>

      {!auth.configured ? (
        <div className="card">
          <p><strong>Login is not set up on this computer yet.</strong></p>
          <p className="muted">Create the <code>.env</code> file with your Supabase URL and key, then restart the site (<code>npm run dev</code>).</p>
        </div>
      ) : (
        <form className="card form" onSubmit={submit} noValidate>
          <div className="form__tabs" role="group" aria-label="Sign in or create account">
            <button type="button" className={`chip${!isSignup ? ' is-selected' : ''}`} aria-pressed={!isSignup} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" className={`chip${isSignup ? ' is-selected' : ''}`} aria-pressed={isSignup} onClick={() => switchMode('signup')}>Create account</button>
          </div>

          {isSignup && (
            <label className="field">
              <span>Your name</span>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="nickname" maxLength={30} />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} />
            {isSignup && <small className="muted">At least {MIN_PASSWORD} characters.</small>}
          </label>

          {error && <p className="form__error" role="alert">{error}</p>}
          {notice && <p className="form__notice" role="status">{notice}</p>}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>
      )}

      <p className="muted form__skip">
        You can also <Link to="/">keep practicing without an account</Link>. Reports are then saved in this browser only.
      </p>
    </div>
  );
}
