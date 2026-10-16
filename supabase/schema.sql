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

drop policy if exists "challenges: create own" on public.challenges;
create policy "challenges: create own" on public.challenges
  for insert to authenticated with check (created_by = auth.uid());

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
