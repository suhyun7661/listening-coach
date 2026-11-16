-- Listening Coach v2 cleanup (Stage 17). Run this ONCE in the Supabase SQL Editor, BEFORE schema.sql.
-- It is safe to run twice. It removes what v2 no longer uses:
--   Realtime, the room-based Competing tables and functions, the notebook table,
--   the clips and sentences tables, the admin rule, the video upload rules,
--   and the speed / accent / is_admin columns.
-- It KEEPS: profiles, attempts and blank_results (your practice records and reports) and all users.
-- The storage folders (buckets) "audio" and "videos" are NOT touched here: delete them by hand
-- in Supabase > Storage if you like (Supabase will not let SQL delete buckets that contain files).

-- 1) No Realtime
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_results') then
      alter publication supabase_realtime drop table public.challenge_results;
    end if;
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_members') then
      alter publication supabase_realtime drop table public.challenge_members;
    end if;
  end if;
end $$;

-- 2) Room-based Competing: tables, rules and functions
drop policy if exists "profiles: read room mates" on public.profiles;
drop table if exists public.challenge_runs cascade;
drop table if exists public.challenge_results cascade;
drop table if exists public.challenge_members cascade;
drop table if exists public.challenges cascade;
drop function if exists public.challenge_submit(uuid, text[]);
drop function if exists public.challenge_play(uuid);
drop function if exists public.challenge_start(uuid);
drop function if exists public.challenge_status(uuid);
drop function if exists public.create_challenge(text, text, int, text, int[]);
drop function if exists public.join_challenge(text);
drop function if exists public.add_creator_as_member();
drop function if exists public.is_challenge_member(uuid);
drop function if exists public.shares_challenge_with(uuid);
drop function if exists public.lc_token_word(text, int);
drop function if exists public.lc_grade(text, text);
drop function if exists public.lc_levenshtein(text, text);
drop function if exists public.lc_normalize(text);

-- 3) Notebook
drop table if exists public.notebook_items cascade;

-- 4) Admin, clips and sentences (the clip now lives in src/data/clips/walk-with-me.js)
drop policy if exists "videos: admin upload" on storage.objects;
drop policy if exists "videos: admin read" on storage.objects;
drop policy if exists "videos: admin update" on storage.objects;
drop policy if exists "videos: admin delete" on storage.objects;
alter table public.attempts drop constraint if exists attempts_clip_id_fkey;
drop table if exists public.sentences cascade;
drop table if exists public.clips cascade;
drop function if exists public.is_admin();

-- 5) Columns that are no longer used
alter table public.attempts drop column if exists speed;
alter table public.profiles drop column if exists accent;
alter table public.profiles drop column if exists is_admin;
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;
