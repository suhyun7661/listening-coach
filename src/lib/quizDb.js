import { supabase } from './supabase';
import { COMPETITORS } from '../data/compete-quiz';

// The 5 fictional competitors come from the server (table quiz_benchmarks). If the table cannot be
// reached (for example the SQL was not run yet), the same fixed scores from the data file are used.
export async function getCompetitors() {
  if (!supabase) return COMPETITORS;
  try {
    const { data, error } = await supabase.from('quiz_benchmarks').select('name, score').order('sort_order');
    if (error || !data?.length) return COMPETITORS;
    return data;
  } catch {
    return COMPETITORS;
  }
}

// The learner's latest saved quiz result (one row per learner), or null.
export async function getMyResult(user) {
  if (!supabase || !user) return null;
  try {
    const { data, error } = await supabase.from('quiz_results').select('score, total, updated_at').eq('user_id', user.id).maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

// Saves the latest result. A new completed quiz overwrites the old row (no history).
export async function saveMyResult(user, { score, total, percent, answers }) {
  if (!supabase || !user) return false;
  try {
    const { error } = await supabase
      .from('quiz_results')
      .upsert({ user_id: user.id, score, total, percent, answers, updated_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Could not save the quiz result.', error);
    return false;
  }
}
