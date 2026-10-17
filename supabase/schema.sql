-- Listening Coach database (Stage 8).
-- Paste this whole file into the Supabase SQL Editor and press Run. It is safe to run again.
-- Row Level Security (RLS) is switched on for EVERY table: users only see their own data,
-- and challenge results are visible only to people who joined that challenge room.

-- ============================================================ helpers

-- Is the signed-in user an admin? (Used by the clip/sentence write rules.)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  accent       text not null default 'US' check (accent in ('US', 'UK')),
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ============================================================ profiles

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may change only their name and accent, never is_admin.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, accent) on public.profiles to authenticated;

-- A profile is created automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Learner'));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================================ clips and sentences

create table if not exists public.clips (
  id          text primary key,                       -- e.g. holiday-pub-01
  source      text not null check (source in ('youtube', 'file')),
  video_id    text not null,                          -- YouTube id, or storage URL for files
  title       text not null,
  accent      text not null check (accent in ('US', 'UK')),
  difficulty  int  not null check (difficulty between 1 and 6),
  context_ko  text not null default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.sentences (
  id           uuid primary key default gen_random_uuid(),
  clip_id      text not null references public.clips(id) on delete cascade,
  sentence_id  text not null,                         -- s1, s2 ...
  position     int  not null,
  start_time   numeric(8, 2) not null,
  end_time     numeric(8, 2) not null,
  text         text not null,
  ko           text not null default '',
  key_words    jsonb not null default '[]',
  glosses      jsonb not null default '{}',
  tts_audio    jsonb not null default '{}',
  unique (clip_id, sentence_id),
  unique (clip_id, position),
  check (end_time > start_time)
);

alter table public.clips enable row level security;
alter table public.sentences enable row level security;

-- Everyone can read published clips. Only admins can add or change them.
drop policy if exists "clips: read published" on public.clips;
create policy "clips: read published" on public.clips
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists "clips: admin write" on public.clips;
create policy "clips: admin write" on public.clips
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sentences: read published" on public.sentences;
create policy "sentences: read published" on public.sentences
  for select to anon, authenticated
  using (public.is_admin() or exists (select 1 from public.clips c where c.id = clip_id and c.published));

drop policy if exists "sentences: admin write" on public.sentences;
create policy "sentences: admin write" on public.sentences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================ attempts and blank results

create table if not exists public.attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clip_id       text not null references public.clips(id),
  level         int  not null check (level between 1 and 6),
  speed         numeric(3, 2) not null default 1,
  points        numeric(6, 1) not null,
  total_blanks  int  not null,
  percent       int  not null check (percent between 0 and 100),
  created_at    timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at desc);

create table if not exists public.blank_results (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null references public.attempts(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sentence_id  text not null,
  blank_index  int  not null,
  answer       text not null,                         -- the correct word
  user_answer  text not null default '',
  status       text not null check (status in ('correct', 'almost', 'wrong', 'empty')),
  points       numeric(2, 1) not null,
  auto_tag     text check (auto_tag in ('CS', 'SP', 'V', 'AC', 'MI')),   -- our guess
  user_tag     text check (user_tag in ('CS', 'SP', 'V', 'AC', 'MI')),   -- the learner's choice
  unique (attempt_id, sentence_id, blank_index)
);
create index if not exists blank_results_user_idx on public.blank_results (user_id);

alter table public.attempts enable row level security;
alter table public.blank_results enable row level security;

drop policy if exists "attempts: own" on public.attempts;
create policy "attempts: own" on public.attempts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "blank_results: own" on public.blank_results;
create policy "blank_results: own" on public.blank_results
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid())
  );

-- After grading, only the learner's tag choice may change.
revoke update on public.blank_results from anon, authenticated;
grant update (user_tag) on public.blank_results to authenticated;

-- ============================================================ notebook (spaced repetition)

create table if not exists public.notebook_items (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clip_id           text references public.clips(id) on delete set null,
  sentence_id       text,
  word              text not null,
  ko                text not null default '',
  note              text not null default '',
  tag               text check (tag in ('CS', 'SP', 'V', 'AC', 'MI')),
  review_step       int  not null default 0,          -- 0 = new, then 1 day, 3 days, 7 days
  next_review_at    timestamptz not null default now(),
  last_reviewed_at  timestamptz,
  created_at        timestamptz not null default now(),
  unique (user_id, clip_id, sentence_id, word)
);
create index if not exists notebook_due_idx on public.notebook_items (user_id, next_review_at);

alter table public.notebook_items enable row level security;

drop policy if exists "notebook: own" on public.notebook_items;
create policy "notebook: own" on public.notebook_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================ challenges (Competing mode)

create table if not exists public.challenges (
  id                  uuid primary key default gen_random_uuid(),
  room_code           text not null unique check (room_code ~ '^[0-9]{6}$'),
  created_by          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clip_id             text not null references public.clips(id),
  sentence_id         text not null,
  level               int  not null check (level between 1 and 6),
  label               text not null default '' check (char_length(label) <= 60),  -- text only, never money
  max_plays           int  not null default 3,
  time_limit_seconds  int  not null default 60,
  created_at          timestamptz not null default now()
);

create table if not exists public.challenge_members (
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table if not exists public.challenge_results (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.challenges(id) on delete cascade,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  answers         jsonb not null default '[]',
  correct_blanks  numeric(5, 1) not null,
  total_blanks    int not null,
  accuracy        numeric(5, 2) not null,
  plays           int not null,                       -- counted on the server (Stage 14)
  elapsed_ms      int not null,                       -- timed on the server (Stage 14)
  submitted_at    timestamptz not null default now(),
  unique (challenge_id, user_id)                      -- one attempt only
);

alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.challenge_results enable row level security;

create or replace function public.is_challenge_member(cid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.challenge_members where challenge_id = cid and user_id = auth.uid())
$$;

-- True when the other user is in at least one challenge room with the signed-in user.
create or replace function public.shares_challenge_with(other uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from public.challenge_members a
    join public.challenge_members b on a.challenge_id = b.challenge_id
    where a.user_id = auth.uid() and b.user_id = other
  )
$$;

-- Room members can see each other's name on the leaderboard.
drop policy if exists "profiles: read room mates" on public.profiles;
create policy "profiles: read room mates" on public.profiles
  for select to authenticated using (public.shares_challenge_with(id));

drop policy if exists "challenges: read as member" on public.challenges;
create policy "challenges: read as member" on public.challenges
  for select to authenticated using (created_by = auth.uid() or public.is_challenge_member(id));

-- Rooms are created only through create_challenge() (Stage 14), which checks everything.
drop policy if exists "challenges: create own" on public.challenges;

drop policy if exists "challenges: delete own" on public.challenges;
create policy "challenges: delete own" on public.challenges
  for delete to authenticated using (created_by = auth.uid());

drop policy if exists "members: read same room" on public.challenge_members;
create policy "members: read same room" on public.challenge_members
  for select to authenticated using (public.is_challenge_member(challenge_id));

drop policy if exists "members: leave" on public.challenge_members;
create policy "members: leave" on public.challenge_members
  for delete to authenticated using (user_id = auth.uid());

-- Results are visible to room members. There is deliberately NO insert/update policy:
-- results are written by server functions that count plays and time (added in Stage 14).
drop policy if exists "results: read as member" on public.challenge_results;
create policy "results: read as member" on public.challenge_results
  for select to authenticated using (public.is_challenge_member(challenge_id));

-- The person who creates a room is automatically a member.
create or replace function public.add_creator_as_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.challenge_members (challenge_id, user_id) values (new.id, new.created_by)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_challenge_created on public.challenges;
create trigger on_challenge_created
  after insert on public.challenges for each row execute function public.add_creator_as_member();

-- Joining a room by its code (the only way to become a member).
create or replace function public.join_challenge(code text)
returns public.challenges language plpgsql security definer set search_path = public as $$
declare c public.challenges;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  select * into c from public.challenges where room_code = code;
  if not found then raise exception 'Room not found'; end if;
  insert into public.challenge_members (challenge_id, user_id) values (c.id, auth.uid())
  on conflict do nothing;
  return c;
end $$;

-- Functions are open to everyone by default; only signed-in users may call these.
revoke all on function public.join_challenge(text) from public, anon;
grant execute on function public.join_challenge(text) to authenticated;
-- is_admin() only answers yes/no about the caller, and clip rules need it for visitors too.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on function public.is_challenge_member(uuid) from public, anon;
grant execute on function public.is_challenge_member(uuid) to authenticated;
revoke all on function public.shares_challenge_with(uuid) from public, anon;
grant execute on function public.shares_challenge_with(uuid) to authenticated;

-- Live leaderboard (Stage 14) listens to new results.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_results') then
    alter publication supabase_realtime add table public.challenge_results;
  end if;
end $$;

-- ============================================================ Stage 14: Competing mode rules
-- Everything that must be fair is decided HERE on the server, not in the browser:
-- how many plays, the 60 seconds, one attempt, and the grading.

alter table public.challenges add column if not exists blank_indexes int[] not null default '{}';

-- One row per player per room: when they pressed Start and how many plays they used.
create table if not exists public.challenge_runs (
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at    timestamptz not null default now(),
  plays         int not null default 0,
  finished      boolean not null default false,
  primary key (challenge_id, user_id)
);
alter table public.challenge_runs enable row level security;

drop policy if exists "runs: read own" on public.challenge_runs;
create policy "runs: read own" on public.challenge_runs
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.challenge_runs from anon, authenticated;

-- ---- grading helpers (same rules as the website's grading code)
create or replace function public.lc_normalize(t text)
returns text language sql immutable as $$
  select btrim(regexp_replace(regexp_replace(lower(replace(replace(coalesce(t, ''), '’', ''''), '‘', '''')), '[^a-z0-9'' ]+', ' ', 'g'), '\s+', ' ', 'g'))
$$;

create or replace function public.lc_levenshtein(a text, b text)
returns int language plpgsql immutable as $$
declare la int := length(a); lb int := length(b); prev int[]; cur int[]; i int; j int; cost int;
begin
  if la = 0 then return lb; end if;
  if lb = 0 then return la; end if;
  prev := array(select generate_series(0, lb));
  for i in 1..la loop
    cur := array[i];
    for j in 1..lb loop
      cost := case when substr(a, i, 1) = substr(b, j, 1) then 0 else 1 end;
      cur[j + 1] := least(prev[j + 1] + 1, cur[j] + 1, prev[j] + cost);
    end loop;
    prev := cur;
  end loop;
  return prev[lb + 1];
end $$;

-- 1 = correct, 0.5 = one-letter typo on a word of 5+ letters, 0 = wrong or empty
create or replace function public.lc_grade(answer text, correct text)
returns numeric language plpgsql immutable as $$
declare a text := public.lc_normalize(answer); c text := public.lc_normalize(correct); sa text; sc text; same boolean;
begin
  if a = '' then return 0; end if;
  sa := replace(a, '''', ''); sc := replace(c, '''', '');
  if a = c or sa = sc then return 1; end if;
  same := case c
       when 'i''m' then a = 'i am'
       when 'you''re' then a = 'you are'
       when 'we''re' then a = 'we are'
       when 'they''re' then a = 'they are'
       when 'it''s' then a = 'it is'
       when 'that''s' then a = 'that is'
       when 'don''t' then a = 'do not'
       when 'didn''t' then a = 'did not'
       when 'can''t' then a in ('cannot', 'can not')
       when 'won''t' then a = 'will not'
       when 'isn''t' then a = 'is not'
       when 'gonna' then a = 'going to'
       when 'wanna' then a = 'want to'
       when 'gotta' then a = 'got to'
       when 'okay' then a = 'ok'
       when 'ok' then a = 'okay'
       else false end;
  if same then return 1; end if;
  if length(c) >= 5 and public.lc_levenshtein(sa, sc) = 1 then return 0.5; end if;
  return 0;
end $$;

-- The word at position idx of a sentence (position counted like the website does), or null.
create or replace function public.lc_token_word(sentence text, idx int)
returns text language sql immutable as $$
  select substring((regexp_split_to_array(btrim(sentence), '\s+'))[idx + 1] from '^[^A-Za-z0-9''’]*([A-Za-z0-9''’-]+)[^A-Za-z0-9''’]*$')
$$;

-- ---- create a room (the website picks the blanks; the server checks them)
create or replace function public.create_challenge(p_clip text, p_sentence text, p_level int, p_label text, p_blank_indexes int[])
returns public.challenges language plpgsql security definer set search_path = public as $$
declare s public.sentences; c public.challenges; code text; tries int := 0; idx int;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  select se.* into s from public.sentences se join public.clips cl on cl.id = se.clip_id
   where se.clip_id = p_clip and se.sentence_id = p_sentence and cl.published;
  if not found then raise exception 'That sentence does not exist'; end if;
  if p_level not between 1 and 6 then raise exception 'Level must be 1 to 6'; end if;
  if char_length(coalesce(p_label, '')) > 60 then raise exception 'The label is too long (60 characters)'; end if;
  if p_blank_indexes is null or cardinality(p_blank_indexes) not between 1 and 40 then raise exception 'Invalid blanks'; end if;
  if (select count(distinct x) from unnest(p_blank_indexes) x) <> cardinality(p_blank_indexes) then raise exception 'Invalid blanks'; end if;
  foreach idx in array p_blank_indexes loop
    if idx < 0 or public.lc_token_word(s.text, idx) is null then raise exception 'Invalid blanks'; end if;
  end loop;
  loop
    code := lpad(floor(random() * 1000000)::int::text, 6, '0');
    begin
      insert into public.challenges (room_code, clip_id, sentence_id, level, label, blank_indexes)
      values (code, p_clip, p_sentence, p_level, coalesce(p_label, ''), p_blank_indexes)
      returning * into c;
      exit;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 10 then raise exception 'Could not make a room code, please try again'; end if;
    end;
  end loop;
  return c;
end $$;

-- ---- where am I in this room? (never changes anything)
create or replace function public.challenge_status(p_challenge uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.challenges; r public.challenge_runs; res public.challenge_results;
begin
  if not public.is_challenge_member(p_challenge) then raise exception 'You are not in this room'; end if;
  select * into c from public.challenges where id = p_challenge;
  select * into r from public.challenge_runs where challenge_id = p_challenge and user_id = auth.uid();
  select * into res from public.challenge_results where challenge_id = p_challenge and user_id = auth.uid();
  return json_build_object(
    'now', now(), 'started', r.challenge_id is not null, 'started_at', r.started_at,
    'plays', coalesce(r.plays, 0), 'max_plays', c.max_plays, 'time_limit_seconds', c.time_limit_seconds,
    'finished', coalesce(r.finished, false) or res.id is not null);
end $$;

-- ---- Start: the 60 seconds begin now, on the server's clock. Pressing it again changes nothing.
create or replace function public.challenge_start(p_challenge uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_challenge_member(p_challenge) then raise exception 'You are not in this room'; end if;
  insert into public.challenge_runs (challenge_id, user_id) values (p_challenge, auth.uid()) on conflict do nothing;
  return public.challenge_status(p_challenge);
end $$;

-- ---- Play: the server counts it. Refused after the last play or when time is up.
create or replace function public.challenge_play(p_challenge uuid)
returns json language plpgsql security definer set search_path = public as $$
declare c public.challenges; r public.challenge_runs;
begin
  if not public.is_challenge_member(p_challenge) then raise exception 'You are not in this room'; end if;
  select * into c from public.challenges where id = p_challenge;
  select * into r from public.challenge_runs where challenge_id = p_challenge and user_id = auth.uid() for update;
  if not found then raise exception 'Press Start first'; end if;
  if r.finished then raise exception 'You already finished'; end if;
  if now() > r.started_at + make_interval(secs => c.time_limit_seconds + 1) then raise exception 'Time is up'; end if;
  if r.plays >= c.max_plays then raise exception 'No plays left'; end if;
  update public.challenge_runs set plays = plays + 1 where challenge_id = p_challenge and user_id = auth.uid();
  return json_build_object('plays', r.plays + 1, 'max_plays', c.max_plays);
end $$;

-- ---- Submit: graded and timed on the server. Only one attempt is ever stored.
create or replace function public.challenge_submit(p_challenge uuid, p_answers text[])
returns json language plpgsql security definer set search_path = public as $$
declare c public.challenges; r public.challenge_runs; s public.sentences; res public.challenge_results;
        elapsed interval; late boolean; n int; i int; pts numeric := 0; ans text;
begin
  if not public.is_challenge_member(p_challenge) then raise exception 'You are not in this room'; end if;
  select * into c from public.challenges where id = p_challenge;
  select * into r from public.challenge_runs where challenge_id = p_challenge and user_id = auth.uid() for update;
  if not found then raise exception 'Press Start first'; end if;
  select * into res from public.challenge_results where challenge_id = p_challenge and user_id = auth.uid();
  if found then return to_json(res); end if;

  elapsed := now() - r.started_at;
  late := elapsed > make_interval(secs => c.time_limit_seconds + 5);   -- 5 seconds of network slack
  select * into s from public.sentences where clip_id = c.clip_id and sentence_id = c.sentence_id;
  n := cardinality(c.blank_indexes);
  for i in 1..n loop
    ans := case when late then '' else coalesce(p_answers[i], '') end;
    pts := pts + public.lc_grade(ans, public.lc_token_word(s.text, c.blank_indexes[i]));
  end loop;

  insert into public.challenge_results (challenge_id, user_id, answers, correct_blanks, total_blanks, accuracy, plays, elapsed_ms)
  values (p_challenge, auth.uid(), to_jsonb(case when late then array[]::text[] else p_answers end), pts, n,
          round(pts / n * 100, 2), r.plays,
          least(floor(extract(epoch from elapsed) * 1000), c.time_limit_seconds * 1000)::int)
  returning * into res;
  update public.challenge_runs set finished = true where challenge_id = p_challenge and user_id = auth.uid();
  return to_json(res);
end $$;

-- Only signed-in people may call the room functions.
revoke all on function public.create_challenge(text, text, int, text, int[]) from public, anon;
revoke all on function public.challenge_status(uuid) from public, anon;
revoke all on function public.challenge_start(uuid) from public, anon;
revoke all on function public.challenge_play(uuid) from public, anon;
revoke all on function public.challenge_submit(uuid, text[]) from public, anon;
grant execute on function public.create_challenge(text, text, int, text, int[]) to authenticated;
grant execute on function public.challenge_status(uuid) to authenticated;
grant execute on function public.challenge_start(uuid) to authenticated;
grant execute on function public.challenge_play(uuid) to authenticated;
grant execute on function public.challenge_submit(uuid, text[]) to authenticated;

-- The live leaderboard also listens for people joining the room.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'challenge_members') then
    alter publication supabase_realtime add table public.challenge_members;
  end if;
end $$;
