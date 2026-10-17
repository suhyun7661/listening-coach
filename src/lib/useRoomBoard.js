import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { loadBoard } from './compete';

// The live leaderboard. Supabase Realtime pushes a change the moment someone submits or joins;
// a refresh every 15 seconds is a safety net in case the live connection drops.
export function useRoomBoard(challengeId) {
  const [board, setBoard] = useState(null);
  const [live, setLive] = useState(false);

  const reload = useCallback(() => {
    if (challengeId) loadBoard(challengeId).then(setBoard).catch(() => {});
  }, [challengeId]);

  useEffect(() => {
    if (!challengeId || !supabase) return undefined;
    reload();
    const channel = supabase
      .channel(`room-${challengeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_results', filter: `challenge_id=eq.${challengeId}` }, reload)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenge_members', filter: `challenge_id=eq.${challengeId}` }, reload)
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    const poll = setInterval(reload, 15000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [challengeId, reload]);

  return { board, live, reload };
}
