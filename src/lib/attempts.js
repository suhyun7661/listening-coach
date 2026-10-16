import { supabase } from './supabase';
import * as local from './attemptStore';
import { dbGetAttempt, dbListAttempts, dbSaveAttempt, dbSetUserTag, locateBlank } from './attemptsDb';

// One place for reports. Signed in: they live in your account (Supabase).
// Signed out, or if saving to the account fails: they live in this browser only.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const online = (user) => Boolean(user && supabase);

export async function saveAttempt(user, attempt) {
  if (online(user)) {
    try {
      return { id: await dbSaveAttempt(attempt), where: 'account' };
    } catch (error) {
      console.warn('Could not save to the account, keeping it in this browser.', error);
      return { id: local.saveAttempt(attempt), where: 'browser', failed: true };
    }
  }
  return { id: local.saveAttempt(attempt), where: 'browser' };
}

export async function listAttempts(user) {
  return online(user) ? dbListAttempts() : local.loadAttempts().map((a) => ({ ...a, where: 'browser' }));
}

// No id = the most recent report.
export async function getAttempt(user, id) {
  if (online(user) && (!id || UUID.test(id))) return dbGetAttempt(id);
  const found = local.loadAttempt(id);
  return found ? { ...found, where: 'browser' } : null;
}

export async function setUserTag(user, attempt, blankId, nextTags) {
  if (attempt.where === 'account' && online(user)) {
    await dbSetUserTag(attempt.id, attempt.results, blankId, nextTags[blankId]);
  } else {
    local.saveUserTags(attempt.id, nextTags);
  }
}

export function countBrowserReports() {
  return local.loadAttempts().length;
}

// Moves reports made in this browser into the signed-in account.
export async function importBrowserReports(user) {
  if (!online(user)) return 0;
  const reports = [...local.loadAttempts()].reverse(); // oldest first
  let moved = 0;
  for (const r of reports) {
    try {
      const id = await dbSaveAttempt(r);
      for (const [blankId, tag] of Object.entries(r.userTags ?? {})) {
        if (locateBlank(r.results, blankId)) await dbSetUserTag(id, r.results, blankId, tag);
      }
      local.removeAttempt(r.id);
      moved += 1;
    } catch (error) {
      console.warn('Could not move one report', error);
      break;
    }
  }
  return moved;
}
