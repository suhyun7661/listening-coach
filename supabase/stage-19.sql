-- Review Report update: seven mistake categories.
-- CS Connected Speech, SP Speed, UE Unfamiliar Expression, V Vocabulary, AC Accent, MI Main Idea, OT Other.
-- Paste into the Supabase SQL Editor and press Run. Safe to run twice.
-- auto_tag = the app's suggestion. user_tag = the category the learner confirmed (stored separately).
alter table public.blank_results drop constraint if exists blank_results_auto_tag_check;
alter table public.blank_results drop constraint if exists blank_results_user_tag_check;
alter table public.blank_results
  add constraint blank_results_auto_tag_check check (auto_tag in ('CS', 'SP', 'UE', 'V', 'AC', 'MI', 'OT'));
alter table public.blank_results
  add constraint blank_results_user_tag_check check (user_tag in ('CS', 'SP', 'UE', 'V', 'AC', 'MI', 'OT'));
