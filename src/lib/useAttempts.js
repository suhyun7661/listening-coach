import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { listAttempts } from './attempts';
import { CATEGORY_IDS, computeScore, mainWeakness, summarizeTags } from './errorTags';

// Loads all of this learner's reports (account if signed in, otherwise this browser)
// with the score and mistake counts worked out for each one.
export function useAttempts() {
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (authLoading) return undefined;
    let alive = true;
    setLoading(true);
    listAttempts(user)
      .then((list) => {
        if (!alive) return;
        setAttempts(
          list.map((a) => {
            const counts = summarizeTags(a.results, a.userTags);
            return { ...a, score: computeScore(a.results), counts, main: mainWeakness(counts) };
          })
        );
        setError('');
      })
      .catch(() => alive && setError('Could not load your reports. Please try again.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [authLoading, user, version]);

  // Mistakes of every category added up over all reports.
  const totals = useMemo(() => {
    const sum = Object.fromEntries(CATEGORY_IDS.map((id) => [id, 0]));
    attempts.forEach((a) => CATEGORY_IDS.forEach((id) => { sum[id] += a.counts[id]; }));
    return sum;
  }, [attempts]);

  return { attempts, totals, main: mainWeakness(totals), loading: loading || authLoading, error, reload };
}
