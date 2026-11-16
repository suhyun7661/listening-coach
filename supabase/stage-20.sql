-- Stage 20: Compete Mode (quiz). Paste into the Supabase SQL Editor and press Run. Safe to run twice.
-- Row Level Security is on for both tables.

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
