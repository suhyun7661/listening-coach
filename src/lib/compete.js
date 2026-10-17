import { supabase } from './supabase';
import { generateBlanks } from './blanks';
import { parseToken, splitTokens } from './textUtils';

// Talking to the Competing-mode functions in Supabase. The rules (3 plays, 60 seconds,
// one attempt, grading) are enforced there, not here.

async function call(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export const formatCode = (code) => `${code.slice(0, 3)} ${code.slice(3)}`;
export const cleanCode = (text) => text.replace(/\D/g, '').slice(0, 6);

export function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Same blanks for everyone: they are picked once, here, and stored with the room.
export function createRoom({ clip, sentence, level, label }) {
  const blankIndexes = generateBlanks(sentence, level).filter((t) => t.type === 'blank').map((t) => t.index);
  return call('create_challenge', {
    p_clip: clip.id,
    p_sentence: sentence.id,
    p_level: level,
    p_label: label.trim(),
    p_blank_indexes: blankIndexes,
  });
}

export const joinRoom = (code) => call('join_challenge', { code });

// Opens a room by its code. People who are not in it yet join automatically (share links).
export async function openRoom(code) {
  const { data, error } = await supabase.from('challenges').select('*').eq('room_code', code).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? joinRoom(code);
}

export async function listMyRooms() {
  const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false }).limit(8);
  if (error) throw new Error(error.message);
  return data;
}

export const getStatus = (id) => call('challenge_status', { p_challenge: id });
export const startRun = (id) => call('challenge_start', { p_challenge: id });
export const playRun = (id) => call('challenge_play', { p_challenge: id });
export const submitRun = (id, answers) => call('challenge_submit', { p_challenge: id, p_answers: answers });

// Everyone in the room, their results, and their names.
export async function loadBoard(id) {
  const [members, results] = await Promise.all([
    supabase.from('challenge_members').select('user_id, joined_at').eq('challenge_id', id),
    supabase.from('challenge_results').select('*').eq('challenge_id', id),
  ]);
  if (members.error) throw new Error(members.error.message);
  if (results.error) throw new Error(results.error.message);
  const ids = [...new Set([...members.data.map((m) => m.user_id), ...results.data.map((r) => r.user_id)])];
  const names = {};
  if (ids.length) {
    const { data } = await supabase.from('profiles').select('id, display_name').in('id', ids);
    (data ?? []).forEach((p) => { names[p.id] = p.display_name; });
  }
  return { members: members.data, results: results.data, names };
}

// Ranking: accuracy first, then fewer plays, then the faster time.
export function rankResults(results) {
  return [...results].sort(
    (a, b) => Number(b.accuracy) - Number(a.accuracy) || a.plays - b.plays || a.elapsed_ms - b.elapsed_ms
  );
}

// The sentence as words, with the room's chosen words turned into blanks. No hints in a competition.
export function roomTokens(text, blankIndexes) {
  const blanks = new Set(blankIndexes);
  return splitTokens(text).map((raw, index) => {
    if (!blanks.has(index)) return { type: 'text', index, raw };
    return { type: 'blank', index, raw, ...parseToken(raw), hint: { meaning: null, firstLetter: null, letterCount: null } };
  });
}
