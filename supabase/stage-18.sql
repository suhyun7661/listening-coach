-- Stage 18: save how many replays were used in each sentence.
-- Paste into the Supabase SQL Editor and press Run. Safe to run twice.
-- Example of what gets saved in "replays": {"s1": 1, "s2": 0, "s7": 3}
alter table public.attempts add column if not exists replays jsonb not null default '{}';

-- The app now has 3 levels (1 Easy, 2 Intermediate, 3 Hard). Old rows with levels 4-6 stay as they are.
