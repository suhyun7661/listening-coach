import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

// Turns Supabase's technical messages into short, friendly ones.
function friendly(error) {
  const m = (error?.message ?? '').toLowerCase();
  if (m.includes('invalid login')) return 'The email or password is wrong.';
  if (m.includes('already registered')) return 'This email already has an account. Try signing in.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first (check your inbox).';
  if (m.includes('rate limit')) return 'Too many tries. Please wait a few minutes and try again.';
  if (m.includes('password')) return error.message;
  if (m.includes('fetch') || m.includes('network')) return 'Could not reach the server. Check your internet connection.';
  return error?.message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  // Keep the signed-in session up to date (also after a page refresh).
  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Load the learner's profile (display name and accent). Row Level Security means
  // this can only ever return their own row.
  const userId = session?.user?.id;
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null);
      return undefined;
    }
    let alive = true;
    supabase
      .from('profiles')
      .select('display_name, accent')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => alive && setProfile(data));
    return () => {
      alive = false;
    };
  }, [userId]);

  const signUp = useCallback(async ({ email, password, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return { error: friendly(error) };
    // With "Confirm email" switched on in Supabase there is no session until the link is clicked.
    return { needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: friendly(error) } : {};
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const updateProfile = useCallback(
    async ({ displayName, accent }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, accent })
        .eq('id', userId)
        .select('display_name, accent')
        .single();
      if (error) return { error: friendly(error) };
      setProfile(data);
      return {};
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      configured: Boolean(supabase),
      loading,
      user: session?.user ?? null,
      profile,
      // The learner's own accent decides which answers count as "accent" mistakes.
      accent: profile?.accent ?? 'US',
      signUp,
      signIn,
      signOut,
      updateProfile,
    }),
    [loading, session, profile, signUp, signIn, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
