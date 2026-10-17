import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { refreshClips } from './clipStore';

const ClipsContext = createContext({ reloadClips: async () => {} });

// Loads the clips before the pages are shown, and again when someone signs in or out
// (admins can also see clips that are not published yet).
export function ClipsProvider({ children }) {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  // After an Admin save: refresh the list without restarting the page you are on.
  // (Pages you open next read the fresh list.)
  const reloadClips = useCallback(() => refreshClips(), []);

  useEffect(() => {
    if (loading) return undefined;
    let alive = true;
    // Never wait longer than 4 seconds: the sample clips are the fallback.
    const timeout = setTimeout(() => alive && setReady(true), 4000);
    refreshClips().then(() => {
      if (!alive) return;
      setReady(true);
      setVersion((v) => v + 1);
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, [loading, user?.id]);

  const value = useMemo(() => ({ reloadClips }), [reloadClips]);

  if (!ready) return <div className="page"><p className="muted">Loading…</p></div>;
  return (
    <ClipsContext.Provider value={value}>
      <Fragment key={version}>{children}</Fragment>
    </ClipsContext.Provider>
  );
}

export const useClips = () => useContext(ClipsContext);
