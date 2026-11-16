-- Four mistake categories: CS Connected Speech, SP Speed, V Vocabulary, MI Main Idea.
-- Safe migration for a database that already holds reports with the old seven categories.
-- Paste into the Supabase SQL Editor and press Run. Safe to run twice. Nothing is deleted.
--
--   UE (Unfamiliar Expression) -> V (Vocabulary)       the learner's meaning is kept
--   AC (Accent), OT (Other)    -> empty                 the sentence shows "not confirmed yet" and the learner picks again
--   Every changed value is copied to blank_results_tag_backup first, so it can be restored.

-- 1. Backup of every row that is about to change (clients cannot read it: RLS on, no policy).
create table if not exists public.blank_results_tag_backup (
  blank_result_id uuid primary key,
  old_auto_tag    text,
  old_user_tag    text,
  saved_at        timestamptz not null default now()
);
alter table public.blank_results_tag_backup enable row level security;

insert into public.blank_results_tag_backup (blank_result_id, old_auto_tag, old_user_tag)
select id, auto_tag, user_tag
from public.blank_results
where auto_tag in ('UE', 'AC', 'OT') or user_tag in ('UE', 'AC', 'OT')
on conflict (blank_result_id) do nothing;

-- 2. Remove the old checks (the new ones need the old values gone first).
alter table public.blank_results drop constraint if exists blank_results_auto_tag_check;
alter table public.blank_results drop constraint if exists blank_results_user_tag_check;

-- 3. Convert the saved values.
update public.blank_results set auto_tag = 'V'  where auto_tag = 'UE';
update public.blank_results set user_tag = 'V'  where user_tag = 'UE';
update public.blank_results set auto_tag = null where auto_tag in ('AC', 'OT');
update public.blank_results set user_tag = null where user_tag in ('AC', 'OT');

-- 4. Only the four categories are allowed from now on.
alter table public.blank_results
  add constraint blank_results_auto_tag_check check (auto_tag in ('CS', 'SP', 'V', 'MI'));
alter table public.blank_results
  add constraint blank_results_user_tag_check check (user_tag in ('CS', 'SP', 'V', 'MI'));

-- To undo (only if needed): drop the two constraints, then
--   update public.blank_results b set auto_tag = k.old_auto_tag, user_tag = k.old_user_tag
--   from public.blank_results_tag_backup k where k.blank_result_id = b.id;
