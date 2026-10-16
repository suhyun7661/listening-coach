import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { listItems } from './notebook';

// Loads the signed-in learner's notebook. (Signed out: an empty list.)
export function useNotebook() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => {
    setLoading(true); // so a quiz never restarts on the old list
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    listItems()
      .then((list) => {
        if (!alive) return;
        setItems(list);
        setError('');
      })
      .catch(() => alive && setError('Could not load your notebook. Please try again.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [authLoading, user, version]);

  return { items, loading: loading || authLoading, error, reload, user };
}
