-- Listening Coach database (v2).
-- Paste this whole file into the Supabase SQL Editor and press Run. It is safe to run again.
-- If you used the OLD version of this project, run cleanup-v2.sql ONCE first.
-- Row Level Security (RLS) is switched on for EVERY table: users only see their own data.

-- ============================================================ profiles

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Users may change only their name.
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

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

-- ============================================================ attempts and blank results
-- One attempt = one practice round on the clip. One blank_result = one blank in it.

create table if not exists public.attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clip_id       text not null,                        -- e.g. walk-with-me (the clip lives in the app code)
  level         int  not null check (level between 1 and 6),   -- 1 Easy, 2 Intermediate, 3 Hard
  replays       jsonb not null default '{}',                    -- replays used per sentence, e.g. {"s1": 1}
  points       numeric(6, 1) not null,
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

-- ============================================================ Compete quiz (Stage 20)

-- The 5 fictional competitors. Fixed scores, the same for everyone. Learners can only READ this table.
create table if not exists public.quiz_benchmarks (
  name       text primary key,
  score      int  not null check (score between 0 and 15),
  total      int  not null default 15,
  sort_order int  not null default 0
);
alter table public.quiz_benchmarks enable row level security;

drop policy if exists "quiz_benchmarks: read" on public.quiz_benchmarks;
create policy "quiz_benchmarks: read" on public.quiz_benchmarks
  for select to authenticated using (true);

insert into public.quiz_benchmarks (name, score, total, sort_order) values
  ('Minjun K.', 14, 15, 1),
  ('Sophie L.', 12, 15, 2),
  ('Daniel P.', 11, 15, 3),
  ('Hana S.', 11, 15, 4),
  ('Tomas R.', 8, 15, 5)
on conflict (name) do update
  set score = excluded.score, total = excluded.total, sort_order = excluded.sort_order;

-- ONE row per learner: only the latest completed quiz. A new result overwrites it (no history).
create table if not exists public.quiz_results (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  score      int  not null check (score between 0 and 15),
  total      int  not null default 15,
  percent    int  not null check (percent between 0 and 100),
  answers    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.quiz_results enable row level security;

drop policy if exists "quiz_results: own" on public.quiz_results;
create policy "quiz_results: own" on public.quiz_results
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
