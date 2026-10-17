import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getClips } from '../lib/clipStore';

// Only for the project owner. The database enforces this too: a normal user's save is refused.
export function AdminGate({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading || (auth.user && !auth.profile)) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!auth.user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!auth.isAdmin) {
    return (
      <div className="page page--narrow">
        <h1 className="page__title">Admin</h1>
        <div className="card">
          <p>This page is for the owner of Listening Coach. Your account is not an admin yet.</p>
          <p>To make <strong>your</strong> account the admin, open Supabase, then SQL Editor, paste this, and press Run. Then refresh this page.</p>
          <pre className="code-block">{`update public.profiles set is_admin = true\nwhere id = (select id from auth.users where email = '${auth.user.email}');`}</pre>
        </div>
      </div>
    );
  }
  return children;
}

export default function Admin() {
  return (
    <AdminGate>
      <ClipList />
    </AdminGate>
  );
}

function ClipList() {
  const clips = getClips();
  return (
    <div className="page">
      <div className="admin-head">
        <div>
          <h1 className="page__title">Admin</h1>
          <p className="page__lead">Add and edit clips. You are signed in as an admin.</p>
        </div>
        <Link to="/admin/new" className="btn btn--primary">+ Add a clip</Link>
      </div>

      <ul className="stack">
        {clips.map((c) => {
          const hasVideo = !c.videoId.startsWith('PLACEHOLDER');
          return (
            <li key={c.id} className="card admin-clip">
              <div>
                <p className="admin-clip__title">{c.title}</p>
                <p className="muted">
                  {c.id} · {c.accent} · level {c.difficulty} · {c.sentences.length} sentences · {c.source === 'youtube' ? 'YouTube' : 'uploaded file'}
                </p>
              </div>
              <div className="admin-clip__side">
                <span className={`tag ${hasVideo ? 'tag--AC' : 'tag--SP'}`}>{hasVideo ? 'Video set' : 'No video yet'}</span>
                {!c.published && <span className="tag tag--MI">Hidden</span>}
                <Link to={`/admin/edit/${c.id}`} className="btn btn--secondary btn--small">Edit</Link>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="card admin-help">
        <h2 className="side-title">After adding or changing a clip</h2>
        <p>Make the US and UK recordings. In your project folder run <code>npm run make:audio</code>, then drag the new files from the <code>generated-audio</code> folder into the <code>audio</code> folder in Supabase Storage.</p>
      </section>
    </div>
  );
}
