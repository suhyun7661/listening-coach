# Supabase setup (Stage 8)

1. Create a free project at https://supabase.com (Dashboard > New project).
2. Open **SQL Editor > New query**, paste all of `schema.sql`, press **Run**.
3. New query again, paste all of `seed.sql` (the 5 sample clips), press **Run**.
4. Copy `.env.example` to `.env` and paste the Project URL and the **anon public** key
   (Project Settings > API). Never use or share the `service_role` key.

`seed.sql` is generated: after changing clips in `src/data/clips`, run `npm run make:seed`.

## Tables
profiles, clips, sentences, attempts, blank_results (auto_tag + user_tag), notebook_items,
challenges, challenge_members, challenge_results. Row Level Security is on for every table.
