import { supabase } from './supabase';
import * as local from './attemptStore';
import { dbGetAttempt, dbSaveAttempt, dbSetUserTag } from './attemptsDb';

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

// No id = the most recent report.
export async function getAttempt(user, id) {
  if (online(user) && (!id || UUID.test(id))) return dbGetAttempt(id);
  const found = local.loadAttempt(id);
  return found ? { ...found, where: 'browser' } : null;
}

// nextTags is keyed by sentence id: { s3: 'CS', ... }
export async function setUserTag(user, attempt, sentenceId, nextTags) {
  if (attempt.where === 'account' && online(user)) {
    await dbSetUserTag(attempt.id, sentenceId, nextTags[sentenceId]);
  } else {
    local.saveUserTags(attempt.id, nextTags);
  }
}
